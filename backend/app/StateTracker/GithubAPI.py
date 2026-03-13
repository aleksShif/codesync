import requests
import base64
import re
from collections import OrderedDict
from dataclasses import dataclass
from .FileStates import PatchEvent
from intervaltree import Interval

class LRUCache:
    def __init__(self, maxsize=1000):
        self.cache = OrderedDict()
        self.maxsize = maxsize

    def get(self, key):
        if key in self.cache:
            self.cache.move_to_end(key)
            return self.cache[key]
        return None

    def put(self, key, value):
        self.cache[key] = value
        self.cache.move_to_end(key)
        if len(self.cache) > self.maxsize:
            self.cache.popitem(last=False)

@dataclass(frozen=True)
class File:
    owner: str
    repo: str
    branch: str
    path: str
    base_commit: str
    
class GithubAPI:
    def __init__(self, maxsize=1000, token=None):
        self.token = token
        self.latest_commits = LRUCache(maxsize) # (owner, repo, branch, path) -> sha
        self.default_branches = LRUCache(maxsize) # (owner, repo) -> branch_name
        self.branch_diffs = LRUCache(maxsize) # (owner, repo, base_ref, head_ref) -> diff_map

    async def get_default_branch(self, db, owner: str, repo: str):
        key = (owner, repo)
        cached = self.default_branches.get(key)
        if cached:
            return cached

        from app.db.models.models import Repository as DBRepo
        from sqlalchemy import select
        
        repo_full_name = f"{owner}/{repo}"
        stmt = select(DBRepo.repo_default_branch).where(DBRepo.repo_name == repo_full_name)
        result = await db.execute(stmt)
        default_branch = result.scalar_one_or_none() or "main" # Fallback to main
        
        self.default_branches.put(key, default_branch)
        return default_branch

    async def get_latest_commit_hash(self, db, owner: str, repo: str, branch: str, path: str):
        key = (owner, repo, branch, path)

        if self.latest_commits.get(key) is not None:
            return self.latest_commits.get(key)
            
        from app.db.models.models import File as DBFile, Branch as DBBranch, Repository as DBRepo
        from sqlalchemy import select
        
        # Repository names are stored as "owner/repo" in repo_name
        repo_full_name = f"{owner}/{repo}"
        stmt = (
            select(DBFile.file_latest_commit)
            .join(DBBranch, DBFile.branch_id == DBBranch.branch_id)
            .join(DBRepo, DBBranch.repository_id == DBRepo.repository_id)
            .where(
                DBRepo.repo_name == repo_full_name, 
                DBBranch.branch_name == branch,
                DBFile.file_path == path
            )
        )
        result = await db.execute(stmt)
        sha = result.scalar_one_or_none()
        
        if sha:
            self.latest_commits.put(key, sha)
            
        return sha

    def update_latest_commit(self, owner: str, repo: str, branch: str, path: str, sha: str):
        key = (owner, repo, branch, path)
        self.latest_commits.put(key, sha)

    def get_branch_diff(self, owner: str, repo_name: str, base_ref: str, head_ref: str, repo, latest_commit_sha: str):
        """
        Fetches structural diff and updates the Repo state with synthetic patches.
        """
        key = (owner, repo_name, base_ref, head_ref)

        # 1. Fetch from GitHub (if not in shared API cache)
        diff_map = self.branch_diffs.get(key)

        if not diff_map:
            url = f"https://api.github.com/repos/{owner}/{repo_name}/compare/{base_ref}...{head_ref}"
            headers = {"Accept": "application/vnd.github+json"}
            if self.token:
                headers["Authorization"] = f"Bearer {self.token}"

            r = requests.get(url, headers=headers)
            if r.status_code != 200:
                return {}

            data = r.json()
            diff_map = {}
            for file_obj in data.get("files", []):
                patch_str = file_obj.get("patch")
                if not patch_str: continue
                
                ranges = []
                for match in re.finditer(r"^@@ -(\d+)(?:,(\d+))? \+\d+(?:,\d+)? @@", patch_str, re.MULTILINE):
                    start = int(match.group(1))
                    length = int(match.group(2)) if match.group(2) else 1
                    ranges.append((start, start + length if length > 0 else start + 1))
                diff_map[file_obj["filename"]] = ranges
            
            self.branch_diffs.put(key, diff_map)
        else:
            # Check if this branch is already loaded in the Repo object trees
            # If github-commit for this branch has any files, assume it's loaded.
            # (Alternatively, we could bring back loaded_branches set in Repo)
            if "github-commit" in repo.dev_intervals and head_ref in repo.dev_intervals["github-commit"]:
                if repo.dev_intervals["github-commit"][head_ref]:
                    return diff_map

        # 2. Update Repo state (Pass by reference)
        # First, purge any EXISTING github-commit intervals for this branch
        if "github-commit" in repo.dev_intervals and head_ref in repo.dev_intervals["github-commit"]:
            for path, intervals in list(repo.dev_intervals["github-commit"][head_ref].items()):
                for ival in list(intervals):
                    repo.files[path].discard(ival)
            repo.dev_intervals["github-commit"][head_ref].clear()

        # Add fresh intervals
        for path, ranges in diff_map.items():
            for start, end in ranges:
                commit_patch = PatchEvent(
                    dev_id="github-commit",
                    base_commit=latest_commit_sha,
                    branch=head_ref,
                    timestamp=0,
                    patch_text="",
                    author="GitHub",
                    touched_ranges=((start, end),)
                )
                ival = Interval(start, end, commit_patch)
                repo.files[path].add(ival)
                repo.dev_intervals["github-commit"][head_ref][path].add(ival)
            
        return diff_map

    def clear_all_repo_diffs(self, owner: str, repo_name: str, repo):
        """Invalidate all comparison caches for a specific repository and purge intervals."""
        stale_keys = [k for k in list(self.branch_diffs.cache.keys()) if k[0] == owner and k[1] == repo_name]
        for k in stale_keys:
            branch_name = k[3]
            
            # Clear intervals from trees
            if "github-commit" in repo.dev_intervals and branch_name in repo.dev_intervals["github-commit"]:
                for path, intervals in list(repo.dev_intervals["github-commit"][branch_name].items()):
                    for ival in list(intervals):
                        repo.files[path].discard(ival)
                repo.dev_intervals["github-commit"][branch_name].clear()

            if k in self.branch_diffs.cache:
                del self.branch_diffs.cache[k]
