import { useState, useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addLead } from '../../services/leads.service';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { ModalContext } from '../../contexts/ModalContext';
import { getTodayStr } from '../../lib/dates';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Producto {
  nombre: string;
}

export default function NuevoContactoModal({ isOpen, onClose }: Props) {
  const { stages } = usePipelineStages();
  const { showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [sistema, setSistema] = useState('');
  const [material, setMaterial] = useState('');
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [boca, setBoca] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [estado, setEstado] = useState('Nuevo Lead');

  const mutation = useMutation({
    mutationFn: (values: string[]) => addLead(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showToast('Contacto agregado: ' + nombre, 'success');
      resetForm();
      onClose();
    },
    onError: () => {
      showToast('Error al guardar contacto', 'error');
    },
  });

  const resetForm = () => {
    setNombre('');
    setWhatsapp('');
    setCiudad('');
    setSistema('');
    setMaterial('');
    setAncho('');
    setAlto('');
    setBoca('');
    setProductos([]);
    setEstado('Nuevo Lead');
  };

  const handleSubmit = () => {
    if (!nombre.trim()) {
      showToast('El nombre es obligatorio', 'error');
      return;
    }
    const adicionales = productos
      .map((p) => p.nombre.trim())
      .filter((n) => n.length > 0)
      .join(', ');

    const values = [
      nombre.trim(),
      whatsapp.trim(),
      getTodayStr(),
      ciudad.trim(),
      estado.trim(),
      ancho.trim(),
      alto.trim(),
      boca.trim(),
      '',
      sistema.trim(),
      material.trim(),
      adicionales,
      '',
      '',
    ];
    mutation.mutate(values);
  };

  const addProducto = () => {
    setProductos([...productos, { nombre: '' }]);
  };

  const removeProducto = (idx: number) => {
    setProductos(productos.filter((_, i) => i !== idx));
  };

  const updateProducto = (idx: number, value: string) => {
    setProductos(productos.map((p, i) => (i === idx ? { nombre: value } : p)));
  };

  if (!isOpen) return null;

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
        <h2 className="text-xl font-black text-[#2a2a2a] mb-4">Nuevo contacto</h2>

        <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Nombre *</label>
        <input
          type="text"
          className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">WhatsApp</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              placeholder="5493411234567"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Ciudad</label>
            <input
              type="text"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              placeholder="Rosario"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
            />
          </div>
        </div>

        <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Sistema</label>
        <select
          className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
          value={sistema}
          onChange={(e) => setSistema(e.target.value)}
        >
          <option value="">-- Sin definir --</option>
          <option value="Guillotina">Guillotina</option>
          <option value="Levadizo">Levadizo</option>
        </select>

        <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Material</label>
        <select
          className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        >
          <option value="">-- Sin definir --</option>
          <option value="Epoxi">Epoxi</option>
          <option value="Acero Inoxidable">Acero Inoxidable</option>
        </select>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Ancho total (cm)</label>
            <input
              type="number"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              placeholder="120"
              value={ancho}
              onChange={(e) => setAncho(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Alto total (cm)</label>
            <input
              type="number"
              className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
              placeholder="240"
              value={alto}
              onChange={(e) => setAlto(e.target.value)}
            />
          </div>
        </div>

        <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Ancho boca (cm)</label>
        <input
          type="number"
          className="w-full py-2 px-3 border border-[#ddd] rounded-md text-sm font-sans outline-none text-[#2a2a2a] bg-white focus:border-brand"
          placeholder="80"
          value={boca}
          onChange={(e) => setBoca(e.target.value)}
        />

        <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Adicionales</label>
        <div className="border border-[#e8ecf0] rounded-md overflow-hidden mt-1">
          {productos.length === 0 ? (
            <div className="p-2.5 text-[#999] text-[13px] text-center">Sin productos agregados</div>
          ) : (
            productos.map((prod, idx) => (
              <div key={idx} className="flex items-center gap-2 py-2 px-2.5 border-b border-[#f0f0f0] last:border-b-0">
                <input
                  type="text"
                  className="flex-1 py-1.5 px-2.5 border border-[#ddd] rounded text-[13px] font-sans outline-none text-[#2a2a2a] focus:border-brand"
                  placeholder="Nombre del producto"
                  value={prod.nombre}
                  onChange={(e) => updateProducto(idx, e.target.value)}
                />
                <button
                  className="bg-none border-none text-danger text-lg cursor-pointer py-0.5 px-1.5 rounded leading-none shrink-0 hover:bg-danger/10"
                  onClick={() => removeProducto(idx)}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          className="bg-none border border-dashed border-[#ccc] text-[#888] py-2 px-4 rounded-b-md cursor-pointer text-[13px] font-semibold font-sans w-full transition-all duration-200 hover:border-brand hover:text-brand"
          onClick={addProducto}
        >
          + Agregar producto
        </button>

        <label className="block text-xs text-[#888] mb-[3px] mt-3 uppercase tracking-[0.5px] font-semibold">Estado proyecto</label>
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

        <button
          className="bg-brand text-white border-none py-3 px-5 rounded-md cursor-pointer text-[15px] font-bold font-sans w-full mt-5 transition-colors duration-200 hover:bg-brand-hover disabled:opacity-50 disabled:pointer-events-none"
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar contacto'}
        </button>
      </div>
    </div>
  );
}
