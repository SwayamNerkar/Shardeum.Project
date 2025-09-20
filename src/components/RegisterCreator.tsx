import React, { useState } from 'react';
import { User, Star } from 'lucide-react';

interface RegisterCreatorProps {
  onRegister: (name: string, description: string) => Promise<void>;
  isLoading?: boolean;
}

export const RegisterCreator: React.FC<RegisterCreatorProps> = ({ onRegister, isLoading = false }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onRegister(name.trim(), description.trim());
    setName('');
    setDescription('');
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Become a Creator</h2>
        <p className="text-gray-300">Join Shardeum Tipping and start receiving tips from your fans!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Creator Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your creator name"
            className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about yourself (optional)"
            rows={3}
            className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
        >
          {isLoading ? 'Registering...' : 'Register as Creator'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">Why Shardeum?</h3>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Ultra-low gas fees for micro-tips</li>
          <li>• Instant transactions and real-time updates</li>
          <li>• Direct creator-to-fan connections</li>
        </ul>
      </div>
    </div>
  );
};