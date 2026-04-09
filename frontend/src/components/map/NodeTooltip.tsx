import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VotingBooth } from './types';

interface NodeTooltipProps {
    state: string | null;
    node: VotingBooth | null;
}

const NodeTooltip: React.FC<NodeTooltipProps> = ({ state, node }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (!state && !node) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
                position: 'fixed',
                left: mousePos.x + 15,
                top: mousePos.y + 15,
                pointerEvents: 'none',
                zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                minWidth: '180px'
            }}
        >
            {node ? (
                <div className="tooltip-content">
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{node.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>{node.address}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span>Status:</span>
                        <span style={{
                            color: node.id === 'MH-PUNE-UNDRI-001' ? '#FBBF24' : node.status === 'active' ? '#10B981' : '#9CA3AF',
                            fontWeight: 600
                        }}>
                            {node.id === 'MH-PUNE-UNDRI-001' ? 'Your Booth' : node.status.toUpperCase()}
                        </span>
                    </div>
                    {node.status === 'active' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                            <span>Votes Cast:</span>
                            <span style={{ fontWeight: 600 }}>{node.totalVotes.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            ) : state ? (
                <div className="tooltip-content">
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{state}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                        Click to view booths
                    </div>
                </div>
            ) : null}
        </motion.div>
    );
};

export default NodeTooltip;
