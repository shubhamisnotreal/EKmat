import { useState, useEffect } from 'react';

export const useRealTimeUpdates = (enabled: boolean) => {
    const [realTimeData, setRealTimeData] = useState<string[] | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setIsConnected(false);
            return;
        }

        setIsConnected(true);

        // Simulate real-time updates every 15 seconds
        const interval = setInterval(() => {
            import('../data/voting-booths.json').then((module) => {
                const allNodes = module.default || module;
                // pick 10 random nodes to send as "updated" payload
                const updatedIds: string[] = [];
                for (let i = 0; i < 10; i++) {
                    const id = allNodes[Math.floor(Math.random() * allNodes.length)].id;
                    updatedIds.push(id);
                }
                setRealTimeData(updatedIds);
            });
        }, 15000);

        return () => clearInterval(interval);
    }, [enabled]);

    return { realTimeData, isConnected };
};
