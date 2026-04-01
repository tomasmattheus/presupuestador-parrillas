import { useState, useEffect, useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLeadField } from '../../services/leads.service';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export default function EditContactModal({ isOpen, onClose, lead }: Props) {
  const { stages } = usePipelineStages();
  const { showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [sistema, setSistema] = useState('');
  const [material, setMaterial] = useState('');
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [boca, setBoca] = useState('');
  const [adicionales, setAdicionales] = useState('');

  useEffect(() => {
    if (lead) {
      setNombre(lead.nombre || '');
      setWhatsapp(lead.whatsapp || '');
      setCiudad(lead.ciudad || '');
      setEstado(lead.stage || 'Nuevo Lead');
      setSistema(lead.sistema || '');
      setMaterial(lead.material || '');
      setAncho(lead.ancho || '');
      setAlto(lead.alto || '');
      setBoca(lead.boca || '');
      setAdicionales(lead.adicionales || '');
    }
  }, [lead]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!lead) return;
      const fields = [
        { col: 0, val: nombre },
        { col: 1, val: whatsapp },
        { col: 3, val: ciudad },
        { col: 4, val: estado },
        { col: 5, val: ancho },
        { col: 6, val: alto },
        { col: 7, val: boca },
        { col: 9, val: sistema },
        { col: 10, val: material },
        { col: 11, val: adicionales },
      ];
      await Promise.all(fields.map((f) => updateLeadField(lead.rowIndex, f.col, f.val)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showToast('Contacto actualizado', 'success');
      onClose();
    },
    onError: () => {
      showToast('Error al guardar', 'error');
    },
  });

  if (!isOpen || !lead) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl py-7 px-8 max-w-[520px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.3)] text-[#2a2a2a] relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-4 bg-none border-none text-2xl text-[#999] cursor-pointer py-1 px-2 leading-none hover:text-[#333]"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-black text-[#2a2a2a] mb-4">Editar contacto</h2>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Nombre</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">WhatsApp</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Ciudad</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Estado</label>
            <select
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {stages.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Sistema</label>
            <select
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={sistema}
              onChange={(e) => setSistema(e.target.value)}
            >
              <option value="">-</option>
              <option value="Guillotina">Guillotina</option>
              <option value="Levadizo">Levadizo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Material</label>
            <select
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              <option value="">-</option>
              <option value="Epoxi">Epoxi</option>
              <option value="Acero Inoxidable">Acero Inoxidable</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Ancho total (cm)</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={ancho}
              onChange={(e) => setAncho(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Alto total (cm)</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={alto}
              onChange={(e) => setAlto(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Ancho boca (cm)</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={boca}
              onChange={(e) => setBoca(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Adicionales</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              value={adicionales}
              onChange={(e) => setAdicionales(e.target.value)}
            />
          </div>
        </div>

        <button
          className="w-full py-3 bg-brand text-white border-none rounded-md text-[15px] font-bold cursor-pointer mt-4 transition-colors duration-200 hover:bg-brand-hover disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
