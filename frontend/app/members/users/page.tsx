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
      if (res.status === 200) {
        console.log('User deleted successfully');
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        const errorMessage = (res.data as { message?: string })?.message || 'Failed to delete user';
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message || 'Unknown error'}`);
    }
  };

  const userRole = localStorage.getItem('userRole'); // Store user role after login
  
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
            
            {/* Render the table only for admin */}
            {userRole === 'admin' && (
           <table
           style={{
             width: '100%',
             maxWidth: '1120px',
             margin: '3rem auto 0',
             borderRadius: '1rem',
             boxShadow: '0 25px 50px -12px rgba(128, 90, 213, 0.25)',
             border: '1px solid #d1d5db', // Tailwind gray-300
             overflow: 'hidden',
             fontFamily: "'Inter', sans-serif",
           }}
         >
           <thead
             style={{
               background: '#007bff', 
               color: 'white',
               position: 'sticky',
               top: 0,
               zIndex: 10,
               userSelect: 'none',
             }}
           >
             <tr>
               {['Name', 'Email', 'Actions'].map((text, i) => (
                 <th
                   key={text}
                   style={{
                     padding: '1.25rem 2rem',
                     textAlign: i === 2 ? 'center' : 'left',
                     fontSize: '1.25rem',
                     fontWeight: 800,
                     letterSpacing: '0.05em',
                   }}
                 >
                   {text}
                 </th>
               ))}
             </tr>
           </thead>
           <tbody>
             {users.map((user, idx) => (
               <tr
                 key={user.id}
                 style={{
                   cursor: 'pointer',
                   backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb', // white or gray-50
                   transition: 'background 0.3s ease, box-shadow 0.3s ease',
                 }}
                 onMouseEnter={e => {
                   (e.currentTarget as HTMLElement).style.background =
                     'linear-gradient(90deg, #ede9fe, #fbcfe8, #fef3c7)'; // purple100->pink100->yellow100
                   (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 15px rgba(128, 90, 213, 0.25)';
                   (e.currentTarget as HTMLElement).style.borderRadius = '0.75rem';
                 }}
                 onMouseLeave={e => {
                   (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
                   (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                   (e.currentTarget as HTMLElement).style.borderRadius = '0';
                 }}
               >
                 <td style={{ padding: '1.5rem 2rem', fontWeight: 600, fontSize: '1.125rem', color: '#1f2937' }}>
                   {user.name}
                 </td>
                 <td style={{ padding: '1.5rem 2rem', fontSize: '1.125rem', color: '#4b5563', letterSpacing: '0.02em' }}>
                   {user.email}
                 </td>
                 <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                   <button
                     onClick={() => handleDelete(user.id)}
                     title={`Delete ${user.name}`}
                     aria-label={`Delete ${user.name}`}
                     style={{
                       display: 'inline-flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       padding: '0.75rem',
                       borderRadius: '9999px',
                       backgroundColor: '#fee2e2', // red-100
                       color: '#dc2626', // red-600
                       boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                       border: 'none',
                       cursor: 'pointer',
                       transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.3s ease',
                     }}
                     onMouseEnter={e => {
                       (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626';
                       (e.currentTarget as HTMLElement).style.color = 'white';
                       (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                       (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
                     }}
                     onMouseLeave={e => {
                       (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2';
                       (e.currentTarget as HTMLElement).style.color = '#dc2626';
                       (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                       (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                     }}
                   >
                     <FaTrash size={22} />
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
           <tfoot>
             <tr>
               <td
                 colSpan={3}
                 style={{
                   padding: '1rem 0',
                   textAlign: 'center',
                   fontSize: '0.875rem',
                   color: '#6b7280', // gray-500
                   fontStyle: 'italic',
                   userSelect: 'none',
                 }}
               >
                 Total Users: {users.length}
               </td>
             </tr>
           </tfoot>
         </table>
         
         
          
           
            
            )}
          </div>
        </div>
      </Section>
    </Master>
  );  
};

export default Page;
