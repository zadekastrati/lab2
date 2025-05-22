'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  sender: string;
  message: string;
  receiver?: string;
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState('');
  const [userList, setUserList] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);

  // Update auth state based on localStorage
  const updateAuthState = () => {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = Boolean(token);

    setIsAuthenticated(isLoggedIn);
    setUserRole(isLoggedIn ? localStorage.getItem('userRole') || 'user' : '');
    setUserName(isLoggedIn ? localStorage.getItem('userName') || 'user' : '');
    if (!isLoggedIn) setMessages([]);
  };

  // Listen for storage changes (e.g. logout in another tab)
  useEffect(() => {
    updateAuthState();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load active chat user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('activeChatUser');
    if (storedUser) setActiveChatUser(storedUser);
  }, []);

  // Updated: Fetch messages with activeChatUser filtering for admin
 // Load messages and userList for admin
useEffect(() => {
  if (!isAuthenticated) return;

  const token = localStorage.getItem('authToken');
  if (!token) return;

  let url = 'http://localhost:5000/api/livechat/messages';
  if (userRole === 'admin' && activeChatUser) {
    url += `?chatWith=${encodeURIComponent(activeChatUser)}`;
  }

  fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        const loadedMessages = data.map((msg: any) => ({
          sender: msg.sender,
          message: msg.message,
          receiver: msg.receiver,
        }));
        setMessages(loadedMessages);

        if (userRole === 'admin') {
          let savedUsers = localStorage.getItem('userList');
          let users: string[] = [];

          if (savedUsers) {
            users = JSON.parse(savedUsers);
          } else {
            users = Array.from(
              new Set(
                loadedMessages
                  .filter((m) => m.sender !== 'admin')
                  .map((m) => m.sender)
              )
            );
            localStorage.setItem('userList', JSON.stringify(users));
          }

          setUserList(users);

          // Set the first active user if not set
          if (!activeChatUser && users.length > 0) {
            setActiveChatUser(users[0]);
            localStorage.setItem('activeChatUser', users[0]);
          }
        }
      } else {
        console.error('Expected array of messages:', data);
      }
    })
    .catch((err) => console.error('Error loading chat history:', err));
}, [isAuthenticated, userRole, activeChatUser]);

// Load userList from localStorage on mount
useEffect(() => {
  if (userRole === 'admin') {
    const savedUsers = localStorage.getItem('userList');
    if (savedUsers) {
      setUserList(JSON.parse(savedUsers));
    }
  }
}, [userRole]);

  // Setup socket connection on auth and role
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const socket = io('http://localhost:5000', {
      query: { token },
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    socket.on('chatMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);

      if (userRole === 'admin' && msg.sender !== 'admin') {
        setUserList((prev) => {
          const updated = prev.includes(msg.sender) ? prev : [...prev, msg.sender];
          localStorage.setItem('userList', JSON.stringify(updated));
          return updated;
        });
      
        if (!activeChatUser) {
          setActiveChatUser(msg.sender);
          localStorage.setItem('activeChatUser', msg.sender);
        }
      }
      
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Connection Error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, userRole, activeChatUser]);

  // Send a chat message
  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;

    const senderLabel = userRole === 'admin' ? 'admin' : userName;
    const receiver = userRole === 'admin' ? activeChatUser : 'admin';

    const newMsg: ChatMessage = {
      sender: senderLabel,
      message: message.trim(),
      receiver,
    };

    socketRef.current.emit('chatMessage', newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
  };

  // Select active chat user (admin only)
  const handleChatUserClick = (user: string) => {
    setActiveChatUser(user);
    localStorage.setItem('activeChatUser', user);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <div
            style={{
              position: 'absolute',
              right: 70,
              bottom: 10,
              background: '#333',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: 14,
              animation: 'floatText 1.5s ease-in-out infinite alternate',
              whiteSpace: 'nowrap',
            }}
          >
            Need help?
          </div>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              fontSize: 24,
            }}
            aria-label="Open chat"
          >
            💬
          </button>
        </div>
      )}
  
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 320,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 8,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <h4 style={{ margin: 0 }}>Live Chat</h4>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              ✖
            </button>
          </div>
  
          {/* Admin: User List */}
          {userRole === 'admin' && userList.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <strong>Users:</strong>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {userList.map((user) => (
                  <button
                    key={user}
                    onClick={() => handleChatUserClick(user)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: activeChatUser === user ? '#007bff' : '#eee',
                      color: activeChatUser === user ? '#fff' : '#000',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {user}
                  </button>
                ))}
              </div>
            </div>
          )}
  
          {/* Messages with Bubble Styling */}
          <div
            style={{
              height: 200,
              overflowY: 'auto',
              marginBottom: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              paddingRight: '4px',
            }}
          >
            {messages
              .filter((msg) => {
                if (userRole === 'admin') {
                  return (
                    msg.sender === activeChatUser ||
                    (msg.sender === 'admin' && msg.receiver === activeChatUser)
                  );
                } else {
                  return (
                    (msg.sender === userName && msg.receiver === 'admin') ||
                    (msg.sender === 'admin' && msg.receiver === userName)
                  );
                }
              })
              .map((msg, index) => {
                const isSender = msg.sender === (userRole === 'admin' ? 'admin' : userName);
  
                return (
                  <div
                    key={index}
                    style={{
                      alignSelf: isSender ? 'flex-end' : 'flex-start',
                      backgroundColor: isSender ? '#007bff' : '#f1f1f1',
                      color: isSender ? '#fff' : '#000',
                      padding: '8px 12px',
                      borderRadius: '16px',
                      maxWidth: '75%',
                      wordBreak: 'break-word',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ fontSize: 12, marginBottom: 2, opacity: 0.7 }}>
                      {msg.sender}
                    </div>
                    <div style={{ fontSize: 14 }}>{msg.message}</div>
                  </div>
                );
              })}
          </div>
  
          {/* Message input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              width: '100%',
              marginTop: 5,
              padding: '8px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      )}
  
      {/* Floating Text Animation */}
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
