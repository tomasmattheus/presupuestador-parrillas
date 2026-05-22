import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLeads } from '../../hooks/useLeads';
import HomeCards from './HomeCards';
import FollowUpList from './FollowUpList';
import TodoList from './TodoList';
import type { TabId } from '../../types';

interface HomePageProps {
  onNavigate: (tab: TabId) => void;
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const displayName = useMemo(() => {
    const name = user || 'usuario';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user]);

  const fechaHoy = useMemo(() => {
    const today = new Date();
    return `${today.getDate()} de ${MESES[today.getMonth()]} de ${today.getFullYear()}`;
  }, []);

  return (
    <div className="flex-1 h-full bg-bg overflow-y-auto p-8 flex flex-col">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold tracking-tight text-text m-0 mb-1.5 leading-tight">
          Bienvenido, {displayName}
        </h1>
        <div className="text-sm text-text-muted font-medium capitalize">{fechaHoy}</div>
      </div>

      <HomeCards onNavigate={onNavigate} />

      <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">
        <div className="bg-white rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          <FollowUpList leads={leads} loading={leadsLoading} />
        </div>
        <div className="bg-white rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          <TodoList />
        </div>
      </div>
    </div>
  );
}
