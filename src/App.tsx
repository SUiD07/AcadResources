import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PeerSupportSection } from './components/section/PeerSupportSection';
import { AcademicActivitiesSection } from './components/section/AcademicActivitiesSection';
import { AcademicResourcesSection } from './components/section/AcademicResourcesSection';
import CareerNavigationSection from './components/section/CareerNavigationSection';
import { BoardSection } from './components/section/BoardSection';
import { KeywordManagementSection } from './components/section/KeywordManagementSection';
import { Section } from './lib/types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('peer-support');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={(adminMode) => {
      setIsLoggedIn(true);
      setIsAdmin(adminMode);
    }} />;
  }

  // Show main application after login
  return (
    <div className="flex min-h-screen bg-slate-50 flex-col">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            isAdmin={isAdmin}
            onLogout={() => {
              setIsLoggedIn(false);
              setIsAdmin(false);
            }}
          />
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setMobileMenuOpen(false);
          }}
          isOpen={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isAdmin={isAdmin}
          onLogout={() => {
            setIsLoggedIn(false);
            setIsAdmin(false);
          }}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-20 sm:pt-24 lg:pt-12">
            {activeSection === 'peer-support' && <PeerSupportSection isAdmin={isAdmin} />}
            {activeSection === 'academic-activities' && <AcademicActivitiesSection isAdmin={isAdmin} />}
            {activeSection === 'academic-resources' && <AcademicResourcesSection isAdmin={isAdmin} />}
            {activeSection === 'career-navigation' && <CareerNavigationSection />}
            {activeSection === 'board' && <BoardSection isAdmin={isAdmin} />}
            {activeSection === 'keyword-management' && <KeywordManagementSection />}
          </div>
        </main>
      </div>

      {/* Footer */}
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