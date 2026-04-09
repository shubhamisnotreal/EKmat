import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface OfficialContextType {
    isOfficial: boolean;
    loginAsOfficial: (password: string) => boolean;
    logoutOfficial: () => void;
}

const OfficialContext = createContext<OfficialContextType | undefined>(undefined);

export const OfficialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOfficial, setIsOfficial] = useState(false);

    useEffect(() => {
        // Persist session slightly longer for demo convenience
        const stored = sessionStorage.getItem('ekmat_official_auth');
        if (stored === 'true') setIsOfficial(true);
    }, []);

    const loginAsOfficial = (password: string) => {
        // Hardcoded demo credentials
        if (password === 'india2026' || password === 'admin') {
            setIsOfficial(true);
            sessionStorage.setItem('ekmat_official_auth', 'true');
            return true;
        }
        return false;
    };

    const logoutOfficial = () => {
        setIsOfficial(false);
        sessionStorage.removeItem('ekmat_official_auth');
    };

    return (
        <OfficialContext.Provider value={{ isOfficial, loginAsOfficial, logoutOfficial }}>
            {children}
        </OfficialContext.Provider>
    );
};

export const useOfficial = () => {
    const context = useContext(OfficialContext);
    if (context === undefined) {
        throw new Error('useOfficial must be used within an OfficialProvider');
    }
    return context;
};
