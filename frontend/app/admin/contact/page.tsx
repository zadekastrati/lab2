'use client';

import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { Trash2, Moon, Sun } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(savedMode);
    }
  }, []);

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
        router.push('/contact');
      }
    } catch {
      setError('Invalid token.');
      router.push('/login');
    }
  }, [token, router]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContacts(data.contacts);
    } catch (err: any) {
      setError(err.message || 'Error loading contacts.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Contact['status']) => {
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

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Delete this message?');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchContacts();
    } catch {
      alert('Error deleting contact');
    }
  };

  const getStatusBadge = (status: Contact['status']) => {
    const colorMap = {
      pending: darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
      read: darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
      closed: darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorMap[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (error) {
    return (
      <div className={`max-w-xl mx-auto mt-12 p-6 ${darkMode ? 'bg-red-900' : 'bg-red-100'} ${darkMode ? 'text-red-100' : 'text-red-700'} text-center font-semibold rounded-md shadow`}>
        {error}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-12 text-lg font-medium`}>
        Checking permissions...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
            🛡️ Admin Contact Management
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className={`overflow-x-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl rounded-2xl border transition-all`}>
          <table className="min-w-full text-sm">
            <thead className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'} uppercase font-bold`}>
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Subject</th>
                <th className="px-6 py-4 text-left">Message</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {contacts.map((contact) => (
                <tr key={contact._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                  <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{contact.fullName}</td>
                  <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{contact.email}</td>
                  <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{contact.subject}</td>
                  <td className={`px-6 py-4 max-w-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{contact.message}</td>
                  <td className="px-6 py-4">
                    <select
                      value={contact.status}
                      onChange={(e) => handleStatusChange(contact._id, e.target.value as Contact['status'])}
                      className={`rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} px-3 py-1 text-sm focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'}`}
                    >
                      <option value="pending" className={darkMode ? 'bg-gray-700' : 'bg-white'}>🟡 Pending</option>
                      <option value="read" className={darkMode ? 'bg-gray-700' : 'bg-white'}>🟢 Read</option>
                      <option value="closed" className={darkMode ? 'bg-gray-700' : 'bg-white'}>🔴 Closed</option>
                    </select>
                  </td>
                  <td className={`px-6 py-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(contact.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className={`p-2 rounded-full transition ${darkMode ? 'bg-red-900 hover:bg-red-800 text-red-200' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className={`text-center py-6 italic animate-pulse ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Loading messages...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}