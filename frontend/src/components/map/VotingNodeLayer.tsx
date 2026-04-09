import React from 'react';
import { Marker } from 'react-simple-maps';
import { motion } from 'framer-motion';
import { VotingBooth } from './types';

interface VotingNodeLayerProps {
    nodes: VotingBooth[];
    activeNodes: string[];
    userBooth: VotingBooth;
    hoveredNode: VotingBooth | null;
    onNodeHover: (node: VotingBooth | null) => void;
    onNodeClick: (node: VotingBooth) => void;
    viewLevel: 'india' | 'state' | 'city';
}

const VotingNodeLayer: React.FC<VotingNodeLayerProps> = ({
    nodes,
    activeNodes,
    userBooth,
    hoveredNode,
    onNodeHover,
    onNodeClick
}) => {
    const getNodeSize = (nodeId: string, isHovered: boolean) => {
        if (nodeId === userBooth.id) return isHovered ? 16 : 12;
        return isHovered ? 12 : 8;
    };

    const isActive = (nodeId: string) => activeNodes.includes(nodeId);

    return (
        <>
            {nodes.map((node) => {
                const isUserBooth = node.id === userBooth.id;
                const isHovered = hoveredNode?.id === node.id;
                const nodeActive = isActive(node.id);

                // Hide regular nodes if not active (unless hovered or user booth) depending on design choice
                // Actually specs say inactive is gray, so we render all.

                return (
                    <Marker
                        key={node.id}
                        coordinates={[node.longitude, node.latitude]}
                        onMouseEnter={() => onNodeHover(node)}
                        onMouseLeave={() => onNodeHover(null)}
                        onClick={() => onNodeClick(node)}
                    >
                        {/* MAIN NODE CIRCLE */}
                        <motion.circle
                            r={getNodeSize(node.id, isHovered)}
                            fill={
                                isUserBooth
                                    ? '#F59E0B'
                                    : nodeActive
                                        ? '#10B981'
                                        : '#9CA3AF'
                            }
                            stroke={isUserBooth ? '#FBBF24' : 'white'}
                            strokeWidth={isUserBooth ? 2 : 1}
                            style={{
                                filter: `drop-shadow(0 ${isUserBooth ? 4 : 2}px ${isUserBooth ? 12 : 8}px rgba(${isUserBooth ? '245, 158, 11' : nodeActive ? '16, 185, 129' : '156, 163, 175'
                                    }, 0.5))`
                            }}
                            animate={{
                                scale: isHovered ? 1.2 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                        />

                        {isUserBooth && (
                            <text textAnchor="middle" y="3" fontSize="8" fill="white" fontWeight="bold">!</text>
                        )}
                    </Marker>
                );
            })}
        </>
    );
};

export default VotingNodeLayer;
