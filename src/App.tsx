import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { ModalContext } from './contexts/ModalContext';
import AppShell from './components/layout/AppShell';
import ConfirmModal from './components/common/ConfirmModal';
import Toast from './components/common/Toast';
import LeadDetailModal from './components/modals/LeadDetailModal';
import LoginOverlay from './components/auth/LoginOverlay';
import ErrorBoundary from './components/common/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

function AppInner() {
  const { isLoggedIn } = useContext(AuthContext);
  const { confirmConfig } = useContext(ModalContext);

  if (!isLoggedIn) {
    return <LoginOverlay />;
  }

  return (
    <>
      <AppShell />
      {confirmConfig && <ConfirmModal />}
      <Toast />
      <ErrorBoundary fallback={
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center" onClick={() => window.location.reload()}>
          <div className="bg-white rounded-xl p-6 max-w-[400px] text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-[#2a2a2a] mb-3">Error al abrir contacto. Recarga la pagina.</p>
            <button className="bg-[#1DA1F2] text-white px-4 py-2 rounded font-bold cursor-pointer border-none" onClick={() => window.location.reload()}>Recargar</button>
          </div>
        </div>
      }><LeadDetailModal /></ErrorBoundary>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalProvider>
          <AppInner />
        </ModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
