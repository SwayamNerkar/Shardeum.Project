// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ShardeumTipping {
    struct Creator {
        address payable wallet;
        string name;
        string description;
        uint256 totalEarnings;
        uint256 tipCount;
        bool isActive;
    }
    
    struct Tip {
        address tipper;
        address creator;
        uint256 amount;
        string message;
        uint256 timestamp;
        string tipperName;
    }
    
    mapping(address => Creator) public creators;
    mapping(address => bool) public isRegistered;
    Tip[] public tips;
    address[] public creatorList;
    
    event CreatorRegistered(address indexed creator, string name);
    event TipSent(
        address indexed tipper, 
        address indexed creator, 
        uint256 amount, 
        string message,
        string tipperName,
        uint256 timestamp
    );
    event Withdrawal(address indexed creator, uint256 amount);
    
    modifier onlyRegisteredCreator() {
        require(isRegistered[msg.sender], "Creator not registered");
        _;
    }
    
    function registerCreator(string memory _name, string memory _description) external {
        require(!isRegistered[msg.sender], "Creator already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        creators[msg.sender] = Creator({
            wallet: payable(msg.sender),
            name: _name,
            description: _description,
            totalEarnings: 0,
            tipCount: 0,
            isActive: true
        });
        
        isRegistered[msg.sender] = true;
        creatorList.push(msg.sender);
        
        emit CreatorRegistered(msg.sender, _name);
    }
    
    function tipCreator(
        address _creator, 
        string memory _message,
        string memory _tipperName
    ) external payable {
        require(isRegistered[_creator], "Creator not found");
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(creators[_creator].isActive, "Creator is not active");
        
        creators[_creator].totalEarnings += msg.value;
        creators[_creator].tipCount += 1;
        
        tips.push(Tip({
            tipper: msg.sender,
            creator: _creator,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp,
            tipperName: _tipperName
        }));
        
        emit TipSent(msg.sender, _creator, msg.value, _message, _tipperName, block.timestamp);
    }
    
    function withdrawEarnings() external onlyRegisteredCreator {
        uint256 balance = address(this).balance;
        uint256 creatorEarnings = creators[msg.sender].totalEarnings;
        
        require(creatorEarnings > 0, "No earnings to withdraw");
        require(balance >= creatorEarnings, "Insufficient contract balance");
        
        creators[msg.sender].totalEarnings = 0;
        creators[msg.sender].wallet.transfer(creatorEarnings);
        
        emit Withdrawal(msg.sender, creatorEarnings);
    }
    
    function getCreator(address _creator) external view returns (Creator memory) {
        require(isRegistered[_creator], "Creator not found");
        return creators[_creator];
    }
    
    function getRecentTips(uint256 _limit) external view returns (Tip[] memory) {
        uint256 totalTips = tips.length;
        uint256 limit = _limit > totalTips ? totalTips : _limit;
        
        Tip[] memory recentTips = new Tip[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            recentTips[i] = tips[totalTips - 1 - i];
        }
        
        return recentTips;
    }
    
    function getCreatorTips(address _creator, uint256 _limit) external view returns (Tip[] memory) {
        uint256 count = 0;
        
        // Count creator's tips
        for (uint256 i = 0; i < tips.length; i++) {
            if (tips[i].creator == _creator) {
                count++;
            }
        }
        
        uint256 limit = _limit > count ? count : _limit;
        Tip[] memory creatorTips = new Tip[](limit);
        uint256 index = 0;
        
        // Get recent tips for creator
        for (uint256 i = tips.length; i > 0 && index < limit; i--) {
            if (tips[i-1].creator == _creator) {
                creatorTips[index] = tips[i-1];
                index++;
            }
        }
        
        return creatorTips;
    }
    
    function getAllCreators() external view returns (address[] memory) {
        return creatorList;
    }
    
    function getTotalTips() external view returns (uint256) {
        return tips.length;
    }
}