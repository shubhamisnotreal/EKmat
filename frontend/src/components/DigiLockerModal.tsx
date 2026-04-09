import React, { useState, useEffect } from 'react';
import { useIdentity } from '../context/IdentityContext';
import { Button } from './common/Button';
import { ShieldCheck, Loader2, X } from 'lucide-react';

interface DigiLockerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({ isOpen, onClose }) => {
    const { loginWithDigiLocker, isVerifying, identity } = useIdentity();
    const [step, setStep] = useState<'intro' | 'verifying' | 'success'>('intro');

    useEffect(() => {
        if (isOpen) setStep('intro');
    }, [isOpen]);

    const handleLogin = async () => {
        setStep('verifying');
        await loginWithDigiLocker();
        setStep('success');
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '420px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header with DigiLocker Branding */}
                <div style={{
                    background: '#2B6CB0',
                    padding: '1.5rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/DigiLocker_logo.png/1200px-DigiLocker_logo.png"
                        alt="DigiLocker"
                        style={{ height: '40px', filter: 'brightness(0) invert(1)' }}
                        onError={(e) => {
                            // Fallback if image fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML += '<h2 style="color:white;margin:0;">DigiLocker</h2>';
                        }}
                    />
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Government of India
                    </p>
                </div>

                <div style={{ padding: '2rem' }}>
                    {step === 'intro' && (
                        <div style={{ textAlign: 'center' }}>
                            <ShieldCheck size={48} color="#2B6CB0" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1a202c' }}>
                                Verify Identity
                            </h3>
                            <p style={{ color: '#4a5568', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                To ensure one person, one vote, EkMat uses DigiLocker to anonymously verify your government ID.
                            </p>
                            <Button fullWidth onClick={handleLogin} style={{ background: '#2B6CB0' }}>
                                Connect DigiLocker Account
                            </Button>
                            <p style={{ fontSize: '0.8rem', color: '#718096', marginTop: '1rem' }}>
                                We only receive a cryptographic proof of identity. Your personal details are never stored on chain.
                            </p>
                        </div>
                    )}

                    {step === 'verifying' && (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Loader2 className="animate-spin" size={48} color="#2B6CB0" style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1a202c' }}>
                                Verifying Credentials...
                            </h3>
                            <p style={{ color: '#4a5568', fontSize: '0.9rem' }}>
                                Fetching Aadhaar data securely
                            </p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%', background: '#C6F6D5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                            }}>
                                <CheckCircle size={32} color="#2F855A" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1a202c' }}>
                                Identity Verified!
                            </h3>
                            <p style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                                Welcome, <strong>{identity?.name}</strong>
                                <br />
                                <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                                    Aadhaar •••• {identity?.aadhaarLast4}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple import helper for icons just in case check-circle wasn't imported
import { CheckCircle } from 'lucide-react';
