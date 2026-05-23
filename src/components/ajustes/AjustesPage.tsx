import { useState, useContext } from 'react';
import {
  Building2,
  FileText,
  Wrench,
  GitBranch,
  MessageSquare,
  Users,
  ChevronDown,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { getMessageTemplates, saveMessageTemplates } from '../../services/settings.service';
import { pushToCloud } from '../../services/sync.service';
import { ModalContext } from '../../contexts/ModalContext';
import type { AppSettings, InfoServicioCard, MessageTemplate } from '../../types';
import EmpresaSettings from './EmpresaSettings';
import PresupuestoDefaults from './PresupuestoDefaults';
import InfoServicioEditor from './InfoServicioEditor';
import PipelineStagesEditor from './PipelineStagesEditor';
import MessageTemplatesEditor from './MessageTemplatesEditor';
import UsersManager from './UsersManager';
import { Button } from '../ui/button';

interface SectionDef {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  defaultOpen?: boolean;
}

const SECTIONS: SectionDef[] = [
  { id: 'empresa', title: 'Empresa y valores', description: 'Nombre, dirección, contacto, IVA', icon: Building2, defaultOpen: true },
  { id: 'textos', title: 'Textos del presupuesto', description: 'Saludo, validez, CTA, legal', icon: FileText },
  { id: 'info-servicio', title: 'Info del servicio', description: 'Cards de la página 3 del PDF', icon: Wrench },
  { id: 'pipeline', title: 'Pipeline', description: 'Etapas y colores del kanban', icon: GitBranch },
  { id: 'plantillas', title: 'Plantillas de mensaje', description: 'Mensajes rápidos de WhatsApp', icon: MessageSquare },
  { id: 'usuarios', title: 'Usuarios', description: 'Cuentas y contraseñas de acceso', icon: Users },
];

export default function AjustesPage() {
  const { settings, saveSettings, restoreDefaults } = useSettings();
  const { showConfirm, showToast } = useContext(ModalContext);

  const [draft, setDraft] = useState<AppSettings>({ ...settings });
  const [templates, setTemplates] = useState<MessageTemplate[]>(getMessageTemplates);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SECTIONS.forEach((s) => {
      init[s.id] = !!s.defaultOpen;
    });
    return init;
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSettingsChange = (patch: Partial<AppSettings>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleInfoServicioChange = (cards: InfoServicioCard[]) => {
    setDraft((prev) => ({ ...prev, infoServicio: cards }));
  };

  const handleSave = () => {
    saveSettings(draft);
    saveMessageTemplates(templates);
    showToast('Guardando...', 'info');
    pushToCloud().then(() => {
      showToast('Guardado y sincronizado', 'success');
    }).catch(() => {
      showToast('Guardado local. Error al sincronizar.', 'error');
    });
  };

  const handleRestore = () => {
    showConfirm('Restaurar valores', '¿Restaurar todos los valores por defecto?', () => {
      restoreDefaults();
      setDraft({ ...settings });
      showToast('Valores restaurados', 'success');
      setTimeout(() => {
        setDraft(settings);
      }, 0);
    });
  };

  const renderSectionBody = (id: string) => {
    switch (id) {
      case 'empresa':
        return <EmpresaSettings settings={draft} onChange={handleSettingsChange} />;
      case 'textos':
        return <PresupuestoDefaults settings={draft} onChange={handleSettingsChange} />;
      case 'info-servicio':
        return <InfoServicioEditor cards={draft.infoServicio} onChange={handleInfoServicioChange} />;
      case 'pipeline':
        return <PipelineStagesEditor />;
      case 'plantillas':
        return <MessageTemplatesEditor templates={templates} onChange={setTemplates} />;
      case 'usuarios':
        return <UsersManager />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 h-full bg-bg overflow-y-auto p-8 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-text m-0 leading-tight">Ajustes</h1>
          <div className="text-[13px] text-text-muted mt-1">Configuración general del sistema</div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="md" onClick={handleRestore}>
            <RotateCcw size={14} strokeWidth={2} />
            Restaurar por defecto
          </Button>
          <Button size="md" onClick={handleSave}>
            <Save size={14} strokeWidth={2.2} />
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-[920px] w-full">
        {SECTIONS.map((section) => {
          const isOpen = openSections[section.id];
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden transition-shadow hover:shadow-[var(--shadow-pop)]"
            >
              <button
                type="button"
                className="w-full flex items-center gap-4 px-5 py-4 cursor-pointer select-none transition-colors hover:bg-bg-muted text-left border-none bg-transparent"
                onClick={() => toggleSection(section.id)}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-bg-muted text-text-muted">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-text leading-tight">{section.title}</div>
                  <div className="text-[12px] text-text-muted mt-0.5">{section.description}</div>
                </div>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={`text-text-subtle shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-border">
                  <div className="pt-4">{renderSectionBody(section.id)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
