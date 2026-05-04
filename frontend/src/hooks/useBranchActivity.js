import { useState, useEffect } from 'react';
import { BACK_URL } from '../api';

export function useBranchActivity(repoId, branchName) {
    const [activeDevs, setActiveDevs] = useState({});

    useEffect(() => {
        if (!repoId || !branchName) return;

        // Establish the SSE connection
        const eventSource = new EventSource(
            `${BACK_URL}activity/repos/${repoId}/stream/${branchName}`,
            { withCredentials: true }
        );

        eventSource.onopen = () => console.log('SSE branch stream connected');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Message received, attempting to display active devs'); 
                if (data.type === 'activity_snapshot') {
                    setActiveDevs(data.active_devs || {});
                }
                // Extract the specific branch mapping, fallback to empty object
                console.log('Devs displayed: ', data.active_devs); 
            } catch (err) {
                console.error('Failed to parse activity stream:', err);
            }
        };

        eventSource.onerror = (err) => console.error('SSE error:', err);

        return () => eventSource.close();
    }, [repoId, branchName]);

    return activeDevs;
}