import { NavLink } from 'react-router-dom';
import { Home, Calendar, BookOpen, GraduationCap, Menu, X, LogOut, Users, Settings } from 'lucide-react';
import { Button } from './ui/button';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

const navItems = [
  { path: '/', label: 'Peer Support', icon: Home },
  { path: '/activities', label: 'Academic Activities', icon: Calendar },
  { path: '/resources', label: 'Academic Resources', icon: BookOpen },
  { path: '/career', label: 'Career Navigation', icon: GraduationCap },
  { path: '/board', label: 'Board', icon: Users },
];

export function MobileNav({ isOpen, onToggle, onLogout, isAdmin }: MobileNavProps) {
  const items = isAdmin
    ? [...navItems, { path: '/keywords', label: 'Keywords', icon: Settings }]
    : navItems;

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E5007D] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-slate-900 text-sm">Med Resources</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-10 w-10 p-0">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-16" onClick={onToggle} />
      )}

      <div
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onToggle}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-pink-50 text-[#E5007D]' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-slate-300 hover:bg-slate-50 text-slate-600"
            onClick={() => { onLogout(); onToggle(); }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-30">
        <div className="flex items-center justify-around h-full px-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                    isActive ? 'text-[#E5007D]' : 'text-slate-600'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs truncate w-full text-center">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="lg:hidden h-16" />
    </>
  );
}