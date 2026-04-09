import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface VoterIdentity {
    name: string;
    aadhaarLast4: string;
    photoUrl?: string;
    verifiedAt: number;
    nullifier: string; // Simulated nullifier for ZKP
}

interface IdentityContextType {
    identity: VoterIdentity | null;
    isVerifying: boolean;
    loginWithDigiLocker: () => Promise<void>;
    logout: () => void;
    hasVoted: (electionId: string) => boolean;
    recordVote: (electionId: string) => void;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [identity, setIdentity] = useState<VoterIdentity | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Load vote history from local storage to simulate "one person one vote"
    const [voteHistory, setVoteHistory] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Load identity from storage on mount
        const stored = localStorage.getItem('ekmat_identity');
        if (stored) setIdentity(JSON.parse(stored));

        const votes = localStorage.getItem('ekmat_vote_history');
        if (votes) setVoteHistory(JSON.parse(votes));
    }, []);

    const loginWithDigiLocker = async () => {
        setIsVerifying(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        const mockIdentity: VoterIdentity = {
            name: "Ayush Kumar",
            aadhaarLast4: "9988",
            verifiedAt: Date.now(),
            nullifier: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
        };

        setIdentity(mockIdentity);
        localStorage.setItem('ekmat_identity', JSON.stringify(mockIdentity));
        setIsVerifying(false);
    };

    const logout = () => {
        setIdentity(null);
        localStorage.removeItem('ekmat_identity');
    };

    const recordVote = (electionId: string) => {
        const updated = { ...voteHistory, [electionId]: true };
        setVoteHistory(updated);
        localStorage.setItem('ekmat_vote_history', JSON.stringify(updated));
    };

    const hasVoted = (electionId: string) => {
        return !!voteHistory[electionId];
    };

    return (
        <IdentityContext.Provider value={{ identity, isVerifying, loginWithDigiLocker, logout, hasVoted, recordVote }}>
            {children}
        </IdentityContext.Provider>
    );
};

export const useIdentity = () => {
    const context = useContext(IdentityContext);
    if (context === undefined) {
        throw new Error('useIdentity must be used within an IdentityProvider');
    }
    return context;
};
