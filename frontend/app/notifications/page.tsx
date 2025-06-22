'use client';

import React, { useEffect, useState } from 'react';
import NotificationList from '../../components/notifications/NotificationList';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  event?: {
    id: number;
    name: string;
  } | null;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications/USER_ID'); // Zëvendëso USER_ID me userin aktual
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  if (loading) return <p>Po ngarkohet...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Njoftimet e mia</h1>
      <NotificationList notifications={notifications} />
    </div>
  );
};

export default NotificationsPage;
