import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PeerSupportSection } from './components/PeerSupportSection';
import { AcademicActivitiesSection } from './components/AcademicActivitiesSection';
import { AcademicResourcesSection } from './components/AcademicResourcesSection';

type Section = 'peer-support' | 'academic-activities' | 'academic-resources';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('peer-support');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
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
      />
      
      <main className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-20 sm:pt-24 lg:pt-12">
          {activeSection === 'peer-support' && <PeerSupportSection />}
          {activeSection === 'academic-activities' && <AcademicActivitiesSection />}
          {activeSection === 'academic-resources' && <AcademicResourcesSection />}
        </div>
      </main>
    </div>
  );
}