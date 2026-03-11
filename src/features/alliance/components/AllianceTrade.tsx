import React, { useState } from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import styles from './AllianceTrade.module.css';

export const AllianceTrade: React.FC = () => {
  const { 
    tradeRequests, 
    createTradeRequest, 
    acceptTradeRequest
  } = useAlliance();
  
  const [showCreate, setShowCreate] = useState(false);
  const [offerType, setOfferType] = useState<'resource' | 'hero'>('resource');
  const [offerAmount, setOfferAmount] = useState(1000);
  const [offerResource, setOfferResource] = useState<'wood' | 'stone' | 'food' | 'gold'>('wood');
  const [requestType, setRequestType] = useState<'resource' | 'hero'>('resource');
  const [requestAmount, setRequestAmount] = useState(1000);
  const [requestResource, setRequestResource] = useState<'wood' | 'stone' | 'food' | 'gold'>('gold');

  const handleCreate = async () => {
    createTradeRequest(offerType, offerAmount, offerResource, requestType, requestAmount, requestResource);
    setShowCreate(false);
    alert('Trade request created!');
  };

  const handleAccept = (tradeId: string) => {
    const success = acceptTradeRequest(tradeId);
    if (success) {
      alert('Trade accepted!');
    }
  };

  return (
    <div className={styles.trade}>
      <div className={styles.header}>
        <h3>Trade Center</h3>
        <button className={styles.createButton} onClick={() => setShowCreate(true)}>
          Create Trade
        </button>
      </div>

      {showCreate && (
        <div className={styles.createForm}>
          <h4>Create Trade Request</h4>
          <div className={styles.formSection}>
            <h5>You Offer</h5>
            <div className={styles.formRow}>
              <select value={offerType} onChange={(e) => setOfferType(e.target.value as 'resource' | 'hero')}>
                <option value="resource">Resource</option>
                <option value="hero">Hero</option>
              </select>
              {offerType === 'resource' && (
                <select value={offerResource} onChange={(e) => setOfferResource(e.target.value as any)}>
                  <option value="wood">Wood</option>
                  <option value="stone">Stone</option>
                  <option value="food">Food</option>
                  <option value="gold">Gold</option>
                </select>
              )}
              <input 
                type="number" 
                value={offerAmount} 
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <div className={styles.formSection}>
            <h5>You Request</h5>
            <div className={styles.formRow}>
              <select value={requestType} onChange={(e) => setRequestType(e.target.value as 'resource' | 'hero')}>
                <option value="resource">Resource</option>
                <option value="hero">Hero</option>
              </select>
              {requestType === 'resource' && (
                <select value={requestResource} onChange={(e) => setRequestResource(e.target.value as any)}>
                  <option value="wood">Wood</option>
                  <option value="stone">Stone</option>
                  <option value="food">Food</option>
                  <option value="gold">Gold</option>
                </select>
              )}
              <input 
                type="number" 
                value={requestAmount} 
                onChange={(e) => setRequestAmount(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button onClick={handleCreate} className={styles.confirmButton}>Create</button>
            <button onClick={() => setShowCreate(false)} className={styles.cancelButton}>Cancel</button>
          </div>
        </div>
      )}

      <div className={styles.list}>
        {tradeRequests.filter(t => t.status === 'open').length === 0 ? (
          <div className={styles.empty}>
            <p>No open trade requests</p>
          </div>
        ) : (
          tradeRequests.filter(t => t.status === 'open').map((trade) => (
            <div key={trade.id} className={styles.tradeItem}>
              <div className={styles.tradeInfo}>
                <div className={styles.offer}>
                  <span className={styles.label}>Offers</span>
                  <span className={styles.value}>
                    {trade.offerAmount} {trade.offerResourceType || trade.offerType}
                  </span>
                </div>
                <div className={styles.exchange}>⟷</div>
                <div className={styles.request}>
                  <span className={styles.label}>Requests</span>
                  <span className={styles.value}>
                    {trade.requestAmount} {trade.requestResourceType || trade.requestType}
                  </span>
                </div>
              </div>
              <div className={styles.trader}>
                <span>{trade.creatorName}</span>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleAccept(trade.id)} className={styles.acceptButton}>
                  Accept
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
