import React, { useState, useRef, useEffect } from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import styles from './AllianceChat.module.css';

export const AllianceChat: React.FC = () => {
  const { chatMessages, sendChatMessage } = useAlliance();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendChatMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageType = (type: string) => {
    const types = {
      normal: { label: '', class: '' },
      system: { label: 'System', class: styles.systemMessage },
      announcement: { label: 'Announcement', class: styles.announcementMessage },
    };
    return types[type as keyof typeof types] || types.normal;
  };

  return (
    <div className={styles.chat}>
      <div className={styles.messages}>
        {chatMessages.length === 0 ? (
          <div className={styles.empty}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const msgType = getMessageType(msg.type);
            return (
              <div key={msg.id} className={`${styles.message} ${msgType.class}`}>
                <div className={styles.messageHeader}>
                  <span className={styles.sender}>{msg.senderName}</span>
                  {msgType.label && <span className={styles.type}>{msgType.label}</span>}
                  <span className={styles.time}>{formatTime(msg.timestamp)}</span>
                </div>
                <div className={styles.content}>{msg.content}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button onClick={handleSend} className={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};
