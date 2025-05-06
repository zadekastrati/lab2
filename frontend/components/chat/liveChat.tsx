'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
});

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const updateAuthState = () => {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = !!token;
    setIsAuthenticated(isLoggedIn);

    if (isLoggedIn) {
      setUserRole(localStorage.getItem('userRole') || 'User');
      setUserName(localStorage.getItem('userName') || 'User');
    } else {
      setUserRole('');
      setUserName('');
      setMessages([]);
    }
  };

  useEffect(() => {
    updateAuthState();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        updateAuthState();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    socket.on('chatMessage', (msg: { sender: string; content: string }) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const sendMessage = () => {
    if (message.trim()) {
      const senderLabel = userRole === 'Admin' ? 'Admin' : userName;
      socket.emit('chatMessage', {
        sender: senderLabel,
        content: message,
      });
      setMessage('');
    }
  };

  return (
    <>
      {/* Chat Bubble with Floating Text */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
          }}
        >
          {/* Floating Text */}
          <div
            style={{
              position: 'absolute',
              right: '70px',
              bottom: '10px',
              background: '#333',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              animation: 'floatText 1.5s ease-in-out infinite alternate',
              whiteSpace: 'nowrap',
            }}
          >
            Need help?
          </div>

          {/* Bubble Button */}
          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              fontSize: '24px',
            }}
            aria-label="Open chat"
          >
            💬
          </button>
        </div>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '300px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <h4 style={{ margin: 0 }}>Live Chat</h4>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ✖
            </button>
          </div>

          <div style={{ height: 200, overflowY: 'auto', marginBottom: 8 }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <strong>{msg.sender}:</strong> {msg.content}
              </div>
            ))}
          </div>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{ width: '100%' }}
          />
          <button onClick={sendMessage} style={{ width: '100%', marginTop: 5 }}>
            Send
          </button>
        </div>
      )}

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes floatText {
            from {
              transform: translateY(0);
              opacity: 1;
            }
            to {
              transform: translateY(-5px);
              opacity: 0.8;
            }
          }
        `}
      </style>
    </>
  );
};

export default Chat;
