import React, { useState } from 'react';
import { TaxProvider, useTax } from './context/TaxContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/modules/DashboardView';
import { BackupView } from './components/modules/BackupView';
import { SettingsView } from './components/modules/SettingsView';
import { LohnView } from './components/modules/LohnView';
import { ZeitView } from './components/modules/ZeitView';
import { WerbungskostenView } from './components/modules/WerbungskostenView';
import { BelegeView } from './components/modules/BelegeView';
import { AssistentView } from './components/modules/AssistentView';
import { WeitereAnlagenView } from './components/modules/WeitereAnlagenView';
import { AbschlussView } from './components/modules/AbschlussView';

const AppContent: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const { isSaving } = useTax();

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardView onNavigate={(mod) => setCurrentModule(mod)} />;
      case 'lohn':
        return <LohnView />;
      case 'zeit':
        return <ZeitView />;
      case 'werbungskosten':
        return <WerbungskostenView />;
      case 'belege':
        return <BelegeView />;
      case 'assistent':
        return <AssistentView onNavigateToSettings={() => setCurrentModule('settings')} />;
      case 'anlagen':
        return <WeitereAnlagenView />;
      case 'abschluss':
        return <AbschlussView />;
      case 'backup':
        return <BackupView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(mod) => setCurrentModule(mod)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        isSaving={isSaving}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header
          onNavigateToAbschluss={() => setCurrentModule('abschluss')}
          isSaving={isSaving}
        />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <TaxProvider>
      <AppContent />
    </TaxProvider>
  );
}

export default App;
