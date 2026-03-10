// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract BuildingNFT is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    
    enum BuildingType {
        CASTLE,
        WAREHOUSE,
        WALL,
        LUMBER_MILL,
        QUARRY,
        FARM,
        MARKET,
        BARRACKS,
        STABLE,
        RANGE,
        HOSPITAL,
        ALLIANCE_HALL,
        HERO_HALL,
        BAZAAR
    }
    
    struct Building {
        BuildingType buildingType;
        uint8 level;
        uint8 maxLevel;
        uint256 productionBonus;
        uint256 defenseBonus;
        uint256 mintedAt;
        uint256 upgradedAt;
        address owner;
    }
    
    mapping(uint256 => Building) public buildings;
    mapping(address => uint256[]) public ownerBuildings;
    
    uint256 public nextBuildingId = 1;
    
    event BuildingMinted(
        uint256 indexed tokenId,
        address indexed owner,
        BuildingType buildingType,
        uint8 level,
        uint256 timestamp
    );
    
    event BuildingUpgraded(
        uint256 indexed tokenId,
        uint8 newLevel,
        uint256 upgradeCost,
        bool success,
        uint256 timestamp
    );
    
    event BuildingTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    constructor() ERC721('SLG Building', 'SLGB') {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function mintBuilding(
        address to,
        BuildingType buildingType,
        uint8 level,
        uint8 maxLevel
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        tokenId = nextBuildingId++;
        _safeMint(to, tokenId);
        
        Building memory building = Building({
            buildingType: buildingType,
            level: level,
            maxLevel: maxLevel,
            productionBonus: _calculateProductionBonus(buildingType, level),
            defenseBonus: _calculateDefenseBonus(buildingType, level),
            mintedAt: block.timestamp,
            upgradedAt: block.timestamp,
            owner: to
        });
        
        buildings[tokenId] = building;
        ownerBuildings[to].push(tokenId);
        
        emit BuildingMinted(tokenId, to, buildingType, level, block.timestamp);
    }
    
    function upgradeBuilding(uint256 tokenId) external nonReentrant returns (bool success) {
        Building storage building = buildings[tokenId];
        require(ownerOf(tokenId) == msg.sender, 'Not the owner');
        require(building.level < building.maxLevel, 'Already at max level');
        
        uint256 upgradeCost = _getUpgradeCost(building.buildingType, building.level);
        
        building.level++;
        building.upgradedAt = block.timestamp;
        building.productionBonus = _calculateProductionBonus(building.buildingType, building.level);
        building.defenseBonus = _calculateDefenseBonus(building.buildingType, building.level);
        
        emit BuildingUpgraded(tokenId, building.level, upgradeCost, true, block.timestamp);
        
        return true;
    }
    
    function getBuildingData(uint256 tokenId) external view returns (Building memory) {
        return buildings[tokenId];
    }
    
    function getBuildingsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerBuildings[owner];
    }
    
    function getBuildingCount(address owner) external view returns (uint256) {
        return ownerBuildings[owner].length;
    }
    
    function _calculateProductionBonus(BuildingType buildingType, uint8 level) internal pure returns (uint256) {
        if (buildingType == BuildingType.LUMBER_MILL || 
            buildingType == BuildingType.QUARRY || 
            buildingType == BuildingType.FARM) {
            return level * 50;
        }
        return 0;
    }
    
    function _calculateDefenseBonus(BuildingType buildingType, uint8 level) internal pure returns (uint256) {
        if (buildingType == BuildingType.CASTLE || 
            buildingType == BuildingType.WALL ||
            buildingType == BuildingType.WAREHOUSE) {
            return level * 25;
        }
        return 0;
    }
    
    function _getUpgradeCost(BuildingType buildingType, uint8 currentLevel) internal pure returns (uint256) {
        uint256 baseWood = 100;
        uint256 baseStone = 100;
        uint256 baseGold = 50;
        
        uint256 woodCost = baseWood * (currentLevel * currentLevel);
        uint256 stoneCost = baseStone * (currentLevel * currentLevel);
        uint256 goldCost = baseGold * currentLevel;
        
        return woodCost + stoneCost + goldCost;
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            emit BuildingTransferred(tokenId, from, to, block.timestamp);
        }
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
