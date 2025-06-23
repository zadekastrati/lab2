'use client';

import React from 'react';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  event?: {
    id: number;
    name: string;
    // Shto fushat që të duhen nga eventi
  } | null;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void; // opsionale, për markimin si lexuar
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onMarkAsRead }) => {
  if (notifications.length === 0) {
    return <p className="p-4 text-center text-gray-500">Nuk ka njoftime.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
      {notifications.map((notif) => (
        <li
          key={notif._id}
          className={`p-3 cursor-pointer hover:bg-gray-100 ${
            notif.isRead ? 'bg-white' : 'bg-blue-50 font-semibold'
          }`}
          onClick={() => onMarkAsRead && onMarkAsRead(notif._id)}
          title={new Date(notif.createdAt).toLocaleString()}
        >
          <div>
            <p>{notif.message}</p>
            {notif.event && (
              <small className="text-gray-400">Event: {notif.event.name}</small>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NotificationList;
