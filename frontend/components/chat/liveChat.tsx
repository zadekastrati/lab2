'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'user';
  message: string;
  createdAt?: string;
}
interface OutgoingMessage {
  sender_id: string;
  receiver_id: string;
  message: string;
}
interface ChatRoom {
  id: string;
  participantName: string;
  participantId: string;  // For admin UI
}
interface LiveChatProps {
  targetUserId?: string; // 👈 pass the ID of the person you want to chat with
}
const Chat: React.FC<LiveChatProps> = ({ targetUserId }) => {
  // State to hold the effective target user id
  const [activeTargetUserId, setActiveTargetUserId] = useState<string | undefined>(undefined);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRoomId, setChatRoomId] = useState<string>('');
  const [roomMessages, setRoomMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);

  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);


  const socketRef = useRef<Socket | null>(null);
  const chatRoomIdRef = useRef<string>('');

  function getDerivedRoomId(user1: string, user2: string) {
    const sorted = [user1, user2].sort(); // Ensures consistent roomId
    return `${sorted[0]}_${sorted[1]}`;
  }
  
  if (!targetUserId && typeof window !== 'undefined') {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      // silently fallback — no need to warn
    }
  }
  const fetchOrCreateRoom = async (userId1: string, userId2?: string): Promise<string | null> => {
    if (!userId1 || !userId2) return null;
  
    const token = localStorage.getItem('authToken');
    if (!token) return null;
  
    const sortedUsers = [userId1, userId2].sort();
    const roomKey = `chatRoom_${sortedUsers[0]}_${sortedUsers[1]}`;
  
    const storedRoomId = localStorage.getItem(roomKey);
    if (storedRoomId) {
      setChatRoomId(storedRoomId);
      chatRoomIdRef.current = storedRoomId;
      await loadMessages(storedRoomId, token);
      return storedRoomId;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/livechat/rooms/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId1: sortedUsers[0], userId2: sortedUsers[1] }),
      });
  
      if (!res.ok) throw new Error('Failed to create room');
  
      const data = await res.json();
      const roomId = String(data.chatRoomId);
  
      localStorage.setItem(roomKey, roomId);
      setChatRoomId(roomId);
      chatRoomIdRef.current = roomId; // only update ref after state updates            await loadMessages(roomId, token);
      return roomId;
    } catch (err) {
      console.error('Error in fetchOrCreateRoom:', err);
      return null;
    }
  };
  
  useEffect(() => {
    const initChat = async () => {
      const token = localStorage.getItem('authToken');
      const id = localStorage.getItem('userId');
      const name = localStorage.getItem('userName'); 
      const role = localStorage.getItem('userRole');
    
      if (!token || !id || !name || !role) return;
    
      setUserId(id);
      setUserRole(role);
      setUserName(name);
    
      let effectiveTargetId = targetUserId;
    
      if (!effectiveTargetId && role === 'user') {
        effectiveTargetId = '5'; // Admin fallback
        localStorage.setItem('targetUserId', effectiveTargetId);
      }
    
      if (!effectiveTargetId) {
        const stored = localStorage.getItem('targetUserId');
        if (stored) effectiveTargetId = stored;
      }
    
      if (effectiveTargetId) {
        setActiveTargetUserId(effectiveTargetId);
      }
    
      if (role === 'admin') {
        loadAdminRooms();
      } else if (id && effectiveTargetId) {
        const roomId = await fetchOrCreateRoom(id, effectiveTargetId);
        if (roomId) {
          setChatRoomId(roomId);
          chatRoomIdRef.current = roomId;
        }
      }
    };
    initChat();
  }, [targetUserId]);
  
  const loadAdminRooms = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/livechat/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const rooms: ChatRoom[] = Array.isArray(data)
        ? data
        : data.rooms || [];
      setChatRooms(rooms);
  
      // **Fetch messages immediately for each room**
      await Promise.all(
        rooms.map((room) => {
          console.log('Admin joining room:', room.id); // 👈 Add here
          socketRef.current?.emit('joinRoom', { roomId: room.id }); // 🔥 This line ensures admin is listening to messages in those rooms
          return loadMessages(room.id, token);
        })
      );
    } catch (err) {
      console.error('Failed to load admin rooms:', err);
    }
  };
  
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;
  
    const id = localStorage.getItem('userId');
  
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      if (id) {
        socket.emit('registerUser', { user_id: id });
        console.log('Registered user with ID:', id);
      }
    });

    socket.on('newMessage', (msg: ChatMessage) => {
      const roomId = msg.chatRoomId;
    
      // 💡 Skip messages sent by self (they were already added in sendMessage)
      if (msg.senderId === userId.toString()) {
        return;
      }
    
      setRoomMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), msg],
      }));
    
      setChatRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === roomId
            ? { ...room, lastMessage: msg.message, lastMessageTime: msg.createdAt }
            : room
        )
      );
    });
  
      // ✅ NEW: Listen for new room creation
  socket.on('newRoomCreated', (room: ChatRoom) => {
    console.log('New room created:', room);
    setChatRooms((prevRooms) => {
      const exists = prevRooms.some((r) => r.id === room.id);
      return exists ? prevRooms : [room, ...prevRooms];
    });
  });
    
    // Fetch user rooms on mount
    async function fetchUserRooms() {
      const token = localStorage.getItem('authToken');
      if (!token) return;
  
      try {
        const res = await fetch('http://localhost:5000/api/livechat/rooms', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const rooms = data.rooms || [];
        if (rooms.length > 0) {
          setChatRoomId(rooms[0].id);
          loadMessages(rooms[0].id, token);
        }
      } catch (err) {
        console.error('Failed to fetch user rooms:', err);
      }
    }
  
    fetchUserRooms();
  
    return () => {
      socket.off('newMessage');
      socket.off('newRoomCreated');
      socket.off('userRoomAssigned');
      socket.disconnect();
    };
  }, []);
  
  useEffect(() => {
    chatRoomIdRef.current = chatRoomId;
  }, [chatRoomId]);
  
  // 2️⃣ Second useEffect: Join room when chatRoomId is ready and socket is connected
useEffect(() => {
  if (chatRoomId && socketRef.current?.connected) {
    console.log('Joining room:', chatRoomId);
    socketRef.current.emit('joinRoom', { roomId: chatRoomId });
  }
}, [chatRoomId, socketRef.current?.connected]);

  // 👈 trigger re-connection to room if chatRoomId changes
  const loadMessages = async (roomId: string, token: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/livechat/messages?roomId=${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const msgs = Array.isArray(data) ? data : data.messages || [];
  
      setRoomMessages((prev) => ({ ...prev, [roomId]: msgs }));
    } catch (error) {
      console.error('Error loading messages:', error);
      setRoomMessages((prev) => ({ ...prev, [roomId]: [] }));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (chatRoomId && token) {
      loadMessages(chatRoomId, token);
    }
  }, [chatRoomId]);
  
const handleRoomSelect = async (room: ChatRoom) => {
  if (!room || !room.id) return;

  const token = localStorage.getItem('authToken');
  if (!token) return;

  localStorage.setItem('targetUserId', room.participantId);

  if (socketRef.current && chatRoomIdRef.current) {
    socketRef.current.emit('leaveRoom', { roomId: chatRoomIdRef.current });
  }

  setSelectedRoom(room);
  setActiveTargetUserId(room.participantId);

  setLoadingRoom(true); // <--- start loading

  const newRoomId = await fetchOrCreateRoom(userId, room.participantId);

  if (newRoomId) {
    setChatRoomId(newRoomId);
    chatRoomIdRef.current = newRoomId;
  
    // ✅ Fetch messages right after setting the room
    await loadMessages(newRoomId, token);
  }

  setLoadingRoom(false); // <--- done loading
};

const sendMessage = () => {
  const currentChatRoomId = chatRoomId || selectedRoom?.id;
  // Fix receiver_id: use participantId instead of participantUserId
  const targetId = selectedRoom?.participantId?.toString() || activeTargetUserId || localStorage.getItem('targetUserId');
  console.log('Sending message. chatRoomId:', currentChatRoomId, 'selectedRoom:', selectedRoom);

  if (!message.trim()) return;

  if (!currentChatRoomId) {
    alert('Please select a chat room before sending a message.');
    return;
  }

  if (!targetId) {
    alert('Please select a user to chat with.');
    return;
  }

  const newMsg: OutgoingMessage = {
    sender_id: userId.toString(),
    receiver_id: targetId,
    message: message.trim(),
  };

  const payload = {
    chatRoomId: currentChatRoomId,
    ...newMsg,
    sender_id: userId.toString(),   
    senderName: userName,
    senderRole: userRole,   
    createdAt: new Date().toISOString(),
  };

  console.log('[SEND] Sending message:', payload);

  socketRef.current?.emit('sendMessage', payload);
  setMessage('');
};

  if (typeof window !== 'undefined' && (!localStorage.getItem('userId') || !localStorage.getItem('userRole'))) {
    return null;
  }
  return (
    <>
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '50%',
            overflow: 'hidden',
            width: 56,
            height: 56,
            backgroundColor: '#007bff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#007bff')}
          aria-label="Open chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="white"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M2 2h20v16H6l-4 4V2z" />
          </svg>
        </div>
      )}
  
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 360,
            height: 480,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            userSelect: 'none',
            overflow: 'hidden',
            zIndex: 1100,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-header"
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '16px 20px',
              fontWeight: 600,
              fontSize: 18,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
            id="chat-header"
          >
            {userRole === 'admin' && selectedRoom ? (
              <>
                {/* Back arrow button */}
                <button
                  onClick={() => setSelectedRoom(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: 24,
                    cursor: 'pointer',
                    marginRight: 12,
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Back to users list"
                >
                  ←
                </button>
                <span>{selectedRoom.participantName || 'User'}</span>
                <button
                  onClick={() => {
                    setSelectedRoom(null);
                    setIsOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: 24,
                    cursor: 'pointer',
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Close chat"
                >
                  &times;
                </button>
              </>
            ) : (
              <>
                <span>Live Chat</span>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: 24,
                    cursor: 'pointer',
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Close chat"
                >
                  &times;
                </button>
              </>
            )}
          </div>
  
          {/* Admin side: list view or chat view */}
          {userRole === 'admin' && !selectedRoom && (
            <div
              style={{
                padding: '10px 20px',
                borderBottom: '1px solid #eee',
                flex: '0 0 auto',
                overflowY: 'auto',
                backgroundColor: '#f9f9f9',
                maxHeight: 480 - 56, // header height approx
              }}
              role="list"
              aria-label="Chat rooms"
            >
              {chatRooms.length === 0 ? (
                <div
                  style={{
                    color: '#999',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px 0',
                    userSelect: 'none',
                  }}
                >
                  No active chats
                </div>
              ) : (
                chatRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      borderRadius: 8,
                      marginBottom: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontWeight: 600,
                      color: '#007bff',
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'background-color 0.2s ease',
                    }}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') handleRoomSelect(room);
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e7f1ff')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="#007bff"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M2 2h20v16H6l-4 4V2z" />
                    </svg>
                    {room.participantName || 'Unnamed user'}
                  </div>
                ))
              )}
            </div>
          )}
  
          {/* Admin side: chat view */}
          {userRole === 'admin' && selectedRoom && (
            <>
              {/* Messages list */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px 20px',
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#ccc transparent',
                }}
              >
                {(() => {
                  const displayedMessages = chatRoomId ? roomMessages[chatRoomId] || [] : [];
  
                  if (displayedMessages.length === 0) {
                    return (
                      <div
                        style={{
                          margin: 'auto',
                          color: '#999',
                          fontStyle: 'italic',
                          userSelect: 'none',
                        }}
                      >
                        No messages yet.
                      </div>
                    );
                  }
  
                  return displayedMessages.map((msg, idx) => {
                    const isCurrentUser = msg.senderId === userId;
                    const senderNameDisplay =
                      msg.senderRole === 'admin'
                        ? `${msg.senderName || 'Admin'} (admin)`
                        : msg.senderName || 'User';
  
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                          backgroundColor: isCurrentUser ? '#007bff' : '#e4e6eb',
                          color: isCurrentUser ? 'white' : '#050505',
                          padding: '10px 14px',
                          borderRadius: 20,
                          maxWidth: '75%',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          wordBreak: 'break-word',
                          userSelect: 'text',
                          fontSize: 14,
                          lineHeight: 1.4,
                          position: 'relative',
                        }}
                        aria-label={`${senderNameDisplay} message`}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 4,
                            fontSize: 13,
                            opacity: 0.75,
                          }}
                        >
                          {senderNameDisplay}
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    );
                  });
                })()}
              </div>
  
              {/* Input and send button */}
              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 20,
                    border: '1.5px solid #ddd',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#007bff')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#ddd')}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Message to ${selectedRoom.participantName || 'User'}`}
                  aria-label="Type your message"
                />
                <button
                  onClick={sendMessage}
                  style={{
                    marginLeft: 12,
                    backgroundColor: !message.trim() ? '#b5d0ff' : '#007bff',
                    border: 'none',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: 20,
                    cursor: !message.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    userSelect: 'none',
                    transition: 'background-color 0.3s ease',
                  }}
                  disabled={!message.trim()}
                  aria-label="Send message"
                >
                  Send
                </button>
              </div>
            </>
          )}
  
          {/* Non-admin view (unchanged) */}
          {userRole !== 'admin' && (
            <>
              {/* Messages list */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px 20px',
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#ccc transparent',
                }}
              >
                {(() => {
                  const displayedMessages = chatRoomId ? roomMessages[chatRoomId] || [] : [];
  
                  if (displayedMessages.length === 0) {
                    return (
                      <div
                        style={{
                          margin: 'auto',
                          color: '#999',
                          fontStyle: 'italic',
                          userSelect: 'none',
                        }}
                      >
                        No messages yet.
                      </div>
                    );
                  }
  
                  return displayedMessages.map((msg, idx) => {
                    const isCurrentUser = msg.senderId === userId;
                    const senderNameDisplay =
                      msg.senderRole === 'admin'
                        ? `${msg.senderName || 'Admin'} (admin)`
                        : msg.senderName || 'User';
  
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                          backgroundColor: isCurrentUser ? '#007bff' : '#e4e6eb',
                          color: isCurrentUser ? 'white' : '#050505',
                          padding: '10px 14px',
                          borderRadius: 20,
                          maxWidth: '75%',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          wordBreak: 'break-word',
                          userSelect: 'text',
                          fontSize: 14,
                          lineHeight: 1.4,
                          position: 'relative',
                        }}
                        aria-label={`${senderNameDisplay} message`}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 4,
                            fontSize: 13,
                            opacity: 0.75,
                          }}
                        >
                          {senderNameDisplay}
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    );
                  });
                })()}
              </div>
  
              {/* Input and send button */}
              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 20,
                    border: '1.5px solid #ddd',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#007bff')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#ddd')}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  aria-label="Type your message"
                />
                <button
                  onClick={sendMessage}
                  style={{
                    marginLeft: 12,
                    backgroundColor: !message.trim() ? '#b5d0ff' : '#007bff',
                    border: 'none',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: 20,
                    cursor: !message.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    userSelect: 'none',
                    transition: 'background-color 0.3s ease',
                  }}
                  disabled={!message.trim()}
                  aria-label="Send message"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );  
};

export default Chat;
