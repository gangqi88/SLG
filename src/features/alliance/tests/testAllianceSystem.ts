/* eslint-disable no-console */

// Mock environment
class MockCustomEvent<T = unknown> extends Event implements CustomEvent<T> {
  detail: T;

  constructor(type: string, options?: CustomEventInit<T>) {
    super(type, options);
    this.detail = options?.detail as T;
  }

  initCustomEvent(type: string, bubbles?: boolean, cancelable?: boolean, detail?: T): void {
    this.initEvent(type, bubbles ?? false, cancelable ?? false);
    this.detail = detail as T;
  }
}

const globalObject = globalThis as typeof globalThis & {
  localStorage?: Storage;
  window?: Window;
  CustomEvent?: typeof CustomEvent;
};

// Mock localStorage
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store: Record<string, string> = {};
  globalObject.localStorage = {
    get length() {
      return Object.keys(store).length;
    },
    getItem: (key: string) => store[key] || null,
    key: (index: number) => Object.keys(store)[index] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key in store) delete store[key];
    },
  };
}

// Mock window for events
if (typeof window === 'undefined') {
  const listeners: Record<string, EventListenerOrEventListenerObject[]> = {};
  const mockWindow = {
    addEventListener: (event: string, cb: EventListenerOrEventListenerObject) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    },
    removeEventListener: (event: string, cb: EventListenerOrEventListenerObject) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((l) => l !== cb);
    },
    dispatchEvent: (event: Event) => {
      const type = event.type;
      if (listeners[type]) {
        listeners[type].forEach((cb) => {
          if (typeof cb === 'function') {
            cb(event);
          } else {
            cb.handleEvent(event);
          }
        });
      }
      return true;
    },
  } as unknown as Window & typeof globalThis;

  globalObject.window = mockWindow;
  globalObject.CustomEvent = MockCustomEvent as typeof CustomEvent;
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
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const finalTreasury = await manager.getTreasuryBalance();

  if (depositSuccess && BigInt(finalTreasury) > BigInt(initialTreasury)) {
    console.log('✅ Treasury deposit successful');
  } else {
    console.error(
      `❌ Treasury deposit failed (Initial: ${initialTreasury}, Final: ${finalTreasury})`,
    );
  }

  console.log('\nTests Completed.');
};

runTests().catch(console.error);

export default runTests;
