'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell } from 'lucide-react';

interface Notification {
  _id: string;
  userId: number;
  eventId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Do të ruajmë socket-in jashtë komponentit për të shmangur lidhjet e shumëfishta
let socket: Socket;

const NotificationBell = ({ userId }: { userId: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Lidhu me serverin socket.io
    socket = io('http://localhost:5000');

    // Bashkangjitu room-it të përdoruesit
    socket.emit('joinRoom', userId);

    // Merr njoftime të reja nga serveri në real-time
    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
    });

    // Merr njoftimet ekzistuese nga REST API backend
    fetch(`http://localhost:5000/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);

    // Pastro socket-in kur komponenti çmontohet
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <Bell />
        {notifications.some(n => !n.isRead) && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border shadow-md rounded-md z-50 max-h-96 overflow-y-auto">
          <ul>
            {notifications.map(notif => (
              <li
                key={notif._id}
                className={`p-2 border-b ${notif.isRead ? 'bg-gray-100' : 'bg-white font-bold'}`}
              >
                {notif.message}
                <br />
                <small>{new Date(notif.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
