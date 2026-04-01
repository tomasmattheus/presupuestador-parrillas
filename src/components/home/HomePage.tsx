import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import HomeCards from './HomeCards';
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
  const displayName = useMemo(() => {
    const name = user || 'usuario';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user]);

  const fechaHoy = useMemo(() => {
    const today = new Date();
    return `${today.getDate()} de ${MESES[today.getMonth()]} de ${today.getFullYear()}`;
  }, []);

  return (
    <div className="flex-1 h-full bg-[#f0f2f5] overflow-y-auto p-7 flex flex-col">
      <div className="mb-6">
        <h1 className="text-[22px] font-black text-[#2a2a2a] tracking-wide m-0 mb-1">
          Bienvenido, {displayName}
        </h1>
        <div className="text-sm text-[#888] font-medium">{fechaHoy}</div>
      </div>

      <HomeCards onNavigate={onNavigate} />
      <TodoList />
    </div>
  );
}
