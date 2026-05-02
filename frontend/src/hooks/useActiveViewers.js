// import { useState, useEffect } from 'react';
// import { BACK_URL } from '../api';

// export function useActiveViewers(repoDetails) {
//   // const [activeUsers, setActiveUsers] = useState([]);

//   // useEffect(() => {
//   //   if (!repoDetails || !repoDetails.repo) return;

//   //   // Convert http(s) URL to ws(s)
//   //   const wsUrl = BACK_URL.replace(/^http/, 'ws') + 'developer-updates';
//   //   const socket = new WebSocket(wsUrl);

//   //   socket.onmessage = (event) => {
//   //     const data = JSON.parse(event.data);
      
//   //     // Handle the incoming updates from the backend
//   //     if (data.type === 'patch_update' || data.type === 'branch_update') {
//   //       // In a real implementation, you would likely fetch the updated 
//   //       // list of active developers for this specific repo/branch.
//   //       // For now, we can update the local state if the message contains user info.
//   //       if (data.author) {
//   //         setActiveUsers(prev => {
//   //           const exists = prev.find(u => u.id === data.dev_id);
//   //           if (exists) return prev;
//   //           return [...prev, {
//   //             id: data.dev_id,
//   //             name: data.author,
//   //             initials: data.author.substring(0, 1).toUpperCase(),
//   //             color: 'bg-purple-500' // Default theme color
//   //           }];
//   //         });
//   //       }
//   //     }
//   //   };

//   //   socket.onerror = (err) => console.error('WebSocket Error:', err);

//   //   return () => {
//   //     socket.close();
//   //   };
//   // }, [repoDetails]);

//   const [activeUsers, setActiveUsers] = useState([]);

//   useEffect(() => {
//     if (!repoDetails) return;

//     const mockUsers = [
//       { id: '1', name: 'Alex', color: 'bg-blue-500', initials: 'A' },
//       { id: '2', name: 'Sam', color: 'bg-emerald-500', initials: 'S' },
//       { id: '3', name: 'Taylor', color: 'bg-purple-500', initials: 'T' },
//       { id: '4', name: 'Jordan', color: 'bg-amber-500', initials: 'J' },
//     ];

//     return () => {
//     };
//   }, [repoDetails]);

//   return activeUsers;
// }