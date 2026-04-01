import { useState, useCallback, useContext, useEffect } from 'react';
import type { TabId } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { ModalContext } from '../../contexts/ModalContext';
import TopTabBar from './TopTabBar';
import HomePage from '../home/HomePage';
import PipelinePage from '../pipeline/PipelinePage';
import PresupuestosPage from '../presupuestos/PresupuestosPage';
import ContactosPage from '../contactos/ContactosPage';
import VentasPage from '../ventas/VentasPage';
import EstadisticasPage from '../estadisticas/EstadisticasPage';
import AjustesPage from '../ajustes/AjustesPage';
import HelpOverlay from '../common/HelpOverlay';
import ErrorBoundary from '../common/ErrorBoundary';

const VALID_TABS: TabId[] = ['home', 'pipeline', 'presupuestos', 'contactos', 'ventas', 'estadisticas', 'ajustes'];

function getTabFromHash(): TabId {
  const hash = window.location.hash.replace('#', '');
  return VALID_TABS.includes(hash as TabId) ? (hash as TabId) : 'home';
}

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>(getTabFromHash);
  const [helpOpen, setHelpOpen] = useState(false);
  const { logout } = useAuth();
  const { refreshAll } = useDataRefresh();
  const { pendingPresupLead } = useContext(ModalContext);

  useEffect(() => {
    if (pendingPresupLead) {
      setActiveTab('presupuestos');
    }
  }, [pendingPresupLead]);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'pipeline':
        return <PipelinePage />;
      case 'presupuestos':
        return <PresupuestosPage />;
      case 'contactos':
        return <ContactosPage />;
      case 'ventas':
        return <VentasPage />;
      case 'estadisticas':
        return <EstadisticasPage />;
      case 'ajustes':
        return <AjustesPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#111] text-[#ccc] overflow-hidden font-sans">
      <TopTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={refreshAll}
        onLogout={logout}
        onHelp={() => setHelpOpen(true)}
      />
      {/* no-print class hides non-presupuesto tabs during print */}
      <main className="flex flex-1 overflow-hidden relative">
        <ErrorBoundary key={activeTab}>
          {renderTab()}
        </ErrorBoundary>
      </main>
      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
