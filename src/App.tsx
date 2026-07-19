import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { PeerSupportSection } from './components/section/PeerSupportSection';
import { AcademicActivitiesSection } from './components/section/AcademicActivitiesSection';
import { AcademicResourcesSection } from './components/section/AcademicResourcesSection';
import CareerNavigationSection from './components/section/CareerNavigationSection';
import { BoardSection } from './components/section/BoardSection';
import { KeywordManagementSection } from './components/section/KeywordManagementSection';
import { ActivityDetail } from './components/admin/ActivityDetail';
import { ResourceCategoryDetail } from './components/admin/ResourceCategoryDetail';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

    // Check localStorage ตอน mount
  useEffect(() => {
    const savedLoginState = localStorage.getItem('acadresources_login');
    if (savedLoginState) {
      const { isLoggedIn: loggedIn, isAdmin: admin } = JSON.parse(savedLoginState);
      setIsLoggedIn(loggedIn);
      setIsAdmin(admin);
    }
  }, []);
  // เพิ่ม: Save ตอนล็อกอิน
  const handleLogin = (adminMode: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(adminMode);
    // บันทึกลง localStorage
    localStorage.setItem('acadresources_login', JSON.stringify({
      isLoggedIn: true,
      isAdmin: adminMode,
      timestamp: Date.now(),
    }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem('acadresources_login');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route element={<Layout isAdmin={isAdmin} onLogout={handleLogout} />}>
        <Route path="/" element={<PeerSupportSection isAdmin={isAdmin} />} />
        <Route path="/activities" element={<AcademicActivitiesSection isAdmin={isAdmin} />} />
        <Route path="/activities/:id" element={<ActivityDetail isAdmin={isAdmin} />} />
        <Route path="/resources" element={<AcademicResourcesSection isAdmin={isAdmin} />} />
        <Route path="/resources/:categoryId" element={<ResourceCategoryDetail isAdmin={isAdmin} />} />        
        <Route path="/career" element={<CareerNavigationSection />} />
        <Route path="/board" element={<BoardSection isAdmin={isAdmin} />} />
        {isAdmin && (
          <Route path="/keywords" element={<KeywordManagementSection />} />
        )}
      </Route>
    </Routes>
  );
}