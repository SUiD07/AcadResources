import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  isAdmin: boolean;
  onLogout: () => void;
}

export function Layout({ isAdmin, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col">
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar isAdmin={isAdmin} onLogout={onLogout} />
        </div>

        <MobileNav
          isOpen={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isAdmin={isAdmin}
          onLogout={onLogout}
        />

        <main className="flex-1 lg:ml-64 min-w-0 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-20 sm:pt-24 lg:pt-12">
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-4 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-600">
              Provided by the Academic and IT Division, Student Union,
              Faculty of Medicine, Chulalongkorn University
            </p>
            <p className="text-xs text-slate-500">
              Having trouble? Contact us at:{' '}
              <a href="mailto:it@docchula.com" className="text-[#E5007D] hover:underline">
                it@docchula.com
              </a>
            </p>
            {isAdmin && (
              <p className="text-xs text-[#E5007D] font-medium pt-2 border-t border-slate-200">
                You are logged in as Admin — Academic & IT Division
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}