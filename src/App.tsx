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
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
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
      <ErrorBoundary><LeadDetailModal /></ErrorBoundary>
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
