import React from 'react';
import { NavLink } from 'react-router';
import { 
  PackageSearch, 
  ClipboardCheck, 
  Users, 
  BookOpen,
  CalendarCheck,
  Ticket
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: PackageSearch, label: 'Inventory', path: '/inventory' },
  { icon: BookOpen, label: 'Books', path: '/books' },
  { icon: ClipboardCheck, label: 'Audits', path: '/audits' },
  { icon: CalendarCheck, label: 'Days', path: '/days' },
  { icon: Users, label: 'Employees', path: '/employees' }
];

export function Sidebar({ className = "w-72", onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  return (
    <aside className={cn("flex-shrink-0 h-screen flex flex-col relative", className)} style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-dark) 100%)', boxShadow: 'var(--shadow-gold)' }}>
            <Ticket className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Lotto Scan</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-2">
        <nav className="space-y-1 px-4 flex-1">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-black"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-dark) 100%)',
                boxShadow: 'var(--shadow-gold)'
              } : {}}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" style={({ isActive }) => isActive ? { color: '#000' } : {}} />
              <span style={({ isActive }) => isActive ? { color: '#000' } : {}}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 m-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-gold)' }}>Premium</p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Scratcher inventory management</p>
      </div>
    </aside>
  );
}
