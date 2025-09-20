import React, { useState } from 'react';
import { User, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import { ethers } from 'ethers';

interface Creator {
  wallet: string;
  name: string;
  description: string;
  totalEarnings: string;
  tipCount: string;
  isActive: boolean;
}

interface CreatorCardProps {
  creator: Creator;
  onTip: (creatorAddress: string, amount: string, message: string, tipperName: string) => Promise<void>;
  isLoading?: boolean;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onTip, isLoading = false }) => {
  const [tipAmount, setTipAmount] = useState('0.1');
  const [message, setMessage] = useState('');
  const [tipperName, setTipperName] = useState('');
  const [showTipForm, setShowTipForm] = useState(false);

  const handleTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipAmount || parseFloat(tipAmount) <= 0) return;
    
    await onTip(creator.wallet, tipAmount, message, tipperName || 'Anonymous');
    setMessage('');
    setTipperName('');
    setShowTipForm(false);
  };

  const formatEarnings = (earnings: string) => {
    const value = parseFloat(ethers.formatEther(earnings));
    return value.toFixed(4);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{creator.name}</h3>
          <p className="text-gray-300 text-sm mb-2">{creator.description}</p>
          <p className="text-xs text-gray-400 font-mono">
            {creator.wallet.slice(0, 6)}...{creator.wallet.slice(-4)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs text-gray-300 uppercase tracking-wide">Earnings</span>
          </div>
          <span className="text-lg font-bold text-white">{formatEarnings(creator.totalEarnings)} SHM</span>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-4 w-4 text-pink-400" />
            <span className="text-xs text-gray-300 uppercase tracking-wide">Tips</span>
          </div>
          <span className="text-lg font-bold text-white">{creator.tipCount}</span>
        </div>
      </div>

      {!showTipForm ? (
        <button
          onClick={() => setShowTipForm(true)}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
        >
          <Heart className="inline h-4 w-4 mr-2" />
          Send Tip
        </button>
      ) : (
        <form onSubmit={handleTip} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={tipperName}
              onChange={(e) => setTipperName(e.target.value)}
              className="flex-1 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              min="0.001"
              placeholder="Amount (SHM)"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="w-24 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 py-2 rounded-lg font-semibold text-white transition-all duration-200"
            >
              {isLoading ? 'Sending...' : 'Send Tip'}
            </button>
            <button
              type="button"
              onClick={() => setShowTipForm(false)}
              className="px-4 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-semibold text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};