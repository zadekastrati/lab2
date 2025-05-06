'use client';

import { useEffect } from 'react';

const AuthSync = () => {
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      window.dispatchEvent(new Event('authChanged'));
    }
  }, []);

  return null; // no UI needed
};

export default AuthSync;
