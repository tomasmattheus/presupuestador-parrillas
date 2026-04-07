import { useState, useEffect, useCallback, useContext } from 'react';
import type { BudgetFlat, Lead } from '../../types';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { useLeads } from '../../hooks/useLeads';
import { useSettings } from '../../hooks/useSettings';
import { saveBudget } from '../../services/presupuestos.service';
import { addLead, updateLeadField } from '../../services/leads.service';
import { getTodayStr } from '../../lib/dates';
import { ModalContext } from '../../contexts/ModalContext';
import { useQueryClient } from '@tanstack/react-query';
import LeadSelector from './LeadSelector';
import LineItemsTable from './LineItemsTable';
import ClientNotes from './ClientNotes';

import type { PresupuestoFormHook } from '../../hooks/usePresupuestoForm';

interface Props {
  onBack: () => void;
  editBudget?: BudgetFlat | null;
  formHook: PresupuestoFormHook;
  onPrint?: (fileName?: string, preOpenedWin?: Window | null) => void;
}

export default function PresupuestoForm({ onBack, editBudget, formHook, onPrint }: Props) {
  const { settings } = useSettings();
  const { nextNumber } = usePresupuestos();
  const { data: allLeads = [] } = useLeads();
  const queryClient = useQueryClient();
  const { showToast } = useContext(ModalContext);

  const {
    lineItems,
    formData,
    setFormData,
    rebuildItemsFromConfig,
    addCustomItem,
    removeItem,
    updateItem,
    loadLeadIntoForm,
    calculateTotals,
    photoUrl,
    setPhotoUrl,
  } = formHook;

  const [nro, setNro] = useState(String(nextNumber || '0001'));
  const [fecha, setFecha] = useState(() => {
    const t = new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  });
  const [saludo, setSaludo] = useState(settings.saludo);
  const [cta, setCta] = useState(settings.cta);
  const [legal, setLegal] = useState(settings.legal);
  const [validez, setValidez] = useState(settings.validez);
  const [textsOpen, setTextsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editBudget) {
      setNro(editBudget.nro);
      setFormData((prev) => ({
        ...prev,
        cliente: editBudget.cliente,
        telefono: editBudget.telefono || '',
        sistema: mapSistemaToForm(editBudget.sistema),
        material: mapMaterialToForm(editBudget.material),
        descuento: editBudget.descuento || settings.descuento,
        recargo: editBudget.recargo || settings.recargo,
        cuotas: editBudget.cuotas || settings.cuotas,
      }));
      if (editBudget.medidas) {
        const mParts = editBudget.medidas.replace('mm', '').trim().split('x');
        if (mParts.length >= 2) {
          setFormData((prev) => ({ ...prev, ancho: mParts[0].trim(), alto: mParts[1].trim() }));
        }
      }
    }
  }, [editBudget, setFormData, settings]);

  useEffect(() => {
    rebuildItemsFromConfig(formData.sistema, formData.material, {
      bajo: formData.cbBajo,
      mesada: formData.cbMesada,
      tapa: formData.cbTapa,
      lateral: formData.cbLateral,
      bajoPuertas: formData.bajoPuertas,
    });
  }, [formData.sistema, formData.material, formData.cbBajo, formData.cbMesada, formData.cbTapa, formData.cbLateral, formData.bajoPuertas]);

  const updateField = useCallback(<K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, [setFormData]);

  const [leadSelected, setLeadSelected] = useState(!!editBudget);

  const handleLeadSelect = useCallback((lead: Lead) => {
    loadLeadIntoForm(lead);
    setLeadSelected(true);
  }, [loadLeadIntoForm]);

  const handleNewBlank = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      cliente: '',
      telefono: '',
      localidad: 'Rosario',
      ancho: '',
      alto: '',
      boca: '',
      cbBajo: false,
      cbMesada: false,
      cbTapa: false,
      cbLateral: false,
    }));
    setNro(nextNumber);
    setLeadSelected(false);
  }, [setFormData, nextNumber]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const heroImage = photoUrl || (
    formData.material.toLowerCase().indexOf('inox') >= 0
      ? 'foto-inox-frente.jpg'
      : 'foto-frente.jpg'
  );

  const handleGenerate = useCallback(async () => {
    // Validation
    const clienteTrimmed = formData.cliente.trim();
    if (!clienteTrimmed) {
      showToast('Debe ingresar el nombre del cliente', 'error');
      return;
    }
    const hasPrice = lineItems.some((it) => it.price > 0);
    if (!hasPrice) {
      showToast('Al menos un producto debe tener precio mayor a 0', 'error');
      return;
    }

    const { subtotal, iva, total } = calculateTotals();
    const id = editBudget?.id || (Date.now().toString(36) + Math.random().toString(36).slice(2));
    const itemsForSave = lineItems.map((it) => ({ nombre: it.name.trim(), precio: it.price }));
    const medidas = formData.ancho.trim() + ' x ' + formData.alto.trim() + ' mm';

    setSaving(true);
    const printWin = window.open('', '_blank', 'width=800,height=600');
    try {
      await saveBudget({
        id,
        fecha: getTodayStr(),
        nro: String(nro).trim(),
        cliente: clienteTrimmed,
        telefono: formData.telefono.trim(),
        sistema: formData.sistema.trim(),
        material: formData.material.trim(),
        medidas,
        items: itemsForSave,
        subtotal,
        iva,
        total,
        descuento: formData.descuento,
        recargo: formData.recargo,
        cuotas: formData.cuotas,
      });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      showToast('Presupuesto guardado correctamente', 'success');

      /* AUTO-ACTION 1: Auto-create contact if not exists */
      const clienteName = (formData.cliente || '').trim();
      if (clienteName) {
        const exists = allLeads.some(
          (l) => l.nombre && l.nombre.trim().toLowerCase() === clienteName.toLowerCase()
        );
        if (!exists) {
          const telefono = (formData.telefono || '').replace(/\D/g, '');
          let waNum = telefono;
          if (waNum.startsWith('0')) waNum = '549' + waNum.substring(1);

          const anchoCm = formData.ancho ? (parseFloat(formData.ancho) / 10).toString() : '';
          const altoCm = formData.alto ? (parseFloat(formData.alto) / 10).toString() : '';
          const bocaCm = formData.boca ? (parseFloat(formData.boca) / 10).toString() : '';

          let sistemaMapped = formData.sistema;
          if (formData.sistema.indexOf('Guillotina') >= 0) sistemaMapped = 'Guillotina';
          else if (formData.sistema.indexOf('Levadizo') >= 0) sistemaMapped = 'Levadizo';

          let materialMapped = formData.material;
          if (formData.material.toLowerCase().indexOf('inox') >= 0) materialMapped = 'Acero Inoxidable';
          else if (formData.material.toLowerCase().indexOf('epoxi') >= 0) materialMapped = 'Epoxi';

          const adicParts: string[] = ['Frente'];
          if (formData.cbBajo) adicParts.push('Bajo parrilla');
          if (formData.cbMesada) adicParts.push('Bajo mesada');
          if (formData.cbTapa) adicParts.push('Tapa horno');
          if (formData.cbLateral) adicParts.push('Lateral');
          const adicionales = adicParts.join(' + ');

          const values = [
            clienteName,             /* Nombre */
            waNum,                   /* WhatsApp */
            getTodayStr(),           /* Fecha */
            formData.localidad || '',/* Ciudad */
            'Presupuesto Enviado',   /* Estado */
            anchoCm,                 /* Ancho total */
            altoCm,                  /* Alto total */
            bocaCm,                  /* Ancho boca */
            '',                      /* Tiene foto */
            sistemaMapped,           /* Sistema */
            materialMapped,          /* Material */
            adicionales,             /* Adicionales */
            '',                      /* Medidas pendientes */
            '',                      /* Cargado HubSpot */
          ];
          addLead(values)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['leads'] });
              showToast('Contacto creado automaticamente', 'success');
            })
            .catch(() => { /* silent */ });
        } else {
          /* AUTO-ACTION 2: Auto-move lead to "Presupuesto Enviado" */
          const lead = allLeads.find(
            (l) => l.nombre && l.nombre.trim().toLowerCase() === clienteName.toLowerCase()
          );
          if (
            lead &&
            lead.stage !== 'Presupuesto Enviado' &&
            lead.stage !== 'Cerrado Ganado' &&
            lead.stage !== 'Cerrado Perdido'
          ) {
            updateLeadField(lead.rowIndex, 4, 'Presupuesto Enviado')
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ['leads'] });
              })
              .catch(() => { /* silent */ });
          }
        }
      }

      const clienteClean = (formData.cliente || 'Sin_nombre').trim().replace(/\s+/g, '_');
      const pdfName = `Presupuesto_${nro}_${clienteClean}`;
      if (onPrint) onPrint(pdfName, printWin); else window.print();
    } catch (err) {
      if (printWin) printWin.close();
      console.error('Error guardando presupuesto:', err);
      showToast('Error al guardar presupuesto: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setSaving(false);
    }
  }, [calculateTotals, editBudget, lineItems, formData, nro, queryClient, showToast, allLeads]);

  return (
    <div className="w-[400px] min-w-[400px] max-w-[400px] bg-white h-full overflow-y-auto overflow-x-hidden py-5 px-[18px] border-r border-[#e5e5e5] [scrollbar-width:thin] [scrollbar-color:#ccc_#fff] presup-form-panel box-border">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 bg-transparent border-none text-brand text-[13px] font-semibold cursor-pointer font-sans py-1.5 px-0 mb-1.5 hover:text-brand-hover hover:underline transition-colors"
      >
        &larr; Volver al listado
      </button>

      <div className="text-center py-2.5 pb-1.5">
        <span className="text-brand font-bold text-lg tracking-[2px]">QUALITY DECO</span>
        <small className="block text-[#aaa] text-[11px] tracking-wider">GENERADOR DE PRESUPUESTOS</small>
      </div>

      <h2 className="text-brand text-sm uppercase tracking-[1.5px] mt-2.5 mb-2.5 border-b border-[#eee] pb-1.5">Cargar lead del bot</h2>
      <LeadSelector onLeadSelect={handleLeadSelect} onNewBlank={handleNewBlank} />

      <ClientNotes clienteName={formData.cliente} clienteWhatsapp={formData.telefono} leadSelected={leadSelected} />

      <h2 className="text-brand text-sm uppercase tracking-[1.5px] mt-5 mb-2.5 border-b border-[#eee] pb-1.5">Datos del cliente</h2>
      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">N&deg; presupuesto</label>
          <input type="text" value={nro} onChange={(e) => setNro(e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
      </div>
      <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Cliente</label>
      <input type="text" value={formData.cliente} onChange={(e) => updateField('cliente', e.target.value)} placeholder="Nombre del cliente" className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Telefono</label>
          <input type="text" value={formData.telefono} onChange={(e) => updateField('telefono', e.target.value)} placeholder="341-..." className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Localidad</label>
          <input type="text" value={formData.localidad} onChange={(e) => updateField('localidad', e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
      </div>

      <h2 className="text-brand text-sm uppercase tracking-[1.5px] mt-5 mb-2.5 border-b border-[#eee] pb-1.5">Producto</h2>
      <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Sistema</label>
      <select value={formData.sistema} onChange={(e) => updateField('sistema', e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]">
        <option value="Guillotina contrapesado">Guillotina contrapesado</option>
        <option value="Levadizo con pistones">Levadizo con pistones</option>
      </select>
      <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Material</label>
      <select value={formData.material} onChange={(e) => updateField('material', e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]">
        <option value="Acero inoxidable esmerilado">Acero inoxidable esmerilado</option>
        <option value="Chapa pintada epoxi negro">Chapa pintada epoxi negro</option>
      </select>
      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Ancho total (mm)</label>
          <input type="number" value={formData.ancho} onChange={(e) => updateField('ancho', e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Alto total (mm)</label>
          <input type="number" value={formData.alto} onChange={(e) => updateField('alto', e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Boca parrilla (mm)</label>
          <input type="number" value={formData.boca} onChange={(e) => updateField('boca', e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
      </div>

      <div className="mt-2.5">
        <label className="flex items-center gap-2 text-[#444] text-[13px] cursor-pointer mt-1.5">
          <input type="checkbox" checked={formData.cbBajo} onChange={(e) => updateField('cbBajo', e.target.checked)} className="accent-brand w-4 h-4" />
          Bajo parrilla
        </label>
        {formData.cbBajo && (
          <div className="ml-7 mt-1">
            <select value={formData.bajoPuertas} onChange={(e) => updateField('bajoPuertas', e.target.value)} className="w-auto py-1 px-2 text-xs bg-white border border-[#ddd] rounded-md font-sans">
              <option value="2">2 puertas</option>
              <option value="3">3 puertas</option>
              <option value="4">4 puertas</option>
            </select>
          </div>
        )}
        <label className="flex items-center gap-2 text-[#444] text-[13px] cursor-pointer mt-1.5">
          <input type="checkbox" checked={formData.cbMesada} onChange={(e) => updateField('cbMesada', e.target.checked)} className="accent-brand w-4 h-4" />
          Bajo mesada con puerta y cajonera
        </label>
        <label className="flex items-center gap-2 text-[#444] text-[13px] cursor-pointer mt-1.5">
          <input type="checkbox" checked={formData.cbTapa} onChange={(e) => updateField('cbTapa', e.target.checked)} className="accent-brand w-4 h-4" />
          Tapa superior horno
        </label>
        <label className="flex items-center gap-2 text-[#444] text-[13px] cursor-pointer mt-1.5">
          <input type="checkbox" checked={formData.cbLateral} onChange={(e) => updateField('cbLateral', e.target.checked)} className="accent-brand w-4 h-4" />
          Lateral piso a techo
        </label>
      </div>

      <h2 className="text-brand text-sm uppercase tracking-[1.5px] mt-5 mb-2.5 border-b border-[#eee] pb-1.5">Productos y precios</h2>
      <LineItemsTable
        items={lineItems}
        onRemove={removeItem}
        onUpdateName={(id, name) => updateItem(id, 'name', name)}
        onUpdatePrice={(id, price) => updateItem(id, 'price', price)}
        onAdd={addCustomItem}
      />

      <h2 className="text-brand text-sm uppercase tracking-[1.5px] mt-5 mb-2.5 border-b border-[#eee] pb-1.5">Formas de pago</h2>
      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Descuento anticipado %</label>
          <input type="number" value={formData.descuento} onChange={(e) => updateField('descuento', parseFloat(e.target.value) || 0)} min={0} max={100} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Recargo cuotas %</label>
          <input type="number" value={formData.recargo} onChange={(e) => updateField('recargo', parseFloat(e.target.value) || 0)} min={0} max={100} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Cant. cuotas</label>
          <input type="number" value={formData.cuotas} onChange={(e) => updateField('cuotas', parseInt(e.target.value) || 3)} min={2} max={24} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
      </div>

      <h2
        className="text-brand text-sm uppercase tracking-[1.5px] mt-5 mb-2.5 border-b border-[#eee] pb-1.5 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setTextsOpen(!textsOpen)}
      >
        Personalizar textos
        <span className={'text-xs text-[#666] transition-transform duration-200 ' + (textsOpen ? 'rotate-180' : '')}>&#9660;</span>
      </h2>
      {textsOpen && (
        <div>
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Saludo</label>
          <textarea value={saludo} onChange={(e) => setSaludo(e.target.value)} rows={4} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none resize-y min-h-[60px] leading-[1.4] focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">CTA final</label>
          <textarea value={cta} onChange={(e) => setCta(e.target.value)} rows={2} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none resize-y min-h-[60px] leading-[1.4] focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Condiciones legales</label>
          <textarea value={legal} onChange={(e) => setLegal(e.target.value)} rows={5} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none resize-y min-h-[60px] leading-[1.4] focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
          <label className="block text-xs text-[#888] mb-0.5 mt-2.5 uppercase tracking-wide">Validez</label>
          <input type="text" value={validez} onChange={(e) => setValidez(e.target.value)} className="w-full py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]" />
        </div>
      )}

      <h2 className="text-brand text-sm uppercase tracking-[1.5px] mt-5 mb-2.5 border-b border-[#eee] pb-1.5">Foto de portada</h2>
      <div className="relative">
        <img
          src={heroImage}
          alt="Preview"
          className="w-full max-h-[120px] object-cover rounded-md border border-[#ddd]"
        />
        <label className="absolute bottom-2 right-2 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer hover:bg-brand-hover transition-colors shadow-md">
          Cambiar foto
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </label>
      </div>

      <div className="bg-[rgba(29,161,242,0.1)] border border-[rgba(29,161,242,0.2)] rounded py-2 px-3 text-[11px] text-brand mt-4 leading-[1.4] text-center">
        Al imprimir: activa &quot;Graficos en segundo plano&quot; y margenes &quot;Ninguno&quot;
      </div>
      <button
        onClick={handleGenerate}
        disabled={saving}
        className="bg-brand text-white border-none py-3.5 px-5 rounded-md cursor-pointer text-base font-bold mt-6 w-full uppercase tracking-wider font-sans hover:bg-brand-hover transition-colors disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Generar PDF'}
      </button>
    </div>
  );
}

function mapSistemaToForm(sistema: string): string {
  if (!sistema) return 'Guillotina contrapesado';
  const s = sistema.toLowerCase();
  if (s.indexOf('guillotina') >= 0) return 'Guillotina contrapesado';
  if (s.indexOf('levadizo') >= 0) return 'Levadizo con pistones';
  return sistema;
}

function mapMaterialToForm(material: string): string {
  if (!material) return 'Acero inoxidable esmerilado';
  const m = material.toLowerCase();
  if (m.indexOf('inox') >= 0 || m.indexOf('acero') >= 0) return 'Acero inoxidable esmerilado';
  if (m.indexOf('epoxi') >= 0 || m.indexOf('chapa') >= 0) return 'Chapa pintada epoxi negro';
  return material;
}
