import React, { useState } from 'react';
import { useOfficial } from '../context/OfficialContext';
import { Button } from './common/Button';
import { Lock, X, AlertTriangle } from 'lucide-react';
import { theme } from '../styles/theme';

interface OfficialLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OfficialLoginModal: React.FC<OfficialLoginModalProps> = ({ isOpen, onClose }) => {
    const { loginAsOfficial } = useOfficial();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginAsOfficial(password)) {
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('Invalid credentials');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', borderRadius: '12px', width: '90%', maxWidth: '400px',
                overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    background: '#1a202c', padding: '1.5rem', textAlign: 'center', position: 'relative'
                }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '10px', right: '10px', background: 'none',
                        border: 'none', color: 'white', cursor: 'pointer'
                    }}>
                        <X size={20} />
                    </button>
                    <div style={{
                        width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <Lock size={24} color="white" />
                    </div>
                    <h3 style={{ color: 'white', fontSize: '1.25rem', margin: 0 }}>Official Access</h3>
                    <p style={{ color: '#a0aec0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Restricted to Election Commission Officers
                    </p>
                </div>

                <form onSubmit={handleLogin} style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                            Access Code
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '6px',
                                border: `1px solid ${error ? '#e53e3e' : '#e2e8f0'}`,
                                fontSize: '1rem'
                            }}
                            placeholder="Enter official passcode"
                            autoFocus
                        />
                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#e53e3e', fontSize: '0.875rem' }}>
                                <AlertTriangle size={14} />
                                {error}
                            </div>
                        )}
                    </div>
                    <Button type="submit" fullWidth style={{ background: '#1a202c' }}>
                        Authenticate
                    </Button>
                </form>
            </div>
        </div>
    );
};
