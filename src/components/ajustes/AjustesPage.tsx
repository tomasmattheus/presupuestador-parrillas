import { useState, useContext } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { getMessageTemplates, saveMessageTemplates } from '../../services/settings.service';
import { pushSingleKey } from '../../services/sync.service';
import { CACHE_KEYS } from '../../lib/cache';
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
  defaultOpen?: boolean;
}

const SECTIONS: SectionDef[] = [
  { id: 'empresa', title: 'Empresa y valores', defaultOpen: true },
  { id: 'textos', title: 'Textos del presupuesto' },
  { id: 'info-servicio', title: 'Informacion del servicio (presupuesto pag 3)' },
  { id: 'pipeline', title: 'Pipeline' },
  { id: 'plantillas', title: 'Plantillas de mensaje' },
  { id: 'usuarios', title: 'Usuarios' },
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
    pushSingleKey(CACHE_KEYS.messageTemplates).catch(() => {});
    showToast('Guardado', 'success');
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
      <h1 className="text-[22px] font-black text-[#2a2a2a] tracking-wide mb-5">
        Ajustes
      </h1>

      {SECTIONS.map((section) => (
        <div key={section.id} className="mb-3">
          <div
            className="flex items-center gap-2.5 px-5 py-3.5 bg-white rounded-[10px] cursor-pointer select-none shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-colors hover:bg-[#f8f9fa]"
            onClick={() => toggleSection(section.id)}
          >
            <h2 className="text-[15px] font-bold text-[#2a2a2a] uppercase tracking-wide m-0 flex-1">
              {section.title}
            </h2>
            <span
              className={`text-xs text-[#999] transition-transform shrink-0 ${
                openSections[section.id] ? 'rotate-180' : ''
              }`}
            >
              &#9660;
            </span>
          </div>
          {openSections[section.id] && (
            <div className="pt-3">
              {renderSectionBody(section.id)}
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-3 mt-2 flex-wrap">
        <button
          className="bg-[#1DA1F2] text-white border-none py-3 px-8 rounded-md cursor-pointer text-[15px] font-bold font-[inherit] transition-colors hover:bg-[#0d8de0]"
          onClick={handleSave}
        >
          Guardar cambios
        </button>
        <button
          className="bg-[#e5e7eb] text-[#555] border-none py-3 px-6 rounded-md cursor-pointer text-sm font-semibold font-[inherit] transition-colors hover:bg-[#d1d5db]"
          onClick={handleRestore}
        >
          Restaurar valores por defecto
        </button>
      </div>
    </div>
  );
}
