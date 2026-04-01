export interface Lead {
  rowIndex: number;
  nombre: string;
  whatsapp: string;
  fecha: string;
  ciudad: string;
  estado: string;
  ancho: string;
  alto: string;
  boca: string;
  foto: string;
  sistema: string;
  material: string;
  adicionales: string;
  medidasPend: string;
  hasMeasures: boolean;
  stage: string;
}

export interface BudgetItem {
  nombre: string;
  precio: number;
}

export interface LineItem {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  isFree: boolean;
  isFixed: boolean;
  code: string;
  _custom?: boolean;
}

export interface Budget {
  id: string;
  fecha: string;
  nro: string;
  cliente: string;
  telefono: string;
  sistema: string;
  material: string;
  medidas: string;
  items: BudgetItem[];
  subtotal: number;
  iva: number;
  total: number;
  descuento: number;
  recargo: number;
  cuotas: number;
  _rowIndex: number;
  clientKey?: string;
}

export interface BudgetFlat extends Budget {
  clientKey: string;
}

export interface Venta {
  rowIndex: number;
  cliente: string;
  telefono: string;
  fecha: string;
  monto: number;
  formaPago: string;
  estadoEntrega: string;
  notas: string;
}

export interface VentaStore {
  monto: number;
  formaPago: string;
  estadoEntrega: string;
  notas: string;
  _rowIndex?: number;
}

export interface Nota {
  rowIndex: number;
  cliente: string;
  telefono: string;
  fecha: string;
  usuario: string;
  texto: string;
}

export interface PipelineStage {
  name: string;
  color: string;
}

export interface InfoServicioCard {
  titulo: string;
  items: string[];
}

export interface AppSettings {
  empresaNombre: string;
  empresaSubtitulo: string;
  empresaDireccion: string;
  empresaTelefono: string;
  empresaInstagram: string;
  empresaWhatsapp: string;
  iva: number;
  descuento: number;
  recargo: number;
  cuotas: number;
  validez: string;
  saludo: string;
  cta: string;
  legal: string;
  infoServicio: InfoServicioCard[];
}

export interface MessageTemplate {
  name: string;
  text: string;
}

export interface TodoItem {
  id: number;
  text: string;
  done: boolean;
  date: string;
}

export type TabId = 'home' | 'pipeline' | 'presupuestos' | 'contactos' | 'ventas' | 'estadisticas' | 'ajustes';

export type SheetAction =
  | { action: 'addRow'; values: string[] }
  | { action: 'addRow'; sheet: string; headers: string[]; values: (string | number)[] }
  | { action: 'update'; row: number; col: number; value: string }
  | { action: 'deleteRow'; row: number; sheet?: string }
  | { action: 'findAndUpdate'; sheet: string; keyCol: number; keyVal: string; headers: string[]; values: (string | number)[] };
