import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Zap, Clock } from 'lucide-react';
import { ethers } from 'ethers';

interface Tip {
  tipper: string;
  creator: string;
  amount: string;
  message: string;
  timestamp: string;
  tipperName: string;
}

interface TipFeedProps {
  tips: Tip[];
  creators: { [address: string]: { name: string } };
}

export const TipFeed: React.FC<TipFeedProps> = ({ tips, creators }) => {
  const [animatingTips, setAnimatingTips] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Animate new tips
    const newAnimations = new Set<number>();
    tips.slice(0, 3).forEach((_, index) => {
      newAnimations.add(index);
    });
    setAnimatingTips(newAnimations);

    const timer = setTimeout(() => {
      setAnimatingTips(new Set());
    }, 2000);

    return () => clearTimeout(timer);
  }, [tips]);

  const formatAmount = (amount: string) => {
    return parseFloat(ethers.formatEther(amount)).toFixed(4);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (tips.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No tips yet</h3>
        <p className="text-gray-300">Be the first to show some love to creators!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">Live Tip Feed</h2>
      </div>
      
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div
            key={`${tip.tipper}-${tip.timestamp}`}
            className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all duration-500 ${
              animatingTips.has(index) 
                ? 'animate-pulse border-yellow-400 shadow-lg shadow-yellow-400/20' 
                : 'hover:border-white/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="h-4 w-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">
                    {tip.tipperName || 'Anonymous'}
                  </span>
                  <span className="text-gray-300">tipped</span>
                  <span className="font-semibold text-blue-400">
                    {creators[tip.creator]?.name || `${tip.creator.slice(0, 6)}...`}
                  </span>
                  <span className="font-bold text-yellow-400">
                    {formatAmount(tip.amount)} SHM
                  </span>
                </div>
                
                {tip.message && (
                  <div className="bg-black/20 rounded-lg p-2 mt-2">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-200 text-sm">{tip.message}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(tip.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};