export interface Notification {
  _id: string;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  event?: {
    id: number;
    name: string;
    photo: string;
    date: string;
    location: string;
    price: number;
    categoryId: number;
  } | null;
}

const API_BASE = 'http://localhost:5000/api/notifications';

export async function fetchNotificationsByUser(userId: number): Promise<Notification[]> {
  const res = await fetch(`${API_BASE}/${userId}`);

  if (!res.ok) {
    throw new Error('Failed to fetch notifications');
  }

  const data = await res.json();
  return data;
}

export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  const res = await fetch(`${API_BASE}/read/${notificationId}`, {
    method: 'PUT',
  });

  if (!res.ok) {
    throw new Error('Failed to mark notification as read');
  }

  return await res.json();
}

export async function deleteNotification(notificationId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/${notificationId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete notification');
  }

  return await res.json();
}

export async function createNotification(data: { userId: number; eventId: number; message: string }) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create notification');
  }

  return await res.json();
}
