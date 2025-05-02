'use client';

// providers
import AlertProvider from '@providers/AlertProvider';

// components
import Alert from '@components/Alert/Alert';
import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';

// interfaces
interface IProps {
  children: React.ReactNode;
}

// 🔐 New component for syncing logout across tabs
const SyncLogoutAcrossTabs = () => {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken' && event.newValue === null) {
        // Token was removed, log out in this tab too
        window.location.href = '/members/signout?reason=expired';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
};

import { useEffect } from 'react';

const Master: React.FC<IProps> = ({ children }) => (
  <div className='light-theme'>
    <AlertProvider>
      <SyncLogoutAcrossTabs /> {/* 👈 Add this line */}
      <Alert />
      <Header />
      {children}
      <Footer />
    </AlertProvider>
  </div>
);

export default Master;
