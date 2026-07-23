import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { YearSelectionPage } from './components/YearSelectionPage';
import { Layout } from './components/Layout';
import { PeerSupportSection } from './components/section/PeerSupportSection';
import { AcademicActivitiesSection } from './components/section/AcademicActivitiesSection';
import { AcademicResourcesSection } from './components/section/AcademicResourcesSection';
import CareerNavigationSection from './components/section/CareerNavigationSection';
import { BoardSection } from './components/section/BoardSection';
import { KeywordManagementSection } from './components/section/KeywordManagementSection';
import { ActivityDetail } from './components/admin/ActivityDetail';
import { ResourceCategoryDetail } from './components/admin/ResourceCategoryDetail';
import { getUserPreference, saveUserPreference } from './lib/dataService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userYear, setUserYear] = useState<string | null>(null);
  const [isCheckingYear, setIsCheckingYear] = useState(false);
  const [isSavingYear, setIsSavingYear] = useState(false);

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

  return (
    <Routes>
      <Route element={<Layout isAdmin={isAdmin} onLogout={handleLogout} />}>
        <Route path="/" element={<PeerSupportSection isAdmin={isAdmin} defaultYear={userYear || '1'} />} />
        <Route path="/activities" element={<AcademicActivitiesSection isAdmin={isAdmin} />} />
        <Route path="/activities/:id" element={<ActivityDetail isAdmin={isAdmin} />} />
        <Route path="/resources" element={<AcademicResourcesSection isAdmin={isAdmin} />} />
        <Route path="/resources/:categoryId" element={<ResourceCategoryDetail isAdmin={isAdmin} />} />
        <Route path="/career" element={<CareerNavigationSection />} />
        <Route path="/board" element={<BoardSection isAdmin={isAdmin} />} />
        {isAdmin && (
          <Route path="/keywords" element={<KeywordManagementSection defaultYear={userYear || '1'} />} />
        )}
      </Route>
    </Routes>
  );
}