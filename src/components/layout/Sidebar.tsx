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

const colors = {
  bgSecondary: '#12121a',
  bgCard: '#1a1a24',
  textPrimary: '#f5f5f7',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  accentGold: '#fbbf24',
  accentGoldDark: '#d97706',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  shadowGold: '0 4px 20px rgba(251, 191, 36, 0.15)',
};

export function Sidebar({ className = "w-72", onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  return (
    <aside className={cn("flex-shrink-0 h-screen flex flex-col relative", className)} style={{ background: colors.bgSecondary, borderRight: `1px solid ${colors.borderSubtle}` }}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.accentGold} 0%, ${colors.accentGoldDark} 100%)`, boxShadow: colors.shadowGold }}>
            <Ticket className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight" style={{ color: colors.textPrimary }}>Lotto Scan</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-2">
        <nav className="space-y-1 px-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive ? "text-black" : ""
                )
              }
              style={({ isActive }) => isActive ? {
                background: `linear-gradient(135deg, ${colors.accentGold} 0%, ${colors.accentGoldDark} 100%)`,
                boxShadow: colors.shadowGold
              } : { background: colors.bgCard, color: colors.textSecondary }}
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-5 w-5 flex-shrink-0" style={{ color: isActive ? '#000' : colors.textSecondary }} />
                  <span style={{ color: isActive ? '#000' : colors.textSecondary }}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 m-4 rounded-xl" style={{ background: colors.bgCard, border: `1px solid ${colors.borderSubtle}` }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.accentGold }}>Premium</p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: colors.textMuted }}>Scratcher inventory management</p>
      </div>
    </aside>
  );
}
