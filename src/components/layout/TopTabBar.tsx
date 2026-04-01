import type { TabId } from '../../types';
import GlobalSearch from './GlobalSearch';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onRefresh: () => void;
  onLogout: () => void;
  onHelp: () => void;
}

const PRIMARY_TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'pipeline', label: 'PIPELINE' },
  { id: 'presupuestos', label: 'PRESUPUESTOS' },
  { id: 'contactos', label: 'CONTACTOS' },
];

const SECONDARY_TABS: { id: TabId; label: string }[] = [
  { id: 'ventas', label: 'VENTAS' },
  { id: 'estadisticas', label: 'ESTADISTICAS' },
  { id: 'ajustes', label: 'AJUSTES' },
];

export default function TopTabBar({ activeTab, onTabChange, onRefresh, onLogout, onHelp }: Props) {
  return (
    <div className="flex items-center bg-surface-panel shadow-[0_2px_8px_rgba(0,0,0,0.3)] px-5 h-12 shrink-0 no-print">
      <span className="text-brand font-black text-[15px] tracking-[3px] pr-6 border-r border-[#333] mr-2">
        QUALITY DECO
      </span>

      {PRIMARY_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`bg-transparent border-none font-sans text-sm font-bold py-3 px-5 cursor-pointer uppercase tracking-[1px] transition-all duration-200 border-b-3 ${
            activeTab === tab.id
              ? 'text-brand border-b-brand'
              : 'text-[#888] border-b-transparent hover:text-[#ccc]'
          }`}
        >
          {tab.label}
        </button>
      ))}

      {SECONDARY_TABS.map((tab, i) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`bg-transparent border-none font-sans text-xs font-medium py-3 px-3.5 cursor-pointer uppercase tracking-[1px] transition-all duration-200 border-b-3 ${
            i === 0 ? 'ml-2 border-l border-l-[#333] pl-5' : ''
          } ${
            activeTab === tab.id
              ? 'text-brand border-b-brand opacity-100'
              : 'text-[#888] border-b-transparent opacity-60 hover:text-[#ccc]'
          }`}
        >
          {tab.label}
        </button>
      ))}

      <GlobalSearch />

      <button
        onClick={onRefresh}
        className="bg-transparent border border-[#555] text-[#aaa] font-sans text-xs font-semibold py-1.5 px-3.5 rounded cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:border-brand hover:text-brand"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M13.65 2.35A7.96 7.96 0 008 0C3.58 0 .01 3.58.01 8S3.58 16 8 16c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 018 14 6 6 0 012 8a6 6 0 016-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z" fill="currentColor"/>
        </svg>
        Refresh
      </button>

      <a
        href="https://docs.google.com/spreadsheets/d/19SEgflKP6oQY0zQmUqArbhQaQPf57oX0x4GGrfwmjYg/edit"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-transparent border border-[#444] text-[#888] py-1.5 px-2.5 rounded cursor-pointer flex items-center transition-all duration-200 ml-2 no-underline hover:border-brand hover:text-brand"
        title="Abrir Google Sheet"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
      </a>

      <button
        onClick={onHelp}
        className="bg-transparent border border-[#444] text-[#888] w-8 h-8 rounded-full text-base font-bold cursor-pointer flex items-center justify-center transition-all duration-200 ml-2 hover:border-brand hover:text-brand"
        title="Ayuda"
      >
        ?
      </button>

      <button
        onClick={onLogout}
        className="bg-transparent border border-[#444] text-[#888] py-1.5 px-2.5 rounded cursor-pointer flex items-center transition-all duration-200 ml-2 hover:border-danger hover:text-danger"
        title="Cerrar sesion"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  );
}
