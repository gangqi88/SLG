import { useEffect, useState } from 'react';

// Mock event listener type
export interface Web3Event {
  eventName: string;
  data: any;
  blockNumber: number;
  transactionHash: string;
}

export const useAllianceEvents = (allianceId: string | null) => {
  const [lastEvent, setLastEvent] = useState<Web3Event | null>(null);

  useEffect(() => {
    if (!allianceId) return;

    const handleEvent = (event: CustomEvent<Web3Event>) => {
      // In a real Web3 app, we would filter by contract address/topic
      // For now, we simulate filtering by allianceId in the data if applicable
      setLastEvent(event.detail);
      console.log(`[Web3 Event] ${event.detail.eventName}:`, event.detail.data);
    };

    // Listen to global window events dispatched by our mock service
    window.addEventListener('web3-alliance-event', handleEvent as EventListener);

    return () => {
      window.removeEventListener('web3-alliance-event', handleEvent as EventListener);
    };
  }, [allianceId]);

  return { lastEvent };
};

// Helper to dispatch mock events (to be used by MockAllianceService)
export const dispatchMockEvent = (eventName: string, data: any) => {
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
