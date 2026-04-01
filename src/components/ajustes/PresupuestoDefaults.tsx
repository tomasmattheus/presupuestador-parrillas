import type { AppSettings } from '../../types';

interface PresupuestoDefaultsProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

export default function PresupuestoDefaults({ settings, onChange }: PresupuestoDefaultsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 mb-6">
      <div className="bg-white rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-bold text-[#2a2a2a] uppercase tracking-wide mb-4 pb-2 border-b-2 border-[#f0f0f0]">
          Textos por defecto
        </h3>
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1">
          Saludo
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2] resize-y min-h-[70px] leading-relaxed font-[inherit]"
          value={settings.saludo}
          onChange={(e) => onChange({ saludo: e.target.value })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          CTA final
        </label>
        <textarea
          rows={2}
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2] resize-y min-h-[70px] leading-relaxed font-[inherit]"
          value={settings.cta}
          onChange={(e) => onChange({ cta: e.target.value })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Condiciones legales
        </label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2] resize-y min-h-[70px] leading-relaxed font-[inherit]"
          value={settings.legal}
          onChange={(e) => onChange({ legal: e.target.value })}
        />
      </div>
    </div>
  );
}
