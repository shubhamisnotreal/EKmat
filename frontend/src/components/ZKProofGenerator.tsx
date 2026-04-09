import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Binary, Cpu } from 'lucide-react';

interface ZKPStatusProps {
    isOpen: boolean;
    onComplete: () => void;
}

const steps = [
    { text: "Initializing ZK-SNARK Circuit...", icon: Cpu, delay: 800 },
    { text: "Hashing Aadhaar Nullifier...", icon: Lock, delay: 1500 },
    { text: "Generating Zero-Knowledge Proof...", icon: Binary, delay: 2500 },
    { text: "Verifying Proof Validity...", icon: ShieldCheck, delay: 1000 }
];

export const ZKProofGenerator: React.FC<ZKPStatusProps> = ({ isOpen, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            return;
        }

        let totalDelay = 0;
        steps.forEach((step, index) => {
            totalDelay += step.delay;
            setTimeout(() => {
                setCurrentStep(index + 1);
                if (index === steps.length - 1) {
                    setTimeout(onComplete, 800);
                }
            }, totalDelay);
        });
    }, [isOpen, onComplete]);

    if (!isOpen) return null;

    const activeStep = steps[Math.min(currentStep, steps.length - 1)];
    const Icon = activeStep.icon;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            color: '#00FF41' // Hacker green
        }}>
            <div style={{
                position: 'relative',
                marginBottom: '2rem'
            }}>
                {/* Matrix-style pulsing circle */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '2px solid #00FF41',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
                    animation: 'pulse 2s infinite'
                }}>
                    <Icon size={48} />
                </div>
            </div>

            <h2 style={{ fontFamily: 'monospace', fontSize: '1.5rem', marginBottom: '1rem' }}>
                {activeStep.text}
            </h2>

            <div style={{ width: '300px', height: '4px', background: '#0d3314', borderRadius: '2px' }}>
                <div style={{
                    height: '100%',
                    background: '#00FF41',
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                    transition: 'width 0.5s ease'
                }} />
            </div>

            {/* Simulated Hash Stream */}
            <div style={{
                marginTop: '3rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                opacity: 0.7,
                width: '80%',
                maxWidth: '600px',
                textAlign: 'center',
                wordBreak: 'break-all'
            }}>
                {Array(3).fill(0).map((_, i) => (
                    <div key={i} style={{ marginBottom: '0.5rem' }}>
                        {`0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`}
                    </div>
                ))}
            </div>
        </div>
    );
};
