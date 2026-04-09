import { useState, useContext } from 'react';
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

interface SectionDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  defaultOpen?: boolean;
}

const SECTIONS: SectionDef[] = [
  { id: 'empresa', title: 'Empresa y valores', description: 'Nombre, direccion, contacto, IVA', icon: '\uD83C\uDFE2', color: '#1DA1F2', defaultOpen: true },
  { id: 'textos', title: 'Textos del presupuesto', description: 'Saludo, validez, CTA, legal', icon: '\uD83D\uDCDD', color: '#f59e0b' },
  { id: 'info-servicio', title: 'Info del servicio', description: 'Cards de la pagina 3 del PDF', icon: '\uD83D\uDEE0', color: '#8b5cf6' },
  { id: 'pipeline', title: 'Pipeline', description: 'Etapas y colores del kanban', icon: '\uD83D\uDCCA', color: '#22c55e' },
  { id: 'plantillas', title: 'Plantillas de mensaje', description: 'Mensajes rapidos de WhatsApp', icon: '\uD83D\uDCAC', color: '#25D366' },
  { id: 'usuarios', title: 'Usuarios', description: 'Cuentas y contrasenas de acceso', icon: '\uD83D\uDC65', color: '#ef4444' },
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
    showConfirm('Restaurar valores', 'Restaurar todos los valores por defecto?', () => {
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
        return (
          <InfoServicioEditor
            cards={draft.infoServicio}
            onChange={handleInfoServicioChange}
          />
        );
      case 'pipeline':
        return <PipelineStagesEditor />;
      case 'plantillas':
        return (
          <MessageTemplatesEditor
            templates={templates}
            onChange={setTemplates}
          />
        );
      case 'usuarios':
        return <UsersManager />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 h-full bg-[#f0f2f5] overflow-y-auto p-7 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-black text-[#2a2a2a] tracking-wide m-0">Ajustes</h1>
          <p className="text-sm text-[#888] mt-1 m-0">Configuracion general del sistema</p>
        </div>
        <div className="flex gap-2.5">
          <button
            className="bg-[#e5e7eb] text-[#555] border-none py-2.5 px-5 rounded-lg cursor-pointer text-[13px] font-semibold font-[inherit] transition-colors hover:bg-[#d1d5db]"
            onClick={handleRestore}
          >
            Restaurar por defecto
          </button>
          <button
            className="bg-[#1DA1F2] text-white border-none py-2.5 px-6 rounded-lg cursor-pointer text-[13px] font-bold font-[inherit] transition-colors hover:bg-[#0d8de0] shadow-[0_2px_8px_rgba(29,161,242,0.3)]"
            onClick={handleSave}
          >
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {SECTIONS.map((section) => {
          const isOpen = openSections[section.id];
          return (
            <div key={section.id} className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none transition-colors hover:bg-[#f8f9fb]"
                onClick={() => toggleSection(section.id)}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: section.color + '15', color: section.color }}
                >
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-[#2a2a2a]">{section.title}</div>
                  <div className="text-[11px] text-[#999] mt-0.5">{section.description}</div>
                </div>
                <span
                  className={`text-[10px] text-[#bbb] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                >
                  &#9660;
                </span>
              </div>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-[#f0f0f0]">
                  <div className="pt-4">
                    {renderSectionBody(section.id)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
