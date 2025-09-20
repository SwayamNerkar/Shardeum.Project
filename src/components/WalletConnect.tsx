import React from 'react';
import { Wallet, LogOut, Zap } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const WalletConnect: React.FC = () => {
  const { account, isConnected, balance, isLoading, connectWallet, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">{parseFloat(balance).toFixed(4)} SHM</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">{formatAddress(account)}</span>
        </div>
        <button
          onClick={disconnect}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Disconnect"
        >
          <LogOut className="h-4 w-4 text-gray-300 hover:text-white" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isLoading}
      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
    >
      <Wallet className="h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};