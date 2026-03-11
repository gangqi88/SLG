import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { CookingScene } from '@/features/resource/scenes/CookingScene';

interface CookingViewProps {
  onExit: () => void;
}

const CookingView: React.FC<CookingViewProps> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string>('');

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-cooking-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
      scene: [PreloadScene, CookingScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Set initial data to tell PreloadScene to go to CookingScene
    game.registry.set('startData', { targetScene: 'CookingScene' });

    // Listen for exit event from scene
    game.events.on('exitCooking', () => {
      onExit();
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onExit]);

  const handleInviteFriend = () => {
    if (gameRef.current) {
      // Boost score in game
      gameRef.current.events.emit('boostScore', 50);
      setInviteStatus('Friend Invited! +50 Score!');
      setTimeout(() => setInviteStatus(''), 2000);
    }
  };

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto' }}>
      <div id="phaser-cooking-container" />

      {/* Overlay UI */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '150px', // Positioned to the left of the in-game Exit button (which is at right-100ish)
          zIndex: 10,
        }}
      >
        <button
          onClick={handleInviteFriend}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          }}
        >
          Invite Friend
        </button>
      </div>

      {inviteStatus && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '150px',
            color: '#4CAF50',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '5px',
            borderRadius: '4px',
          }}
        >
          {inviteStatus}
        </div>
      )}
    </div>
  );
};

export default CookingView;
