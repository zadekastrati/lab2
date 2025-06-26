'use client';

import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface Contact {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'closed';
  createdAt: string;
}

interface DecodedToken {
  role?: string;
}

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    if (!token) {
      setError('You must be logged in.');
      router.push('/login');
      return;
    }
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.role === 'admin') {
        setIsAdmin(true);
        fetchContacts();
      } else {
        setError('Access denied. Admins only.');
        router.push('/contact'); // ridrejto userat normal
      }
    } catch {
      setError('Invalid token.');
      router.push('/login');
    }
  }, [token, router]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContacts(data.contacts);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Contact['status']) => {
    try {
      const res = await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchContacts();
    } catch {
      alert('Error updating status');
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete contact');
      fetchContacts();
    } catch {
      alert('Error deleting contact');
    }
  };

  if (error)
    return (
      <div className="p-6 text-center text-red-600 font-semibold bg-red-50 rounded-md max-w-lg mx-auto mt-12">
        {error}
      </div>
    );
  if (!isAdmin)
    return (
      <div className="p-6 text-center text-gray-700 font-medium max-w-lg mx-auto mt-12">
        Checking permissions...
      </div>
    );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">Admin Contact Management</h1>

      {loading && (
        <p className="text-center text-gray-500 italic mb-6">Loading contacts, please wait...</p>
      )}

      {!loading && contacts.length === 0 && (
        <p className="text-center text-gray-500 italic mb-6">No contacts found.</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Subject', 'Message', 'Status', 'Created At', 'Actions'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr key={contact._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-gray-900">{contact.fullName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{contact.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{contact.subject}</td>
                <td className="px-4 py-3 max-w-xs truncate">{contact.message}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={contact.status}
                    onChange={(e) =>
                      updateStatus(contact._id, e.target.value as Contact['status'])
                    }
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="read">Read</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">
                  {new Date(contact.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => deleteContact(contact._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-semibold transition"
                    aria-label={`Delete contact from ${contact.fullName}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
