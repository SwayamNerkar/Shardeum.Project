import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const SHARDEUM_NETWORK = {
  chainId: '0x1F90', // 8080 in hex
  chainName: 'Shardeum Unstablenet',
  rpcUrls: ['https://api-unstable.shardeum.org'],
  nativeCurrency: {
    name: 'Shardeum',
    symbol: 'SHM',
    decimals: 18
  },
  blockExplorerUrls: ['https://explorer-unstable.shardeum.org']
};

export const useWallet = () => {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const signerInstance = await browserProvider.getSigner();
          setProvider(browserProvider);
          setSigner(signerInstance);
          setAccount(accounts[0]);
          setIsConnected(true);
          await updateBalance(accounts[0], browserProvider);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length > 0) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(accounts[0]);
      setIsConnected(true);
      updateBalance(accounts[0], browserProvider);
    } else {
      setAccount('');
      setIsConnected(false);
      setBalance('0');
      setProvider(null);
      setSigner(null);
    }
  };

  const updateBalance = async (address: string, providerInstance?: ethers.BrowserProvider) => {
    const activeProvider = providerInstance || provider;
    if (activeProvider) {
      try {
        const balance = await activeProvider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error getting balance:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is required to use this app!');
      return;
    }

    setIsLoading(true);
    try {
      // Switch to Shardeum network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SHARDEUM_NETWORK.chainId }]
      });
    } catch (switchError: any) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SHARDEUM_NETWORK]
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          setIsLoading(false);
          return;
        }
      } else {
        console.error('Error switching network:', switchError);
        setIsLoading(false);
        return;
      }
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(accounts[0]);
      setIsConnected(true);
      await updateBalance(accounts[0], browserProvider);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
    setIsLoading(false);
  };

  const disconnect = () => {
    setAccount('');
    setIsConnected(false);
    setBalance('0');
    setProvider(null);
    setSigner(null);
  };

  return {
    account,
    isConnected,
    balance,
    isLoading,
    provider,
    signer,
    connectWallet,
    disconnect,
    updateBalance
  };
};

declare global {
  interface Window {
    ethereum: any;
  }
}