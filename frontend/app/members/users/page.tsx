'use client';

import { useEffect, useState } from 'react';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import Loader from '@components/Loader/Loader';
import Request, { type IRequest, type IResponse } from '@utils/Request';
import { FaTrash } from 'react-icons/fa'; // ✅ Trash icon

interface User {
  id: number;
  name: string;
  email: string;
}

const Page: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    const requestParams: IRequest = {
      url: 'http://localhost:5000/api/users',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    };

    try {
      const res: IResponse = await Request.getResponse(requestParams);

      if (res.status === 200 && Array.isArray(res.data.results)) {
        setUsers(res.data.results);
      } else {
        setError('Failed to load users');
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;
  
    const token = localStorage.getItem('authToken');
    console.log('Deleting user with token:', token); // Debugging line
  
    const requestParams: IRequest = {
      url: `http://localhost:5000/api/users/${userId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  
    try {
      const res: IResponse = await Request.getResponse(requestParams);
      console.log('Response status:', res.status); // Debugging line
      // Check if status is 200 (successful deletion)
      if (res.status === 200) {
        console.log('User deleted successfully');
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        // Safely check if message exists before accessing it
const errorMessage = (res.data as { message?: string })?.message || 'Failed to delete user';
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      // Display a more detailed error message in the alert
      alert(`Failed to delete user: ${err.message || 'Unknown error'}`);
    }
  };
  
  

  if (loading) {
    return <Loader type="page" color="gray" text="Loading users..." />;
  }

  if (error) {
    return (
      <Master>
        <Section>
          <div className="container center">
            <p className="red">{error}</p>
          </div>
        </Section>
      </Master>
    );
  }

  return (
    <Master>
      <Section className="white-background">
        <div className="container">
          <div className="center">
            <Heading type={1} color="gray" text="Registered Users" />
            <p className="gray form-information">List of all registered users:</p>
            
            {/* Table structure with borders and rounded corners */}
            <table className="min-w-full mt-4 border-separate border-spacing-0 border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-300 rounded-tl-lg">Name</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Email</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-300 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b border-gray-300">{user.name}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{user.email}</td>
                    <td className="py-2 px-4 text-center border-b border-gray-300">
                      <button
                        className="text-red-500 hover:text-red-700 transition"
                        onClick={() => handleDelete(user.id)}
                        title="Delete user"
                      >
                        <FaTrash style={{color:'red'}} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </Master>
  );  
};

export default Page;
