import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X } from 'lucide-react';

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen font-body overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="hidden md:flex">
        <Sidebar className="" onLinkClick={() => {}} />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-72 max-w-[85%] flex-col h-full" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-4 z-50 p-2 rounded-xl transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={24} />
            </button>
            <Sidebar className="w-full" onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto w-full" style={{ background: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
