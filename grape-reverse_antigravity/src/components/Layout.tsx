import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
