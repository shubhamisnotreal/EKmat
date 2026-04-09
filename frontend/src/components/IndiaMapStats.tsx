import React, { useEffect, useRef } from 'react';
import { theme } from '../styles/theme';

interface IndiaMapStatsProps {
    activeBooths: number;
}

export const IndiaMapStats: React.FC<IndiaMapStatsProps> = ({ activeBooths }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let pulse = 0;

        // Simplified India Map coordinates (Approximate polygon for visual effect)
        // In a real app, use a proper SVG path or GeoJSON
        const drawMap = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Pulse effect for Pune
            pulse += 0.05;
            const pulseRadius = 10 + Math.sin(pulse) * 5;
            const puneX = canvas.width * 0.35;
            const puneY = canvas.height * 0.6;

            // Draw schematic map (abstract polygon)
            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.3, canvas.height * 0.1); // North
            ctx.lineTo(canvas.width * 0.6, canvas.height * 0.2);
            ctx.lineTo(canvas.width * 0.7, canvas.height * 0.5); // East
            ctx.lineTo(canvas.width * 0.5, canvas.height * 0.9); // South
            ctx.lineTo(canvas.width * 0.2, canvas.height * 0.6); // West
            ctx.closePath();
            ctx.strokeStyle = theme.colors.primary;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = 'rgba(49, 130, 206, 0.05)';
            ctx.fill();

            // Draw Random Booths
            const time = Date.now() / 1000;
            for (let i = 0; i < 20; i++) {
                // simple consistent random positions based on index
                const x = canvas.width * (0.3 + Math.abs(Math.sin(i * 123)) * 0.4);
                const y = canvas.height * (0.2 + Math.abs(Math.cos(i * 321)) * 0.6);

                // Only draw if inside roughly
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = theme.colors.secondary;
                ctx.fill();

                // Connect to Pune sometimes
                if (Math.sin(time + i) > 0.8) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(puneX, puneY);
                    ctx.strokeStyle = `rgba(56, 178, 172, ${Math.abs(Math.sin(time * 3 + i)) * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Draw Pune (User Node)
            ctx.beginPath();
            ctx.arc(puneX, puneY, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#48BB78'; // Green
            ctx.fill();

            // Pulse ring
            ctx.beginPath();
            ctx.arc(puneX, puneY, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(72, 187, 120, ${1 - Math.sin(pulse) * 0.5})`; // Fade out
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = theme.colors.textPrimary;
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText('Your Booth (Pune)', puneX + 15, puneY + 4);

            animationFrameId = requestAnimationFrame(drawMap);
        };

        drawMap();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '300px', height: '350px', margin: '0 auto' }}>
            <canvas
                ref={canvasRef}
                width={300}
                height={350}
                style={{ width: '100%', height: '100%' }}
            />
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.9)',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#48BB78', boxShadow: '0 0 0 2px #C6F6D5' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2D3748' }}>
                    {activeBooths} Active Nodes
                </span>
            </div>
        </div>
    );
};
