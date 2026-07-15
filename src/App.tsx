import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { YearSelectionPage } from './components/YearSelectionPage';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PeerSupportSection } from './components/section/PeerSupportSection';
import { AcademicActivitiesSection } from './components/section/AcademicActivitiesSection';
import { AcademicResourcesSection } from './components/section/AcademicResourcesSection';
import CareerNavigationSection from './components/section/CareerNavigationSection';
import { BoardSection } from './components/section/BoardSection';
import { KeywordManagementSection } from './components/section/KeywordManagementSection';
import { Section } from './lib/types';
import { getUserPreference, saveUserPreference } from './lib/dataService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userYear, setUserYear] = useState<string | null>(null);
  const [isCheckingYear, setIsCheckingYear] = useState(false);
  const [isSavingYear, setIsSavingYear] = useState(false);

  const [activeSection, setActiveSection] = useState<Section>('peer-support');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const savedLoginState = localStorage.getItem('acadresources_login');
    if (savedLoginState) {
      const { isLoggedIn: loggedIn, isAdmin: admin, email, year } = JSON.parse(savedLoginState);
      setIsLoggedIn(loggedIn);
      setIsAdmin(admin);
      if (email) setUserEmail(email);
      if (year) setUserYear(year);
    }
  }, []);

  // Save on login
  const handleLogin = async (adminMode: boolean, email?: string) => {
    setIsLoggedIn(true);
    setIsAdmin(adminMode);
    if (email) {
      setUserEmail(email);
      // Fetch year from DB if possible
      setIsCheckingYear(true);
      try {
        const prefYear = await getUserPreference(email);
        if (prefYear) {
          setUserYear(prefYear);
          localStorage.setItem('acadresources_login', JSON.stringify({
            isLoggedIn: true,
            isAdmin: adminMode,
            email,
            year: prefYear,
            timestamp: Date.now()
          }));
          return; // Skip below localstorage set
        }
      } catch (err) {
        console.error("Error fetching user pref:", err);
      } finally {
        setIsCheckingYear(false);
      }
    }

    // Save to localStorage without year yet
    localStorage.setItem('acadresources_login', JSON.stringify({
      isLoggedIn: true,
      isAdmin: adminMode,
      email,
      timestamp: Date.now()
    }));
  };

  const handleYearSelected = async (year: string) => {
    setIsSavingYear(true);
    try {
      if (userEmail) {
        await saveUserPreference(userEmail, year);
      }
      setUserYear(year);
      localStorage.setItem('acadresources_login', JSON.stringify({
        isLoggedIn: true,
        isAdmin,
        email: userEmail,
        year,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error("Error saving year:", error);
      alert("Could not save your year. Continuing anyway.");
      setUserYear(year);
    } finally {
      setIsSavingYear(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail(null);
    setUserYear(null);
    localStorage.removeItem('acadresources_login');
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (isCheckingYear) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading your profile...</div>;
  }

  // Show year selection if they are logged in BUT haven't picked a year (and are not admin)
  if (isLoggedIn && !userYear && !isAdmin) { 
    return <YearSelectionPage onYearSelected={handleYearSelected} isSaving={isSavingYear} />;
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
            onLogout={handleLogout}
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
          onLogout={handleLogout} 
        />

        <main className="flex-1 lg:ml-64 min-w-0 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-20 sm:pt-24 lg:pt-12">
            {activeSection === 'peer-support' && <PeerSupportSection isAdmin={isAdmin} defaultYear={userYear || '1'} />}
            {activeSection === 'academic-activities' && <AcademicActivitiesSection isAdmin={isAdmin} />}
            {activeSection === 'academic-resources' && <AcademicResourcesSection isAdmin={isAdmin} />}
            {activeSection === 'career-navigation' && <CareerNavigationSection />}
            {activeSection === 'board' && <BoardSection isAdmin={isAdmin} />}
            {activeSection === 'keyword-management' && <KeywordManagementSection defaultYear={userYear || '1'} />}
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