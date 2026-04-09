import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DemoModeContextType {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDemoMode, setIsDemoMode] = useState(() => {
        try {
            return localStorage.getItem('ekmat-demo-mode') === 'true';
        } catch {
            return false;
        }
    });

    const toggleDemoMode = () => {
        setIsDemoMode(prev => {
            const next = !prev;
            try { localStorage.setItem('ekmat-demo-mode', String(next)); } catch { }
            return next;
        });
    };

    return (
        <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode }}>
            {children}
        </DemoModeContext.Provider>
    );
};

export const useDemoMode = () => {
    const ctx = useContext(DemoModeContext);
    if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
    return ctx;
};
