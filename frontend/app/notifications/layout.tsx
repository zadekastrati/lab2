import React from 'react';

const NotificationsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="notifications-layout p-6 bg-gray-50 min-h-screen">
      {/* Mund të vendosësh header, sidebar, apo stil të veçantë */}
      {children}
    </div>
  );
};

export default NotificationsLayout;
