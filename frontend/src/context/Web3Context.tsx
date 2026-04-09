import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
    provider: ethers.BrowserProvider | null;
    account: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    const initProvider = async () => {
        if (window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            try {
                const accounts = await browserProvider.listAccounts();
                if (accounts.length > 0) {
                    setAccount(accounts[0].address);
                }
            } catch (e) {
                console.error("Failed to list accounts", e);
            }

            // Listeners
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    };

    useEffect(() => {
        initProvider();
        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners();
            }
        };
    }, []);

    const connect = async () => {
        if (!window.ethereum) {
            alert("MetaMask not found!");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                setAccount(accounts[0]);
            }
        } catch (error) {
            console.error("Connection failed", error);
            throw error;
        }
    };

    const disconnect = () => {
        setAccount(null);
    };

    return (
        <Web3Context.Provider value={{ provider, account, connect, disconnect }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};
