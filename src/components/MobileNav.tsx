import { Home, Calendar, BookOpen, GraduationCap, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

type Section = 'peer-support' | 'academic-activities' | 'academic-resources';

interface MobileNavProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileNav({ activeSection, onSectionChange, isOpen, onToggle }: MobileNavProps) {
  const navItems = [
    { id: 'peer-support' as Section, label: 'Peer Support', icon: Home },
    { id: 'academic-activities' as Section, label: 'Academic Activities', icon: Calendar },
    { id: 'academic-resources' as Section, label: 'Academic Resources', icon: BookOpen },
  ];

  const activeItem = navItems.find(item => item.id === activeSection);
  const ActiveIcon = activeItem?.icon || Home;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900 text-sm">Med Resources</h1>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-10 w-10 p-0"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-16"
          onClick={onToggle}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-30">
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                  isActive
                    ? 'text-blue-700'
                    : 'text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="text-xs truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-16" />
    </>
  );
}
