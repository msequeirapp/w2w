import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6 md:py-8">
          {children}
        </div>
      </main>
      <footer className="bg-blue-900 text-white py-4 shadow-inner">
        <div className="container flex items-center justify-center text-sm">
          w2w &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export default Layout;
