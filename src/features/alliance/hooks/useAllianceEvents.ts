// Mock event listener type
export interface Web3Event {
  eventName: string;
  data: unknown;
  blockNumber: number;
  transactionHash: string;
}

// Helper to dispatch mock events (to be used by MockAllianceService)
export const dispatchMockEvent = (eventName: string, data: unknown) => {
  const event = new CustomEvent('web3-alliance-event', {
    detail: {
      eventName,
      data,
      blockNumber: Math.floor(Date.now() / 1000),
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
    },
  });
  window.dispatchEvent(event);
};
