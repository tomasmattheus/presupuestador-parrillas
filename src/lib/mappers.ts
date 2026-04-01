import type { PipelineStage } from '../types';

export function mapEstadoToStage(estado: string, stages: PipelineStage[]): string {
  if (!estado) return 'Nuevo Lead';
  const s = estado.trim();
  for (let i = 0; i < stages.length; i++) {
    if (s.toLowerCase() === stages[i].name.toLowerCase()) return stages[i].name;
  }
  for (let j = 0; j < stages.length; j++) {
    if (s === stages[j].name) return stages[j].name;
  }
  return 'Nuevo Lead';
}

export function getEstadoBadgeClass(estado: string | null | undefined): string {
  if (!estado) return 'estado-nuevo-lead';
  const s = estado.toLowerCase().trim();
  if (s === 'nuevo lead') return 'estado-nuevo-lead';
  if (s === 'presupuesto enviado') return 'estado-presupuesto-enviado';
  if (s === 'en seguimiento') return 'estado-en-seguimiento';
  if (s === 'cerrado ganado') return 'estado-cerrado-ganado';
  if (s === 'cerrado perdido') return 'estado-cerrado-perdido';
  return 'estado-nuevo-lead';
}

export function getProductCode(tipo: string, sistema?: string, material?: string, puertas?: string): string {
  const matCode = (material || '').toLowerCase().indexOf('inox') >= 0 ? 'INOX' : 'CHP';
  const sisCode = (sistema || '').toLowerCase().indexOf('guillotina') >= 0 ? 'FGL' : 'FLV';
  if (tipo === 'frente') return sisCode + '-' + matCode;
  if (tipo === 'bajo') return 'BP-' + puertas + 'P';
  if (tipo === 'mesada') return 'BM-PC';
  if (tipo === 'tapa') return 'TSH';
  if (tipo === 'lateral') return 'LAT';
  return 'QD-000';
}
