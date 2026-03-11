const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('BuildingNFT', function () {
  let buildingNFT;
  let owner;
  let addr1;
  let addr2;

  const CASTLE = 0;
  const WAREHOUSE = 1;
  const WALL = 2;
  const LUMBER_MILL = 3;
  const QUARRY = 4;
  const FARM = 5;

  beforeEach(async function () {
    const BuildingNFT = await ethers.getContractFactory('BuildingNFT');
    [owner, addr1, addr2] = await ethers.getSigners();
    buildingNFT = await BuildingNFT.deploy();
    await buildingNFT.waitForDeployment();
  });

  describe('铸造建筑', function () {
    it('应该成功铸造城堡', async function () {
      const tx = await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);

      const receipt = await tx.wait();
      const tokenId = 1;

      const building = await buildingNFT.getBuildingData(tokenId);

      expect(building.buildingType).to.equal(CASTLE);
      expect(building.level).to.equal(1);
      expect(building.maxLevel).to.equal(30);
      expect(await buildingNFT.ownerOf(tokenId)).to.equal(owner.address);
    });

    it('应该成功铸造多个建筑', async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);
      await buildingNFT.mintBuilding(owner.address, WAREHOUSE, 1, 25);
      await buildingNFT.mintBuilding(owner.address, LUMBER_MILL, 1, 20);

      const buildings = await buildingNFT.getBuildingsByOwner(owner.address);

      expect(buildings.length).to.equal(3);
    });

    it('应该正确计算资源建筑产量加成', async function () {
      await buildingNFT.mintBuilding(owner.address, LUMBER_MILL, 10, 20);

      const building = await buildingNFT.getBuildingData(1);

      expect(building.productionBonus).to.equal(500);
    });

    it('应该正确计算防御建筑防御加成', async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 10, 30);

      const building = await buildingNFT.getBuildingData(1);

      expect(building.defenseBonus).to.equal(250);
    });
  });

  describe('升级建筑', function () {
    beforeEach(async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);
    });

    it('应该成功升级建筑', async function () {
      const initialBuilding = await buildingNFT.getBuildingData(1);
      expect(initialBuilding.level).to.equal(1);

      await buildingNFT.upgradeBuilding(1);

      const upgradedBuilding = await buildingNFT.getBuildingData(1);
      expect(upgradedBuilding.level).to.equal(2);
    });

    it('不应该升级到最大等级', async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 29, 30);

      await buildingNFT.upgradeBuilding(2);

      const building = await buildingNFT.getBuildingData(2);
      expect(building.level).to.equal(30);

      await expect(buildingNFT.upgradeBuilding(2)).to.be.revertedWith('Already at max level');
    });

    it('非拥有者不应该升级', async function () {
      await expect(buildingNFT.connect(addr1).upgradeBuilding(1)).to.be.revertedWith(
        'Not the owner',
      );
    });

    it('升级后应该更新属性加成', async function () {
      await buildingNFT.upgradeBuilding(1);

      const building = await buildingNFT.getBuildingData(1);

      expect(building.productionBonus).to.equal(0);
      expect(building.defenseBonus).to.equal(50);
    });
  });

  describe('建筑转移', function () {
    beforeEach(async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 5, 30);
    });

    it('应该成功转移建筑', async function () {
      await buildingNFT.transferFrom(owner.address, addr1.address, 1);

      expect(await buildingNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it('应该更新拥有者建筑列表', async function () {
      await buildingNFT.transferFrom(owner.address, addr1.address, 1);

      const ownerBuildings = await buildingNFT.getBuildingsByOwner(owner.address);
      const newOwnerBuildings = await buildingNFT.getBuildingsByOwner(addr1.address);

      expect(ownerBuildings.length).to.equal(0);
      expect(newOwnerBuildings.length).to.equal(1);
    });

    it('不应该非法转移', async function () {
      await expect(buildingNFT.connect(addr2).transferFrom(owner.address, addr2.address, 1)).to.be
        .reverted;
    });
  });

  describe('查询功能', function () {
    beforeEach(async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);
      await buildingNFT.mintBuilding(owner.address, LUMBER_MILL, 5, 20);
      await buildingNFT.mintBuilding(addr1.address, FARM, 3, 20);
    });

    it('应该正确获取用户建筑数量', async function () {
      const count = await buildingNFT.getBuildingCount(owner.address);
      expect(count).to.equal(2);
    });

    it('应该正确获取建筑详情', async function () {
      const building = await buildingNFT.getBuildingData(1);

      expect(building.buildingType).to.equal(CASTLE);
      expect(building.level).to.equal(1);
      expect(building.maxLevel).to.equal(30);
    });
  });

  describe('事件测试', function () {
    it('应该触发BuildingMinted事件', async function () {
      const tx = await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === 'BuildingMinted',
      );

      expect(event).to.not.be.undefined;
      expect(event.args.buildingType).to.equal(CASTLE);
      expect(event.args.level).to.equal(1);
    });

    it('应该触发BuildingUpgraded事件', async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);

      const tx = await buildingNFT.upgradeBuilding(1);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === 'BuildingUpgraded',
      );

      expect(event).to.not.be.undefined;
      expect(event.args.newLevel).to.equal(2);
      expect(event.args.success).to.equal(true);
    });

    it('应该触发BuildingTransferred事件', async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);

      const tx = await buildingNFT.transferFrom(owner.address, addr1.address, 1);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === 'BuildingTransferred',
      );

      expect(event).to.not.be.undefined;
      expect(event.args.from).to.equal(owner.address);
      expect(event.args.to).to.equal(addr1.address);
    });
  });

  describe('权限控制', function () {
    it('仅MINTER_ROLE可以铸造', async function () {
      await expect(buildingNFT.connect(addr1).mintBuilding(addr1.address, CASTLE, 1, 30)).to.be
        .reverted;
    });

    it('管理员应该可以授予MINTER_ROLE', async function () {
      await buildingNFT.grantRole(await buildingNFT.MINTER_ROLE(), addr1.address);

      await buildingNFT.connect(addr1).mintBuilding(addr1.address, CASTLE, 1, 30);

      const building = await buildingNFT.getBuildingData(1);
      expect(building.buildingType).to.equal(CASTLE);
    });
  });

  describe('Gas使用测试', function () {
    it('铸造应该使用合理的Gas', async function () {
      const tx = await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lessThan(500000);
    });

    it('升级应该使用合理的Gas', async function () {
      await buildingNFT.mintBuilding(owner.address, CASTLE, 1, 30);

      const tx = await buildingNFT.upgradeBuilding(1);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lessThan(300000);
    });
  });
});
