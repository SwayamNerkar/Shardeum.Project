import React, { useState, useEffect } from 'react';
import { Zap, Users, TrendingUp, Heart, Menu, X } from 'lucide-react';
import { ethers } from 'ethers';
import { WalletConnect } from './components/WalletConnect';
import { CreatorCard } from './components/CreatorCard';
import { TipFeed } from './components/TipFeed';
import { CreatorDashboard } from './components/CreatorDashboard';
import { RegisterCreator } from './components/RegisterCreator';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';

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

function App() {
  const { account, isConnected, provider, signer, updateBalance } = useWallet();
  const { contract } = useContract(provider, signer);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentCreator, setCurrentCreator] = useState<Creator | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'dashboard' | 'register'>('explore');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data for demonstration (replace with contract calls)
  const mockCreators: Creator[] = [
    {
      wallet: '0x1234567890123456789012345678901234567890',
      name: 'StreamMaster Alex',
      description: 'Gaming streamer specializing in FPS games',
      totalEarnings: ethers.parseEther('12.5').toString(),
      tipCount: '47',
      isActive: true
    },
    {
      wallet: '0x0987654321098765432109876543210987654321',
      name: 'ArtCreator Maya',
      description: 'Digital artist creating NFT masterpieces',
      totalEarnings: ethers.parseEther('8.3').toString(),
      tipCount: '23',
      isActive: true
    },
    {
      wallet: '0x1111222233334444555566667777888899990000',
      name: 'MusicProducer Sam',
      description: 'Electronic music producer and live performer',
      totalEarnings: ethers.parseEther('15.7').toString(),
      tipCount: '61',
      isActive: true
    }
  ];

  const mockTips: Tip[] = [
    {
      tipper: '0xabcd1234',
      creator: '0x1234567890123456789012345678901234567890',
      amount: ethers.parseEther('0.5').toString(),
      message: 'Amazing stream today! 🔥',
      timestamp: (Date.now() / 1000 - 300).toString(),
      tipperName: 'GamerFan123'
    },
    {
      tipper: '0xefgh5678',
      creator: '0x0987654321098765432109876543210987654321',
      amount: ethers.parseEther('1.2').toString(),
      message: 'Love your art style!',
      timestamp: (Date.now() / 1000 - 600).toString(),
      tipperName: 'ArtLover'
    },
    {
      tipper: '0xijkl9012',
      creator: '0x1111222233334444555566667777888899990000',
      amount: ethers.parseEther('0.8').toString(),
      message: 'That beat drop was insane!',
      timestamp: (Date.now() / 1000 - 900).toString(),
      tipperName: 'BassHead'
    }
  ];

  useEffect(() => {
    // Set mock data
    setCreators(mockCreators);
    setTips(mockTips);

    // Check if current account is a registered creator
    if (account && isConnected) {
      const foundCreator = mockCreators.find(c => 
        c.wallet.toLowerCase() === account.toLowerCase()
      );
      if (foundCreator) {
        setIsRegistered(true);
        setCurrentCreator(foundCreator);
      }
    }
  }, [account, isConnected]);

  const handleTip = async (creatorAddress: string, amount: string, message: string, tipperName: string) => {
    if (!contract || !isConnected) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.tipCreator(
        creatorAddress,
        message,
        tipperName,
        { value: ethers.parseEther(amount) }
      );
      
      await tx.wait();
      
      // Add new tip to the beginning of the array
      const newTip: Tip = {
        tipper: account,
        creator: creatorAddress,
        amount: ethers.parseEther(amount).toString(),
        message,
        timestamp: (Date.now() / 1000).toString(),
        tipperName
      };
      setTips(prev => [newTip, ...prev]);
      
      // Update creator earnings
      setCreators(prev => prev.map(creator => 
        creator.wallet.toLowerCase() === creatorAddress.toLowerCase()
          ? {
              ...creator,
              totalEarnings: (BigInt(creator.totalEarnings) + ethers.parseEther(amount)).toString(),
              tipCount: (parseInt(creator.tipCount) + 1).toString()
            }
          : creator
      ));
      
      await updateBalance(account);
      alert('Tip sent successfully! 🎉');
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterCreator = async (name: string, description: string) => {
    if (!contract || !isConnected) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.registerCreator(name, description);
      await tx.wait();
      
      const newCreator: Creator = {
        wallet: account,
        name,
        description,
        totalEarnings: '0',
        tipCount: '0',
        isActive: true
      };
      
      setCreators(prev => [...prev, newCreator]);
      setCurrentCreator(newCreator);
      setIsRegistered(true);
      setActiveTab('dashboard');
      
      alert('Creator registration successful! 🎉');
    } catch (error) {
      console.error('Error registering creator:', error);
      alert('Failed to register as creator. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !currentCreator) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.withdrawEarnings();
      await tx.wait();
      
      setCurrentCreator(prev => prev ? { ...prev, totalEarnings: '0' } : null);
      setCreators(prev => prev.map(creator => 
        creator.wallet.toLowerCase() === account.toLowerCase()
          ? { ...creator, totalEarnings: '0' }
          : creator
      ));
      
      await updateBalance(account);
      alert('Withdrawal successful! 💰');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to withdraw. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const creatorMap = creators.reduce((acc, creator) => {
    acc[creator.wallet] = { name: creator.name };
    return acc;
  }, {} as { [address: string]: { name: string } });

  const currentCreatorTips = currentCreator 
    ? tips.filter(tip => tip.creator.toLowerCase() === currentCreator.wallet.toLowerCase())
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Shardeum Tips</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'explore'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="inline h-4 w-4 mr-2" />
                Explore
              </button>
              
              {isRegistered ? (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <TrendingUp className="inline h-4 w-4 mr-2" />
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('register')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'register'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className="inline h-4 w-4 mr-2" />
                  Join as Creator
                </button>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <WalletConnect />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('explore');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'explore'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Users className="inline h-4 w-4 mr-2" />
                  Explore
                </button>
                
                {isRegistered ? (
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <TrendingUp className="inline h-4 w-4 mr-2" />
                    Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab('register');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'register'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className="inline h-4 w-4 mr-2" />
                    Join as Creator
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Shardeum Tips</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              The first micro-tipping platform built on Shardeum. Support your favorite creators with ultra-low fees and instant transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WalletConnect />
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Ultra-Low Fees</h3>
                <p className="text-gray-300 text-sm">Send tips as low as $0.10 with minimal gas fees</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Heart className="h-8 w-8 text-pink-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Real-time Tips</h3>
                <p className="text-gray-300 text-sm">Instant transactions with live feed updates</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Creator First</h3>
                <p className="text-gray-300 text-sm">Built for creators, by creators with Web3 values</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'explore' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="h-6 w-6 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white">Featured Creators</h2>
                  </div>
                  
                  {creators.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No creators yet</h3>
                      <p className="text-gray-300">Be the first to join as a creator!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {creators.map((creator) => (
                        <CreatorCard
                          key={creator.wallet}
                          creator={creator}
                          onTip={handleTip}
                          isLoading={isLoading}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <TipFeed tips={tips} creators={creatorMap} />
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && currentCreator && (
              <CreatorDashboard
                creator={currentCreator}
                tips={currentCreatorTips}
                onWithdraw={handleWithdraw}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'register' && !isRegistered && (
              <div className="max-w-2xl mx-auto">
                <RegisterCreator
                  onRegister={handleRegisterCreator}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">Built on Shardeum Unstablenet • Powered by Web3</p>
            <p className="text-sm">Network: Shardeum Unstablenet (Chain ID: 8080)</p>
            <p className="text-xs mt-2">
              Get test SHM from the <a href="https://discord.gg/shardeum" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Discord faucet</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;