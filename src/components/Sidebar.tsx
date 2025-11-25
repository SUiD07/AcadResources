import { Home, Calendar, BookOpen, GraduationCap, LogOut } from 'lucide-react';
import { Button } from './ui/button';

type Section = 'peer-support' | 'academic-activities' | 'academic-resources';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onLogout: () => void;
}

export function Sidebar({ activeSection, onSectionChange, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'peer-support' as Section, label: 'Peer Support', icon: Home },
    { id: 'academic-activities' as Section, label: 'Academic Activities', icon: Calendar },
    { id: 'academic-resources' as Section, label: 'Academic Resources', icon: BookOpen },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#E5007D] rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900">Med Resources</h1>
            <p className="text-xs text-slate-500">Academic Hub</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-pink-50 text-[#E5007D]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-left">{item.label}</span>
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