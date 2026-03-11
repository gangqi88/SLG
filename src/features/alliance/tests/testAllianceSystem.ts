// Mock environment
declare var global: any;
const globalAny: any = global;

// Mock localStorage
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store: Record<string, string> = {};
  globalAny.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const key in store) delete store[key]; },
  };
}

// Mock window for events
if (typeof window === 'undefined') {
  const listeners: Record<string, Function[]> = {};
  globalAny.window = {
    addEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    },
    removeEventListener: (event: string, cb: Function) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(l => l !== cb);
    },
    dispatchEvent: (event: any) => {
      const type = event.type;
      if (listeners[type]) {
        listeners[type].forEach(cb => cb(event));
      }
      return true;
    }
  };
  globalAny.CustomEvent = class CustomEvent {
    type: string;
    detail: any;
    constructor(type: string, options: any) {
      this.type = type;
      this.detail = options.detail;
    }
  };
}

import AllianceManager from '@/features/alliance/logic/AllianceManager';

const runTests = async () => {
  console.log('Starting Alliance System Tests...');
  const manager = AllianceManager.getInstance();
  manager.reset(); // Reset state

  // Test 1: Create Alliance
  console.log('\nTest 1: Create Alliance');
  const alliance = await manager.createAlliance('Test Alliance');
  if (alliance && alliance.name === 'Test Alliance' && manager.hasAlliance()) {
    console.log('✅ Alliance created successfully');
  } else {
    console.error('❌ Failed to create alliance');
  }

  // Test 2: Check-in
  console.log('\nTest 2: Check-in');
  const checkInResult = await manager.checkIn();
  if (checkInResult.contribution > 0 && manager.getContribution() > 0) {
    console.log(`✅ Check-in successful (Contribution: ${checkInResult.contribution})`);
  } else {
    console.error('❌ Check-in failed');
  }

  // Test 3: Chat
  console.log('\nTest 3: Chat');
  await manager.sendChatMessage('Hello Alliance!');
  const messages = manager.getChatHistory();
  if (messages.length > 0 && messages[0].content === 'Hello Alliance!') {
    console.log('✅ Chat message sent and retrieved');
  } else {
    console.error('❌ Chat test failed');
  }

  // Test 4: Shop Purchase
  console.log('\nTest 4: Shop Purchase');
  // Add some contribution first
  manager.contributeResource('gold', 1000);
  const shopItems = manager.getShopItems();
  const item = shopItems[0];
  const initialContribution = manager.getContribution();
  
  if (initialContribution >= item.price) {
    const purchaseSuccess = await manager.buyShopItem(item.id);
    if (purchaseSuccess && manager.getContribution() < initialContribution) {
      console.log('✅ Shop purchase successful');
    } else {
      console.error('❌ Shop purchase failed');
    }
  } else {
    console.log('⚠️ Skipping purchase test (insufficient funds)');
  }

  // Test 5: Tech Upgrade
  console.log('\nTest 5: Tech Upgrade');
  manager.contributeResource('gold', 1000); // More funds
  const techList = manager.getTechInfo();
  const tech = techList[0];
  
  if (manager.getContribution() >= tech.costPerLevel) {
    const upgradeSuccess = await manager.upgradeTech(tech.id);
    if (upgradeSuccess) {
      console.log('✅ Tech upgrade successful');
    } else {
      console.error('❌ Tech upgrade failed');
    }
  } else {
    console.log('⚠️ Skipping tech upgrade test (insufficient funds)');
  }

  // Test 6: Treasury
  console.log('\nTest 6: Treasury');
  const depositAmount = 100;
  const initialTreasury = await manager.getTreasuryBalance();
  const depositSuccess = await manager.depositToTreasury(depositAmount);
  
  // Wait a bit for mock delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  const finalTreasury = await manager.getTreasuryBalance();
  
  if (depositSuccess && BigInt(finalTreasury) > BigInt(initialTreasury)) {
    console.log('✅ Treasury deposit successful');
  } else {
    console.error(`❌ Treasury deposit failed (Initial: ${initialTreasury}, Final: ${finalTreasury})`);
  }

  console.log('\nTests Completed.');
};

runTests().catch(console.error);

export default runTests;
