import type { TabId } from '../../types';
import {
  Home,
  Workflow,
  FileText,
  Hammer,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  RotateCw,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import GlobalSearch from './GlobalSearch';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onRefresh: () => void;
  onLogout: () => void;
  onHelp: () => void;
}

interface NavTab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  isNew?: boolean;
}

const PRIMARY: NavTab[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'pipeline', label: 'Pipeline', icon: Workflow },
  { id: 'presupuestos', label: 'Presupuestos', icon: FileText },
  { id: 'produccion', label: 'Producción', icon: Hammer, isNew: true },
  { id: 'contactos', label: 'Contactos', icon: Users },
];

const SECONDARY: NavTab[] = [
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
];

function NavItem({
  label,
  icon: Icon,
  active,
  isNew,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  active: boolean;
  isNew?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] font-medium transition-all cursor-pointer border-none',
        active
          ? 'bg-brand-soft text-brand font-semibold'
          : 'bg-transparent text-text-muted hover:bg-bg-muted hover:text-text',
      )}
    >
      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
      <span className="flex-1 truncate">{label}</span>
      {isNew && (
        <span className="bg-danger text-white text-[8px] font-black px-1 py-0.5 rounded leading-none tracking-wider animate-pulse">
          NUEVO
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ activeTab, onTabChange, onRefresh, onLogout, onHelp }: Props) {
  return (
    <aside className="w-[240px] shrink-0 bg-white flex flex-col h-screen no-print border-r border-border">
      <div className="px-5 pt-5 pb-4">
        <div className="text-brand font-black text-[15px] tracking-[2.5px] leading-none">QUALITY DECO</div>
        <div className="text-[10px] text-text-subtle mt-2 font-medium tracking-wide">CRM · presupuestos</div>
      </div>

      <div className="px-3 pb-3">
        <GlobalSearch />
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="text-[9px] text-text-subtle uppercase tracking-[1.8px] font-bold px-3 pb-2 pt-2">Operaciones</div>
        <div className="space-y-1">
          {PRIMARY.map((tab) => (
            <NavItem
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              isNew={tab.isNew}
              active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </div>

        <div className="text-[9px] text-text-subtle uppercase tracking-[1.8px] font-bold px-3 pb-2 pt-6">Análisis</div>
        <div className="space-y-1">
          {SECONDARY.map((tab) => (
            <NavItem
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-border flex flex-col gap-0.5">
        <button
          onClick={onRefresh}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-text-muted bg-transparent border-none cursor-pointer hover:text-brand hover:bg-brand-soft transition-all"
          title="Refrescar datos"
        >
          <RotateCw size={14} strokeWidth={1.8} />
          Refrescar
        </button>

        <button
          onClick={onHelp}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-text-muted bg-transparent border-none cursor-pointer hover:text-brand hover:bg-brand-soft transition-all"
          title="Ayuda"
        >
          <HelpCircle size={14} strokeWidth={1.8} />
          Ayuda
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-text-muted bg-transparent border-none cursor-pointer hover:text-danger hover:bg-danger-soft transition-all"
          title="Cerrar sesión"
        >
          <LogOut size={14} strokeWidth={1.8} />
          Salir
        </button>
      </div>
    </aside>
  );
}
