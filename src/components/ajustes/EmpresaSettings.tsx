import type { AppSettings } from '../../types';

interface EmpresaSettingsProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

export default function EmpresaSettings({ settings, onChange }: EmpresaSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <div className="bg-white rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-bold text-[#2a2a2a] uppercase tracking-wide mb-4 pb-2 border-b-2 border-[#f0f0f0]">
          Datos de la empresa
        </h3>
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1">
          Nombre empresa
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.empresaNombre}
          onChange={(e) => onChange({ empresaNombre: e.target.value })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Subtitulo
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.empresaSubtitulo}
          onChange={(e) => onChange({ empresaSubtitulo: e.target.value })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Direccion
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.empresaDireccion}
          onChange={(e) => onChange({ empresaDireccion: e.target.value })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Telefono
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.empresaTelefono}
          onChange={(e) => onChange({ empresaTelefono: e.target.value })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Instagram
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.empresaInstagram}
          onChange={(e) => onChange({ empresaInstagram: e.target.value })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          WhatsApp (para wa.me)
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.empresaWhatsapp}
          onChange={(e) => onChange({ empresaWhatsapp: e.target.value })}
        />
      </div>

      <div className="bg-white rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-bold text-[#2a2a2a] uppercase tracking-wide mb-4 pb-2 border-b-2 border-[#f0f0f0]">
          Valores por defecto
        </h3>
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1">
          IVA %
        </label>
        <input
          type="number"
          min={0}
          max={100}
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.iva}
          onChange={(e) => onChange({ iva: parseFloat(e.target.value) || 0 })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Descuento anticipado %
        </label>
        <input
          type="number"
          min={0}
          max={100}
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.descuento}
          onChange={(e) => onChange({ descuento: parseFloat(e.target.value) || 0 })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Recargo cuotas %
        </label>
        <input
          type="number"
          min={0}
          max={100}
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.recargo}
          onChange={(e) => onChange({ recargo: parseFloat(e.target.value) || 0 })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Cantidad cuotas
        </label>
        <input
          type="number"
          min={2}
          max={24}
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.cuotas}
          onChange={(e) => onChange({ cuotas: parseInt(e.target.value) || 3 })}
        />
        <label className="block text-xs text-[#666] uppercase tracking-wide font-semibold mb-1 mt-3">
          Validez presupuesto
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-[#ddd] rounded-md text-sm text-[#2a2a2a] outline-none focus:border-[#1DA1F2]"
          value={settings.validez}
          onChange={(e) => onChange({ validez: e.target.value })}
        />
      </div>
    </div>
  );
}
