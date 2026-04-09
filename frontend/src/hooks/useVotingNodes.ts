import { useState, useCallback, useEffect } from 'react';
import { VotingBooth, UserLocation } from '../components/map/types';

export const useVotingNodes = (initialNodes: VotingBooth[], userLocationData: UserLocation) => {
    const [nodes] = useState<VotingBooth[]>(initialNodes);
    const [activeNodes, setActiveNodes] = useState<string[]>([]);

    useEffect(() => {
        // Initially set all nodes as active for demo purposes
        setActiveNodes(initialNodes.filter(n => n.status === 'active').map(n => n.id));
    }, [initialNodes]);

    const updateNodes = useCallback((updatedNodeIds: string[]) => {
        setActiveNodes(prev => {
            // Create some fluctuation by replacing a few active nodes or just toggling
            const newActive = new Set(prev);
            updatedNodeIds.forEach(id => {
                if (newActive.has(id)) {
                    // randomly turn some off, but keep mostly on
                    if (Math.random() > 0.8 && id !== userLocationData.booth.id) {
                        newActive.delete(id);
                    }
                } else {
                    newActive.add(id);
                }
            });
            // Ensure user booth is always active
            newActive.add(userLocationData.booth.id);
            return Array.from(newActive);
        });
    }, [userLocationData]);

    return {
        nodes,
        activeNodes,
        userBooth: userLocationData.booth,
        updateNodes
    };
};
