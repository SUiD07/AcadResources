import { Home, Calendar, BookOpen, GraduationCap, LogOut, Users, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Section } from '../lib/types';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export function Sidebar({ activeSection, onSectionChange, onLogout, isAdmin }: SidebarProps) {
  const navItems = [
    { id: 'peer-support' as Section, label: 'Peer Support', icon: Home },
    { id: 'academic-activities' as Section, label: 'Academic Activities', icon: Calendar },
    { id: 'academic-resources' as Section, label: 'Academic Resources', icon: BookOpen },
    { id: 'career-navigation' as Section, label: 'Career Navigation', icon: GraduationCap },
    { id: 'board' as Section, label: 'Board', icon: Users },
  ];

  if (isAdmin) {
    navItems.push({ id: 'keyword-management' as Section, label: 'Manage Keywords', icon: Settings });
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#E5007D] rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 font-bold">Med Resources</h1>
            <p className="text-xs text-slate-500">Academic Hub</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-pink-50 text-[#E5007D] font-semibold shadow-sm shadow-pink-100/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#E5007D]' : 'text-slate-400'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button at Bottom */}
      <div className="p-6 border-t border-slate-200">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-slate-300 hover:bg-slate-50 text-slate-600"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}