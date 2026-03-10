// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract AllianceNFT is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    
    struct Alliance {
        string name;
        uint8 level;
        uint256 contributionPool;
        uint256 treasuryBalance;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(uint256 => Alliance) public alliances;
    mapping(address => uint256) public memberAlliance;
    mapping(uint256 => address[]) public allianceMembers;
    
    uint256 public nextAllianceId = 1;
    uint256 public constant MAX_LEVEL = 8;
    
    event AllianceCreated(uint256 indexed allianceId, string name, address indexed creator, uint256 timestamp);
    event MemberJoined(uint256 indexed allianceId, address indexed member, uint256 timestamp);
    event MemberLeft(uint256 indexed allianceId, address indexed member, uint256 timestamp);
    event ContributionReceived(uint256 indexed allianceId, address indexed member, uint256 amount, uint256 timestamp);
    event TreasuryDeposit(uint256 indexed allianceId, address indexed depositor, uint256 amount, uint256 timestamp);
    event TreasuryWithdraw(uint256 indexed allianceId, address indexed recipient, uint256 amount, uint256 timestamp);
    event LevelUpgraded(uint256 indexed allianceId, uint8 newLevel, uint256 upgradeCost, uint256 timestamp);
    
    constructor() ERC721('SLG Alliance', 'SLGA') {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function createAlliance(string calldata name) external nonReentrant returns (uint256 allianceId) {
        require(bytes(name).length > 0, 'Name cannot be empty');
        require(bytes(name).length <= 32, 'Name too long');
        
        allianceId = nextAllianceId++;
        _safeMint(msg.sender, allianceId);
        
        alliances[allianceId] = Alliance({
            name: name,
            level: 1,
            contributionPool: 0,
            treasuryBalance: 0,
            createdAt: block.timestamp,
            exists: true
        });
        
        memberAlliance[msg.sender] = allianceId;
        allianceMembers[allianceId].push(msg.sender);
        
        emit AllianceCreated(allianceId, name, msg.sender, block.timestamp);
    }
    
    function joinAlliance(uint256 allianceId) external {
        require(alliances[allianceId].exists, 'Alliance does not exist');
        require(memberAlliance[msg.sender] == 0, 'Already in an alliance');
        
        uint8 level = alliances[allianceId].level;
        uint8 maxMembers = _getMaxMembers(level);
        require(allianceMembers[allianceId].length < maxMembers, 'Alliance is full');
        
        memberAlliance[msg.sender] = allianceId;
        allianceMembers[allianceId].push(msg.sender);
        
        emit MemberJoined(allianceId, msg.sender, block.timestamp);
    }
    
    function leaveAlliance() external {
        uint256 allianceId = memberAlliance[msg.sender];
        require(allianceId != 0, 'Not in any alliance');
        
        _removeMember(allianceId, msg.sender);
        memberAlliance[msg.sender] = 0;
        
        emit MemberLeft(allianceId, msg.sender, block.timestamp);
    }
    
    function contribute(uint256 allianceId) external payable {
        require(alliances[allianceId].exists, 'Alliance does not exist');
        require(msg.value > 0, 'Contribution must be greater than 0');
        
        alliances[allianceId].contributionPool += msg.value;
        
        emit ContributionReceived(allianceId, msg.sender, msg.value, block.timestamp);
    }
    
    function depositToTreasury(uint256 allianceId) external payable nonReentrant {
        require(alliances[allianceId].exists, 'Alliance does not exist');
        require(msg.value > 0, 'Deposit must be greater than 0');
        
        alliances[allianceId].treasuryBalance += msg.value;
        
        emit TreasuryDeposit(allianceId, msg.sender, msg.value, block.timestamp);
    }
    
    function withdrawFromTreasury(uint256 allianceId, uint256 amount, address payable recipient) 
        external 
        nonReentrant 
    {
        require(alliances[allianceId].exists, 'Alliance does not exist');
        require(ownerOf(allianceId) == msg.sender, 'Only alliance owner can withdraw');
        require(amount <= alliances[allianceId].treasuryBalance, 'Insufficient balance');
        
        alliances[allianceId].treasuryBalance -= amount;
        recipient.transfer(amount);
        
        emit TreasuryWithdraw(allianceId, recipient, amount, block.timestamp);
    }
    
    function upgradeLevel(uint256 allianceId) external {
        require(alliances[allianceId].exists, 'Alliance does not exist');
        require(ownerOf(allianceId) == msg.sender, 'Only alliance owner can upgrade');
        
        uint8 currentLevel = alliances[allianceId].level;
        require(currentLevel < MAX_LEVEL, 'Already at max level');
        
        uint256 upgradeCost = _getUpgradeCost(currentLevel);
        require(alliances[allianceId].contributionPool >= upgradeCost, 'Insufficient contribution');
        
        alliances[allianceId].contributionPool -= upgradeCost;
        alliances[allianceId].level = currentLevel + 1;
        
        emit LevelUpgraded(allianceId, currentLevel + 1, upgradeCost, block.timestamp);
    }
    
    function getAllianceData(uint256 allianceId) external view returns (Alliance memory) {
        return alliances[allianceId];
    }
    
    function getMemberAlliance(address member) external view returns (uint256) {
        return memberAlliance[member];
    }
    
    function getMembers(uint256 allianceId) external view returns (address[] memory) {
        return allianceMembers[allianceId];
    }
    
    function _getMaxMembers(uint8 level) internal pure returns (uint8) {
        if (level == 1) return 10;
        if (level == 2) return 15;
        if (level == 3) return 20;
        if (level == 4) return 30;
        if (level == 5) return 50;
        if (level == 6) return 80;
        if (level == 7) return 100;
        return 150;
    }
    
    function _getUpgradeCost(uint8 currentLevel) internal pure returns (uint256) {
        uint256[8] memory costs = [
            50000e18,
            90000e18,
            162000e18,
            291600e18,
            524880e18,
            944784e18,
            1700611e18,
            3061100e18
        ];
        return costs[currentLevel - 1];
    }
    
    function _removeMember(uint256 allianceId, address member) internal {
        address[] storage members = allianceMembers[allianceId];
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == member) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
