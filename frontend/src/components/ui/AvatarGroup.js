import React, { useState } from 'react';

export function AvatarGroup({ users, size = 'md', maxDisplay = 3 }) {
    const [showDropdown, setShowDropdown] = useState(false);

    if (!users || users.length === 0) return null;

    const displayUsers = users.slice(0, maxDisplay);
    const hiddenUsers = users.slice(maxDisplay);
    const extraCount = hiddenUsers.length;

    // Dynamic sizing to keep it modular for graph nodes vs header
    const sizeClasses = size === 'sm' ? 'h-5 w-5 text-[9px]' : 'h-8 w-8 text-xs';
    const ringClass = size === 'sm' ? 'ring-1' : 'ring-2';
    const dropdownTop = size === 'sm' ? 'top-8' : 'top-12';

    return (
        <div className="relative flex items-center">
            {/* Overlapping Avatars */}
            <div className="flex -space-x-2">
                {displayUsers.map((user) => {
                    // Normalize the data (handles both mock users and live SSE 'dev_id' payloads)
                    //const id = user.id || user.dev_id;
                    const name = user.name || user.author;
                    const initials = user.initials || name.substring(0, 2).toUpperCase();
                    const color = user.color || 'bg-purple-600'; // Default to theme

                    return (
                        <div
                            key={name}
                            className={`group relative flex ${sizeClasses} cursor-pointer items-center justify-center rounded-full font-bold text-white ${ringClass} ring-slate-900 transition-transform hover:z-10 hover:-translate-y-1 ${color}`}
                        >
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={name}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                initials
                            )}

                            {/* Hover Tooltip */}
                            <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-purple-500/30 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-purple-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                {name}
                            </div>
                        </div>
                    );
                })}

                {/* Interactive Overflow Badge */}
                {extraCount > 0 && (
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`relative z-0 flex ${sizeClasses} cursor-pointer items-center justify-center rounded-full bg-purple-900/40 font-bold text-purple-200 ${ringClass} ring-slate-900 transition-colors hover:bg-purple-800/60 focus:outline-none`}
                    >
                        +{extraCount}
                    </button>
                )}
            </div>

            {/* Dropdown Menu for Hidden Users */}
            {showDropdown && extraCount > 0 && (
                <div className={`absolute right-0 ${dropdownTop} z-20 w-48 overflow-hidden rounded-md border border-purple-500/20 bg-slate-800 shadow-xl ring-1 ring-black/5`}>
                    <div className="bg-slate-900/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Other Viewers
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                        {hiddenUsers.map((user) => {
                            // const id = user.id || user.dev_id;
                            const name = user.name || user.author;
                            const initials = user.initials || name.substring(0, 2).toUpperCase();
                            const color = user.color || 'bg-purple-600';

                            return (
                                <div
                                    key={name}
                                    className="flex items-center px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-700/50"
                                >
                                    <div className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${color}`}>
                                        {initials}
                                    </div>
                                    {name}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}