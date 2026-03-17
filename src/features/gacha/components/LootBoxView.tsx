import React, { useState, useEffect } from 'react';
import InventoryManager from '@/features/resource/logic/InventoryManager';
import { InventoryItem } from '@/features/gacha/types/LootBox';

const LootBoxView: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedBox, setSelectedBox] = useState<InventoryItem | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<{ item: InventoryItem }[] | null>(null);

  useEffect(() => {
    const updateInventory = () => {
      setInventory(InventoryManager.getItems());
    };

    updateInventory();
    const unsubscribe = InventoryManager.subscribe(updateInventory);
    return unsubscribe;
  }, []);

  const handleOpenBox = () => {
    if (!selectedBox || isOpening) return;

    setIsOpening(true);
    setReward(null);

    // Simulate animation delay
    setTimeout(() => {
      const result = InventoryManager.openBox(selectedBox.item.id);
      setReward(result as { item: InventoryItem }[]); // Type assertion for simplicity
      setIsOpening(false);
      // Determine if we still have boxes of this type
      const updatedInv = InventoryManager.getItems();
      const stillHasBox = updatedInv.find((i) => i.item.id === selectedBox.item.id);
      if (!stillHasBox) {
        setSelectedBox(null);
      } else {
        setSelectedBox(stillHasBox);
      }
    }, 1500); // 1.5s animation
  };

  const handleSelectBox = (box: InventoryItem) => {
    if (!isOpening) {
      setSelectedBox(box);
    }
  };

  const handleBoxKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, box: InventoryItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelectBox(box);
    }
  };

  const boxes = inventory.filter((i) => i.item.type === 'box');
  const otherItems = inventory.filter((i) => i.item.type !== 'box');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Inventory & Loot Boxes</h2>
        <button onClick={onExit} style={styles.closeBtn}>
          X
        </button>
      </div>

      <div style={styles.content}>
        {/* Box List */}
        <div style={styles.section}>
          <h3>Loot Boxes</h3>
          <div style={styles.grid}>
            {boxes.length === 0 && <p>No loot boxes found.</p>}
            {boxes.map((box) => (
              <div
                key={box.item.id}
                style={{
                  ...styles.itemCard,
                  borderColor: selectedBox?.item.id === box.item.id ? '#ffd700' : '#444',
                }}
                onClick={() => handleSelectBox(box)}
                onKeyDown={(event) => handleBoxKeyDown(event, box)}
                role="button"
                tabIndex={isOpening ? -1 : 0}
              >
                <div style={styles.icon}>🎁</div>
                <div>{box.item.name}</div>
                <div>x{box.quantity}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Items */}
        <div style={styles.section}>
          <h3>Resources & Fragments</h3>
          <div style={styles.grid}>
            {otherItems.length === 0 && <p>Empty inventory.</p>}
            {otherItems.map((item) => (
              <div key={item.item.id} style={styles.itemCard}>
                <div style={styles.icon}>{item.item.type === 'resource' ? '🪵' : '🧩'}</div>
                <div>{item.item.name}</div>
                <div>x{item.quantity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opening Modal/Overlay */}
      {selectedBox && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{selectedBox.item.name}</h3>
            <p>{selectedBox.item.description}</p>

            <div style={{ margin: '20px 0', fontSize: '48px' }}>
              <span className={isOpening ? 'shaking-box' : ''}>🎁</span>
            </div>

            {reward && (
              <div style={styles.reward}>
                <h4>You received:</h4>
                {reward.map((r, idx) => (
                  <div key={idx}>
                    {r.item.quantity}x {r.item.item.name}
                  </div>
                ))}
              </div>
            )}

            {!isOpening && !reward && (
              <button onClick={handleOpenBox} style={styles.openBtn}>
                Open Box
              </button>
            )}

            {!isOpening && (
              <button
                onClick={() => {
                  setSelectedBox(null);
                  setReward(null);
                }}
                style={styles.cancelBtn}
              >
                {reward ? 'Close' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .shaking-box {
          display: inline-block;
          animation: shake 0.5s;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
    color: '#fff',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '15px',
    backgroundColor: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #444',
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  section: {
    marginBottom: '30px',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
  },
  itemCard: {
    backgroundColor: '#333',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#444',
    borderRadius: '8px',
    padding: '10px',
    width: '100px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  icon: {
    fontSize: '32px',
    marginBottom: '5px',
  },
  closeBtn: {
    backgroundColor: '#ff4444',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  modal: {
    backgroundColor: '#333',
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    minWidth: '300px',
    border: '1px solid #555',
  },
  openBtn: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    marginRight: '10px',
  },
  cancelBtn: {
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  reward: {
    margin: '20px 0',
    padding: '10px',
    backgroundColor: '#444',
    borderRadius: '5px',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
};

export default LootBoxView;
