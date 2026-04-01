import { useState, useCallback } from 'react';
import type { Lead, LineItem } from '../types';
import { useSettings } from './useSettings';

export interface PresupFormData {
  cliente: string;
  telefono: string;
  localidad: string;
  sistema: string;
  material: string;
  ancho: string;
  alto: string;
  boca: string;
  cbBajo: boolean;
  cbMesada: boolean;
  cbTapa: boolean;
  cbLateral: boolean;
  bajoPuertas: string;
  descuento: number;
  recargo: number;
  cuotas: number;
}

const initialFormData: PresupFormData = {
  cliente: '',
  telefono: '',
  localidad: '',
  sistema: 'Levadizo con pistones',
  material: 'Acero inoxidable esmerilado',
  ancho: '1200',
  alto: '2400',
  boca: '800',
  cbBajo: false,
  cbMesada: false,
  cbTapa: false,
  cbLateral: false,
  bajoPuertas: '2',
  descuento: 5,
  recargo: 15,
  cuotas: 3,
};

function getProductCode(tipo: string, sistema: string, material: string, puertas?: string): string {
  const matCode = (material || '').toLowerCase().indexOf('inox') >= 0 ? 'INOX' : 'CHP';
  const sisCode = (sistema || '').toLowerCase().indexOf('guillotina') >= 0 ? 'FGL' : 'FLV';
  if (tipo === 'frente') return sisCode + '-' + matCode;
  if (tipo === 'bajo') return 'BP-' + puertas + 'P';
  if (tipo === 'mesada') return 'BM-PC';
  if (tipo === 'tapa') return 'TSH';
  if (tipo === 'lateral') return 'LAT';
  return 'QD-000';
}

export function usePresupuestoForm() {
  const { settings } = useSettings();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [nextItemId, setNextItemId] = useState(1);
  const [photoUrl, setPhotoUrl] = useState('');
  const [formData, setFormData] = useState<PresupFormData>(() => ({
    ...initialFormData,
    descuento: settings.descuento,
    recargo: settings.recargo,
    cuotas: settings.cuotas,
  }));

  const rebuildItemsFromConfig = useCallback(
    (sistema: string, material: string, checkboxes: { bajo: boolean; mesada: boolean; tapa: boolean; lateral: boolean; bajoPuertas: string }) => {
      setLineItems((prev) => {
        const customItems = prev.filter((it) => it._custom === true);
        const items: LineItem[] = [];
        let id = nextItemId;

        const makeItem = (name: string, subtitle: string, price: number, isFree: boolean, isFixed: boolean, code: string, custom?: boolean): LineItem => {
          const item: LineItem = { id: id++, name, subtitle, price, isFree, isFixed, code, _custom: custom };
          return item;
        };

        items.push(makeItem(
          'Frente de parrilla ' + sistema.toLowerCase(),
          material, 0, false, false, getProductCode('frente', sistema, material)
        ));

        if (checkboxes.bajo) {
          items.push(makeItem(
            'Bajo parrilla ' + checkboxes.bajoPuertas + ' puertas',
            material, 0, false, false, getProductCode('bajo', sistema, material, checkboxes.bajoPuertas)
          ));
        }
        if (checkboxes.mesada) {
          items.push(makeItem(
            'Bajo mesada con puerta y cajonera',
            material, 0, false, false, getProductCode('mesada', sistema, material)
          ));
        }
        if (checkboxes.tapa) {
          items.push(makeItem(
            'Tapa superior horno',
            material, 0, false, false, getProductCode('tapa', sistema, material)
          ));
        }
        if (checkboxes.lateral) {
          items.push(makeItem(
            'Lateral piso a techo',
            material, 0, false, false, getProductCode('lateral', sistema, material)
          ));
        }

        customItems.forEach((ci) => {
          items.push({ ...ci, id: id++ });
        });

        items.push(makeItem('Palita y atizador', 'Accesorios de regalo', 0, true, true, 'ACC'));
        items.push(makeItem('Colocacion en obra', 'Instalacion profesional', 0, true, true, 'INST'));

        setNextItemId(id);
        return items;
      });
    },
    [nextItemId]
  );

  const addCustomItem = useCallback(() => {
    setLineItems((prev) => {
      let id: number;
      setNextItemId((prevId) => {
        id = prevId;
        return prevId + 1;
      });
      const code = 'QD-C' + String(id!).padStart(2, '0');
      const newItem: LineItem = { id: id!, name: 'Nuevo producto', subtitle: '', price: 0, isFree: false, isFixed: false, code, _custom: true };
      const fixedStart = prev.findIndex((it) => it.isFixed);
      if (fixedStart >= 0) {
        const next = [...prev];
        next.splice(fixedStart, 0, newItem);
        return next;
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setLineItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const updateItem = useCallback((id: number, field: keyof LineItem, value: string | number | boolean) => {
    setLineItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  }, []);

  const loadLeadIntoForm = useCallback((lead: Lead) => {
    let phone = String(lead.whatsapp || '').replace(/\D/g, '');
    if (phone.startsWith('549')) phone = '0' + phone.substring(3);
    else if (phone.startsWith('54')) phone = '0' + phone.substring(2);

    const sistemaMap: Record<string, string> = {
      levadizo: 'Levadizo con pistones',
      guillotina: 'Guillotina contrapesado',
    };
    const sistemaLower = (lead.sistema || '').toLowerCase().trim();
    const sistema = sistemaMap[sistemaLower] || initialFormData.sistema;

    const matLower = (lead.material || '').toLowerCase().trim();
    let material = initialFormData.material;
    if (matLower.indexOf('inox') >= 0 || matLower.indexOf('acero') >= 0) {
      material = 'Acero inoxidable esmerilado';
    } else if (matLower.indexOf('epoxi') >= 0 || matLower.indexOf('chapa') >= 0) {
      material = 'Chapa pintada epoxi negro';
    }

    const anchoCm = parseFloat(lead.ancho);
    const altoCm = parseFloat(lead.alto);
    const bocaCm = parseFloat(lead.boca);

    const adicLower = (lead.adicionales || '').toLowerCase();
    const cbBajo = adicLower.indexOf('bajo parrilla') >= 0 || adicLower.indexOf('bajo mesada') >= 0;
    const cbMesada = adicLower.indexOf('bajo mesada') >= 0 || adicLower.indexOf('mesada') >= 0;
    const cbTapa = adicLower.indexOf('tapa') >= 0 || adicLower.indexOf('horno') >= 0;
    const cbLateral = adicLower.indexOf('lateral') >= 0;

    const newForm: PresupFormData = {
      cliente: lead.nombre,
      telefono: phone,
      localidad: lead.ciudad || 'Rosario',
      sistema,
      material,
      ancho: !isNaN(anchoCm) && anchoCm > 0 ? String(Math.round(anchoCm * 10)) : '',
      alto: !isNaN(altoCm) && altoCm > 0 ? String(Math.round(altoCm * 10)) : '',
      boca: !isNaN(bocaCm) && bocaCm > 0 ? String(Math.round(bocaCm * 10)) : '',
      cbBajo,
      cbMesada,
      cbTapa,
      cbLateral,
      bajoPuertas: '2',
      descuento: settings.descuento,
      recargo: settings.recargo,
      cuotas: settings.cuotas,
    };

    setFormData(newForm);
    rebuildItemsFromConfig(sistema, material, {
      bajo: cbBajo,
      mesada: cbMesada,
      tapa: cbTapa,
      lateral: cbLateral,
      bajoPuertas: '2',
    });
  }, [settings, rebuildItemsFromConfig]);

  const calculateTotals = useCallback(() => {
    let total = 0;
    lineItems.forEach((item) => {
      if (!item.isFree) total += item.price;
    });
    return { subtotal: total, iva: 0, total };
  }, [lineItems]);

  return {
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
  };
}

export type PresupuestoFormHook = ReturnType<typeof usePresupuestoForm>;
