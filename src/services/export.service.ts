import type { Lead, PipelineStage, VentaStore } from '../types';
import { escapeHtml, csvEscape } from '../lib/text';
import { formatDateAR } from '../lib/dates';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dateSuffix(): string {
  return new Date().toISOString().slice(0, 10);
}

const EXCEL_HEAD = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:spreadsheet" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>td,th{padding:6px 10px;border:1px solid #ccc;font-family:Arial;font-size:11px;} th{background:#1DA1F2;color:#fff;font-weight:700;}</style></head><body>';
const EXCEL_HEAD_VENTAS = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:spreadsheet" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>td,th{padding:6px 10px;border:1px solid #ccc;font-family:Arial;font-size:11px;} th{background:#1DA1F2;color:#fff;font-weight:700;} .num{mso-number-format:"\\#\\,\\#\\#0";text-align:right;} .total-row td{background:#f0f0f0;font-weight:700;}</style></head><body>';

export function exportContactosExcel(leads: Lead[]): void {
  let html = EXCEL_HEAD;
  html += '<table>';
  html += '<tr><td colspan="10" style="font-size:16px;font-weight:700;padding:12px 10px 4px;border:none;color:#1DA1F2;">Quality Deco - Contactos</td></tr>';
  html += '<tr><td colspan="10" style="font-size:11px;color:#666;padding:4px 10px 12px;border:none;">' + leads.length + ' contactos · Exportado ' + new Date().toLocaleDateString('es-AR') + '</td></tr>';
  html += '</table><br><table>';
  html += '<tr><th>Nombre</th><th>WhatsApp</th><th>Ciudad</th><th>Fecha</th><th>Estado</th><th>Sistema</th><th>Material</th><th>Ancho</th><th>Alto</th><th>Boca</th><th>Adicionales</th></tr>';
  leads.forEach((lead) => {
    html += '<tr>' +
      '<td style="font-weight:600;">' + escapeHtml(lead.nombre) + '</td>' +
      '<td>' + escapeHtml(lead.whatsapp || '-') + '</td>' +
      '<td>' + escapeHtml(lead.ciudad || '-') + '</td>' +
      '<td>' + escapeHtml(formatDateAR(lead.fecha) || '-') + '</td>' +
      '<td>' + escapeHtml(lead.stage || '-') + '</td>' +
      '<td>' + escapeHtml(lead.sistema || '-') + '</td>' +
      '<td>' + escapeHtml(lead.material || '-') + '</td>' +
      '<td>' + escapeHtml(lead.ancho || '-') + '</td>' +
      '<td>' + escapeHtml(lead.alto || '-') + '</td>' +
      '<td>' + escapeHtml(lead.boca || '-') + '</td>' +
      '<td>' + escapeHtml(lead.adicionales || '-') + '</td></tr>';
  });
  html += '</table></body></html>';
  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerDownload(blob, 'contactos_quality_deco_' + dateSuffix() + '.xls');
}

function getVentaKey(lead: Lead): string {
  return (lead.nombre || '') + '|' + (lead.whatsapp || '');
}

export function exportVentasCSV(data: { ganados: Lead[]; ventasStore: Record<string, VentaStore> }): void {
  const { ganados, ventasStore } = data;
  const headers = ['Cliente', 'Ciudad', 'Fecha cierre', 'Sistema', 'Material', 'Medidas', 'Monto presupuestado', 'Forma de pago', 'Estado entrega', 'Notas'];
  const rows: string[] = [headers.join(',')];
  ganados.forEach((lead) => {
    const key = getVentaKey(lead);
    const vdata = ventasStore[key] || {} as VentaStore;
    const medidas = lead.hasMeasures ? (lead.ancho + ' x ' + lead.alto + ' cm') : '';
    const row = [
      csvEscape(lead.nombre),
      csvEscape(lead.ciudad || ''),
      csvEscape(lead.fecha || ''),
      csvEscape(lead.sistema || ''),
      csvEscape(lead.material || ''),
      csvEscape(medidas),
      String(vdata.monto || 0),
      csvEscape(vdata.formaPago || ''),
      csvEscape(vdata.estadoEntrega || ''),
      csvEscape(vdata.notas || ''),
    ];
    rows.push(row.join(','));
  });
  const csvContent = rows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'ventas_quality_deco_' + dateSuffix() + '.csv');
}

export function exportVentasExcel(data: {
  ganados: Lead[];
  ventasStore: Record<string, VentaStore>;
  rangeText?: string;
}): void {
  const { ganados, ventasStore } = data;
  let html = EXCEL_HEAD_VENTAS + '<table>';
  html += '<tr><td colspan="10" style="font-size:16px;font-weight:700;padding:12px;border:none;color:#1DA1F2;">Quality Deco - Reporte de Ventas</td></tr>';
  html += '<tr><td colspan="10" style="font-size:11px;color:#666;padding:6px;border:none;">' + (data.rangeText || 'Todas las ventas') + '</td></tr>';
  html += '<tr><td colspan="10" style="border:none;"></td></tr>';
  html += '<tr><th>Cliente</th><th>Ciudad</th><th>Fecha</th><th>Sistema</th><th>Material</th><th>Medidas</th><th>Monto</th><th>Forma de pago</th><th>Estado entrega</th><th>Notas</th></tr>';
  let totalMonto = 0;
  ganados.forEach((lead) => {
    const key = getVentaKey(lead);
    const vdata = ventasStore[key] || {} as VentaStore;
    const medidas = lead.hasMeasures ? (lead.ancho + ' x ' + lead.alto + ' cm') : '-';
    const monto = vdata.monto || 0;
    totalMonto += monto;
    html += '<tr>' +
      '<td style="font-weight:600;">' + escapeHtml(lead.nombre) + '</td>' +
      '<td>' + escapeHtml(lead.ciudad || '-') + '</td>' +
      '<td>' + escapeHtml(formatDateAR(lead.fecha) || '-') + '</td>' +
      '<td>' + escapeHtml(lead.sistema || '-') + '</td>' +
      '<td>' + escapeHtml(lead.material || '-') + '</td>' +
      '<td>' + escapeHtml(medidas) + '</td>' +
      '<td class="num">' + (monto > 0 ? monto : '-') + '</td>' +
      '<td>' + escapeHtml(vdata.formaPago || '-') + '</td>' +
      '<td>' + escapeHtml(vdata.estadoEntrega || '-') + '</td>' +
      '<td>' + escapeHtml(vdata.notas || '-') + '</td></tr>';
  });
  html += '<tr class="total-row"><td colspan="6" style="text-align:right;font-weight:700;">TOTAL</td><td class="num" style="font-weight:700;">' + totalMonto + '</td><td colspan="3"></td></tr>';
  html += '</table><br><table>';
  html += '<tr><td style="border:none;font-weight:700;font-size:13px;color:#1DA1F2;padding:8px 10px;" colspan="2">Resumen</td></tr>';
  html += '<tr><td style="font-weight:600;padding:4px 10px;">Total ventas</td><td style="padding:4px 10px;">' + ganados.length + '</td></tr>';
  html += '<tr><td style="font-weight:600;padding:4px 10px;">Facturacion total</td><td style="padding:4px 10px;" class="num">' + totalMonto + '</td></tr>';
  const ticketProm = ganados.length > 0 ? Math.round(totalMonto / ganados.length) : 0;
  html += '<tr><td style="font-weight:600;padding:4px 10px;">Ticket promedio</td><td style="padding:4px 10px;" class="num">' + ticketProm + '</td></tr>';
  html += '</table></body></html>';
  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerDownload(blob, 'ventas_quality_deco_' + dateSuffix() + '.xls');
}

export function exportStatsExcel(data: {
  leads: Lead[];
  stages: PipelineStage[];
  rangeText?: string;
}): void {
  const { leads: filteredData, stages } = data;
  const totalLeads = filteredData.length;
  const activos = filteredData.filter((l) => l.stage !== 'Cerrado Ganado' && l.stage !== 'Cerrado Perdido').length;
  const ganados = filteredData.filter((l) => l.stage === 'Cerrado Ganado').length;
  const perdidos = filteredData.filter((l) => l.stage === 'Cerrado Perdido').length;
  const tasaCierre = totalLeads > 0 ? Math.round((ganados / totalLeads) * 100) : 0;
  const presupEnviados = filteredData.filter((l) => l.stage === 'Presupuesto Enviado').length;
  const tasaPresup = totalLeads > 0 ? Math.round(((presupEnviados + ganados + perdidos) / totalLeads) * 100) : 0;

  let html = EXCEL_HEAD;
  html += '<table>';
  html += '<tr><td colspan="2" style="font-size:16px;font-weight:700;padding:12px 10px 4px;border:none;color:#1DA1F2;">Quality Deco - Reporte de Estadisticas</td></tr>';
  html += '<tr><td colspan="2" style="font-size:11px;color:#666;padding:4px 10px 12px;border:none;">' + (data.rangeText || 'Todos los datos') + '</td></tr>';
  html += '</table><br>';

  html += '<table>';
  html += '<tr><th colspan="2">Resumen General</th></tr>';
  html += '<tr><td style="font-weight:600;">Total leads</td><td>' + totalLeads + '</td></tr>';
  html += '<tr><td style="font-weight:600;">Leads activos</td><td>' + activos + '</td></tr>';
  html += '<tr><td style="font-weight:600;">Cerrados ganados</td><td>' + ganados + '</td></tr>';
  html += '<tr><td style="font-weight:600;">Cerrados perdidos</td><td>' + perdidos + '</td></tr>';
  html += '<tr><td style="font-weight:600;">Tasa de cierre</td><td>' + tasaCierre + '%</td></tr>';
  html += '<tr><td style="font-weight:600;">Presupuestados</td><td>' + tasaPresup + '%</td></tr>';
  html += '</table><br>';

  const stageCounts: Record<string, number> = {};
  stages.forEach((s) => { stageCounts[s.name] = 0; });
  filteredData.forEach((l) => { stageCounts[l.stage] = (stageCounts[l.stage] || 0) + 1; });
  html += '<table>';
  html += '<tr><th>Etapa</th><th>Cantidad</th></tr>';
  stages.forEach((s) => {
    html += '<tr><td>' + s.name + '</td><td>' + stageCounts[s.name] + '</td></tr>';
  });
  html += '</table><br>';

  const ciudadCounts: Record<string, number> = {};
  filteredData.forEach((l) => {
    let c = (l.ciudad || 'Sin ciudad').trim();
    if (!c) c = 'Sin ciudad';
    ciudadCounts[c] = (ciudadCounts[c] || 0) + 1;
  });
  const ciudadSorted = Object.keys(ciudadCounts).sort((a, b) => ciudadCounts[b] - ciudadCounts[a]);
  html += '<table>';
  html += '<tr><th>Ciudad</th><th>Cantidad</th></tr>';
  ciudadSorted.forEach((c) => {
    html += '<tr><td>' + escapeHtml(c) + '</td><td>' + ciudadCounts[c] + '</td></tr>';
  });
  html += '</table><br>';

  const matCounts: Record<string, number> = { 'Epoxi': 0, 'Inoxidable': 0, 'Sin definir': 0 };
  filteredData.forEach((l) => {
    const m = (l.material || '').toLowerCase();
    if (m.indexOf('epoxi') >= 0 || m.indexOf('chapa') >= 0) matCounts['Epoxi']++;
    else if (m.indexOf('inox') >= 0 || m.indexOf('acero') >= 0) matCounts['Inoxidable']++;
    else matCounts['Sin definir']++;
  });
  html += '<table>';
  html += '<tr><th>Material</th><th>Cantidad</th></tr>';
  html += '<tr><td>Epoxi</td><td>' + matCounts['Epoxi'] + '</td></tr>';
  html += '<tr><td>Inoxidable</td><td>' + matCounts['Inoxidable'] + '</td></tr>';
  html += '<tr><td>Sin definir</td><td>' + matCounts['Sin definir'] + '</td></tr>';
  html += '</table><br>';

  const sisCounts: Record<string, number> = { 'Guillotina': 0, 'Levadizo': 0, 'Sin definir': 0 };
  filteredData.forEach((l) => {
    const s = (l.sistema || '').toLowerCase();
    if (s.indexOf('guillotina') >= 0) sisCounts['Guillotina']++;
    else if (s.indexOf('levadizo') >= 0) sisCounts['Levadizo']++;
    else sisCounts['Sin definir']++;
  });
  html += '<table>';
  html += '<tr><th>Sistema</th><th>Cantidad</th></tr>';
  html += '<tr><td>Guillotina</td><td>' + sisCounts['Guillotina'] + '</td></tr>';
  html += '<tr><td>Levadizo</td><td>' + sisCounts['Levadizo'] + '</td></tr>';
  html += '<tr><td>Sin definir</td><td>' + sisCounts['Sin definir'] + '</td></tr>';
  html += '</table>';
  html += '</body></html>';

  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerDownload(blob, 'estadisticas_quality_deco_' + dateSuffix() + '.xls');
}
