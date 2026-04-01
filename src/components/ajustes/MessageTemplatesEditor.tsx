import type { MessageTemplate } from '../../types';

interface MessageTemplatesEditorProps {
  templates: MessageTemplate[];
  onChange: (templates: MessageTemplate[]) => void;
}

export default function MessageTemplatesEditor({ templates, onChange }: MessageTemplatesEditorProps) {
  const updateTemplate = (index: number, field: 'name' | 'text', value: string) => {
    const next = templates.map((t, i) => (i === index ? { ...t, [field]: value } : t));
    onChange(next);
  };

  const deleteTemplate = (index: number) => {
    onChange(templates.filter((_, i) => i !== index));
  };

  const addTemplate = () => {
    onChange([...templates, { name: 'Nueva plantilla', text: '' }]);
  };

  return (
    <div className="grid grid-cols-1 gap-5 mb-6">
      <div className="bg-white rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <p className="text-xs text-[#999] mb-2.5">
          Usa [nombre] como variable para el nombre del contacto.
        </p>

        {templates.map((tpl, idx) => (
          <div
            key={idx}
            className="bg-[#f8f9fa] border border-[#eee] rounded-lg p-3.5 mb-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-2.5 py-1.5 border border-[#ddd] rounded text-[13px] font-semibold text-[#2a2a2a] outline-none focus:border-[#1DA1F2] font-[inherit]"
                placeholder="Nombre de la plantilla"
                value={tpl.name}
                onChange={(e) => updateTemplate(idx, 'name', e.target.value)}
              />
              <button
                className="bg-transparent border-none text-[#ef4444] text-base cursor-pointer px-1.5 py-0.5 rounded hover:bg-red-50"
                onClick={() => deleteTemplate(idx)}
                title="Eliminar plantilla"
              >
                &#10007;
              </button>
            </div>
            <textarea
              rows={2}
              className="w-full px-2.5 py-1.5 border border-[#ddd] rounded text-xs text-[#2a2a2a] outline-none focus:border-[#1DA1F2] resize-y min-h-[50px] leading-relaxed font-[inherit]"
              placeholder="Texto de la plantilla..."
              value={tpl.text}
              onChange={(e) => updateTemplate(idx, 'text', e.target.value)}
            />
          </div>
        ))}

        <button
          className="w-full mt-2 bg-transparent border border-dashed border-[#ccc] text-[#888] py-2 px-4 rounded-md cursor-pointer text-[13px] font-semibold font-[inherit] transition-all hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
          onClick={addTemplate}
        >
          + Agregar plantilla
        </button>
      </div>
    </div>
  );
}
