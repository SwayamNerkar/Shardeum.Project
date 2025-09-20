import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Deploy and update this
const CONTRACT_ABI = [
  "function registerCreator(string memory _name, string memory _description) external",
  "function tipCreator(address _creator, string memory _message, string memory _tipperName) external payable",
  "function withdrawEarnings() external",
  "function getCreator(address _creator) external view returns (tuple(address wallet, string name, string description, uint256 totalEarnings, uint256 tipCount, bool isActive))",
  "function getRecentTips(uint256 _limit) external view returns (tuple(address tipper, address creator, uint256 amount, string message, uint256 timestamp, string tipperName)[])",
  "function getCreatorTips(address _creator, uint256 _limit) external view returns (tuple(address tipper, address creator, uint256 amount, string message, uint256 timestamp, string tipperName)[])",
  "function getAllCreators() external view returns (address[])",
  "function getTotalTips() external view returns (uint256)",
  "function isRegistered(address) external view returns (bool)",
  "event CreatorRegistered(address indexed creator, string name)",
  "event TipSent(address indexed tipper, address indexed creator, uint256 amount, string message, string tipperName, uint256 timestamp)"
];

export const useContract = (provider: ethers.BrowserProvider | null, signer: ethers.JsonRpcSigner | null) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (provider && signer) {
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contract);
      } catch (error) {
        console.error('Error initializing contract:', error);
        setContract(null);
      }
    } else {
      setContract(null);
    }
  }, [provider, signer]);

  return { contract };
};