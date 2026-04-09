import { useWeb3 } from '../context/Web3Context';

// Legacy hook wrapper for compatibility
// Now it just proxies to the global Web3Context
export const useProvider = () => {
    const { provider, account } = useWeb3();
    return { provider, account };
};
