const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('AllianceNFT', function () {
  let allianceNFT;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    const AllianceNFT = await ethers.getContractFactory('AllianceNFT');
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    allianceNFT = await AllianceNFT.deploy();
    await allianceNFT.waitForDeployment();
  });

  describe('创建联盟', function () {
    it('应该成功创建联盟', async function () {
      const tx = await allianceNFT.createAlliance('Test Alliance');
      const receipt = await tx.wait();

      const allianceId = 1;
      const alliance = await allianceNFT.getAllianceData(allianceId);

      expect(alliance.name).to.equal('Test Alliance');
      expect(alliance.level).to.equal(1);
      expect(alliance.exists).to.equal(true);
      expect(await allianceNFT.ownerOf(allianceId)).to.equal(owner.address);
    });

    it('不应该创建空名称的联盟', async function () {
      await expect(allianceNFT.createAlliance('')).to.be.revertedWith('Name cannot be empty');
    });

    it('应该正确设置成员', async function () {
      await allianceNFT.createAlliance('Test Alliance');

      const memberAlliance = await allianceNFT.getMemberAlliance(owner.address);
      expect(memberAlliance).to.equal(1);
    });
  });

  describe('加入联盟', function () {
    beforeEach(async function () {
      await allianceNFT.createAlliance('Test Alliance');
    });

    it('应该成功加入联盟', async function () {
      await allianceNFT.connect(addr1).joinAlliance(1);

      const memberAlliance = await allianceNFT.getMemberAlliance(addr1.address);
      expect(memberAlliance).to.equal(1);
    });

    it('不应该加入不存在的联盟', async function () {
      await expect(allianceNFT.connect(addr1).joinAlliance(999)).to.be.revertedWith(
        'Alliance does not exist',
      );
    });

    it('不应该重复加入联盟', async function () {
      await allianceNFT.connect(addr1).joinAlliance(1);

      await expect(allianceNFT.connect(addr1).joinAlliance(1)).to.be.revertedWith(
        'Already in an alliance',
      );
    });

    it('不应该加入满员联盟', async function () {
      const testAddresses = [];
      for (let i = 0; i < 9; i++) {
        const addr = ethers.Wallet.createRandom().connect(ethers.provider);
        testAddresses.push(addr);
        await allianceNFT.connect(addr).joinAlliance(1);
      }

      const randomWallet = ethers.Wallet.createRandom().connect(ethers.provider);
      await expect(allianceNFT.connect(randomWallet).joinAlliance(1)).to.be.revertedWith(
        'Alliance is full',
      );
    });
  });

  describe('离开联盟', function () {
    beforeEach(async function () {
      await allianceNFT.createAlliance('Test Alliance');
      await allianceNFT.connect(addr1).joinAlliance(1);
    });

    it('应该成功离开联盟', async function () {
      await allianceNFT.connect(addr1).leaveAlliance();

      const memberAlliance = await allianceNFT.getMemberAlliance(addr1.address);
      expect(memberAlliance).to.equal(0);
    });

    it('不应该离开不在联盟中的地址', async function () {
      await expect(allianceNFT.connect(addr2).leaveAlliance()).to.be.revertedWith(
        'Not in any alliance',
      );
    });
  });

  describe('贡献系统', function () {
    beforeEach(async function () {
      await allianceNFT.createAlliance('Test Alliance');
    });

    it('应该成功存款到贡献池', async function () {
      const initialBalance = await allianceNFT.getAllianceData(1);

      await allianceNFT.contribute(1, { value: ethers.parseEther('1') });

      const afterBalance = await allianceNFT.getAllianceData(1);
      expect(afterBalance.contributionPool).to.equal(ethers.parseEther('1'));
    });

    it('不应该存款0', async function () {
      await expect(allianceNFT.contribute(1, { value: 0 })).to.be.revertedWith(
        'Contribution must be greater than 0',
      );
    });
  });

  describe('国库系统', function () {
    beforeEach(async function () {
      await allianceNFT.createAlliance('Test Alliance');
    });

    it('应该成功存款到国库', async function () {
      await allianceNFT.depositToTreasury(1, { value: ethers.parseEther('2') });

      const alliance = await allianceNFT.getAllianceData(1);
      expect(alliance.treasuryBalance).to.equal(ethers.parseEther('2'));
    });

    it('应该成功从国库取款', async function () {
      await allianceNFT.depositToTreasury(1, { value: ethers.parseEther('2') });

      const initialBalance = await ethers.provider.getBalance(owner.address);

      await allianceNFT.withdrawFromTreasury(1, ethers.parseEther('1'), owner.address);

      const alliance = await allianceNFT.getAllianceData(1);
      expect(alliance.treasuryBalance).to.equal(ethers.parseEther('1'));
    });

    it('非盟主不应该取款', async function () {
      await allianceNFT.depositToTreasury(1, { value: ethers.parseEther('2') });

      await expect(
        allianceNFT.connect(addr1).withdrawFromTreasury(1, ethers.parseEther('1'), addr1.address),
      ).to.be.revertedWith('Only alliance owner can withdraw');
    });
  });

  describe('升级系统', function () {
    beforeEach(async function () {
      await allianceNFT.createAlliance('Test Alliance');
      await allianceNFT.contribute(1, { value: ethers.parseEther('100') });
    });

    it('应该成功升级联盟', async function () {
      const initialAlliance = await allianceNFT.getAllianceData(1);
      expect(initialAlliance.level).to.equal(1);

      await allianceNFT.upgradeLevel(1);

      const afterAlliance = await allianceNFT.getAllianceData(1);
      expect(afterAlliance.level).to.equal(2);
    });

    it('不应该超过最大等级', async function () {
      await allianceNFT.contribute(1, { value: ethers.parseEther('1000000') });

      for (let i = 0; i < 7; i++) {
        await allianceNFT.upgradeLevel(1);
      }

      await expect(allianceNFT.upgradeLevel(1)).to.be.revertedWith('Already at max level');
    });
  });

  describe('事件测试', function () {
    it('应该触发AllianceCreated事件', async function () {
      const tx = await allianceNFT.createAlliance('Event Alliance');
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === 'AllianceCreated',
      );

      expect(event).to.not.be.undefined;
      expect(event.args.name).to.equal('Event Alliance');
    });

    it('应该触发MemberJoined事件', async function () {
      await allianceNFT.createAlliance('Test Alliance');

      const tx = await allianceNFT.connect(addr1).joinAlliance(1);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === 'MemberJoined',
      );

      expect(event).to.not.be.undefined;
    });
  });
});
