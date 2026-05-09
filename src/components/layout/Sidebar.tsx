import React from 'react';
import { NavLink } from 'react-router';
import { 
  PackageSearch, 
  ClipboardCheck, 
  Users, 
  BookOpen,
  CalendarCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: PackageSearch, label: 'Inventory', path: '/inventory' },
  { icon: BookOpen, label: 'Books', path: '/books' },
  { icon: ClipboardCheck, label: 'Audits', path: '/audits' },
  { icon: CalendarCheck, label: 'Days', path: '/days' },
  { icon: Users, label: 'Employees', path: '/employees' }
];

export function Sidebar({ className = "w-64", onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  return (
    <aside className={cn("flex-shrink-0 border-r border-slate-200 bg-white h-screen flex flex-col relative", className)}>
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-blue-600">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">LG</div>
          <span className="text-xl tracking-tight text-slate-800">LottoGuard</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-4 space-y-1 px-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onLinkClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50"
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-8 w-64 px-6">
        <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Phase 1: Prototyping</p>
          <p className="mt-1 text-[11px] text-blue-600 leading-relaxed">Powered by Google AI Studio</p>
        </div>
      </div>
    </aside>
  );
}
