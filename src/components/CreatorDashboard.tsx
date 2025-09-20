import React, { useState } from 'react';
import { User, DollarSign, TrendingUp, Settings, Eye, EyeOff } from 'lucide-react';
import { ethers } from 'ethers';

interface Creator {
  wallet: string;
  name: string;
  description: string;
  totalEarnings: string;
  tipCount: string;
  isActive: boolean;
}

interface Tip {
  tipper: string;
  creator: string;
  amount: string;
  message: string;
  timestamp: string;
  tipperName: string;
}

interface CreatorDashboardProps {
  creator: Creator;
  tips: Tip[];
  onWithdraw: () => Promise<void>;
  isLoading?: boolean;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  creator,
  tips,
  onWithdraw,
  isLoading = false
}) => {
  const [showEarnings, setShowEarnings] = useState(true);

  const formatAmount = (amount: string) => {
    return parseFloat(ethers.formatEther(amount)).toFixed(4);
  };

  const recentTips = tips.slice(0, 5);
  const totalEarningsFloat = parseFloat(formatAmount(creator.totalEarnings));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{creator.name}</h1>
            <p className="text-gray-300">{creator.description}</p>
            <p className="text-xs text-gray-400 font-mono mt-1">{creator.wallet}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              creator.isActive 
                ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                : 'bg-red-500/20 text-red-400 border border-red-400/30'
            }`}>
              {creator.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm text-gray-300 uppercase tracking-wide">Total Earnings</h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold text-white ${!showEarnings && 'blur-sm'}`}>
                  {formatAmount(creator.totalEarnings)} SHM
                </span>
                <button
                  onClick={() => setShowEarnings(!showEarnings)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showEarnings ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm text-gray-300 uppercase tracking-wide">Total Tips</h3>
              <span className="text-2xl font-bold text-white">{creator.tipCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Settings className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm text-gray-300 uppercase tracking-wide">Average Tip</h3>
              <span className="text-2xl font-bold text-white">
                {creator.tipCount !== '0' 
                  ? (totalEarningsFloat / parseInt(creator.tipCount)).toFixed(4)
                  : '0.0000'
                } SHM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      {totalEarningsFloat > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Withdraw Earnings</h3>
              <p className="text-gray-300 text-sm">
                You have {formatAmount(creator.totalEarnings)} SHM available to withdraw
              </p>
            </div>
            <button
              onClick={onWithdraw}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      )}

      {/* Recent Tips */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Tips</h3>
        {recentTips.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No tips received yet</p>
        ) : (
          <div className="space-y-3">
            {recentTips.map((tip, index) => (
              <div key={index} className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">
                    {tip.tipperName || 'Anonymous'}
                  </span>
                  <span className="font-bold text-yellow-400">
                    {formatAmount(tip.amount)} SHM
                  </span>
                </div>
                {tip.message && (
                  <p className="text-gray-300 text-sm">{tip.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(parseInt(tip.timestamp) * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};