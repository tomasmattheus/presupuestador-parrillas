import type { Lead, PipelineStage, SheetAction } from '../types';
import { GVIZ_URL, APPS_SCRIPT_URL } from '../config/api';
import { mapEstadoToStage } from './mappers';

export async function fetchLeadsGviz(stages: PipelineStage[]): Promise<Lead[]> {
  try {
    const response = await fetch(GVIZ_URL);
    const text = await response.text();
    const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
    if (!jsonStr) return [];

    let data: any;
    try {
      data = JSON.parse(jsonStr[1]);
    } catch (parseError) {
      console.error('Error parsing Google Sheets JSON response:', parseError);
      return [];
    }

    const rows: any[] = data.table.rows;
    const leads: Lead[] = [];

    rows.forEach((row, idx) => {
      const cells = row.c;
      if (!cells || !cells[0] || !cells[0].v || String(cells[0].v).trim() === '') return;
      const anchoVal = (cells[5] && cells[5].v) || '';
      const altoVal = (cells[6] && cells[6].v) || '';
      const hasMeasures =
        anchoVal && anchoVal !== '--' && anchoVal !== '-' &&
        altoVal && altoVal !== '--' && altoVal !== '-' &&
        !isNaN(parseFloat(anchoVal)) && !isNaN(parseFloat(altoVal));
      const cell = (i: number) => (cells[i] && cells[i].v) ?? '';
      leads.push({
        rowIndex: idx + 2,
        nombre: String(cell(0)),
        whatsapp: String(cell(1)),
        fecha: String((cells[2] && (cells[2].v || cells[2].f)) || ''),
        ciudad: String(cell(3)),
        estado: String(cell(4)),
        ancho: anchoVal,
        alto: altoVal,
        boca: String(cell(7)),
        foto: String(cell(8)),
        sistema: String(cell(9)),
        material: String(cell(10)),
        adicionales: String(cell(11)),
        medidasPend: String(cell(12)),
        hasMeasures: !!hasMeasures,
        stage: mapEstadoToStage(String(cell(4)), stages),
      });
    });

    return leads;
  } catch (error) {
    console.error('Network error fetching leads from Google Sheets:', error);
    return [];
  }
}

export async function fetchSheet(sheetName: string): Promise<any[][]> {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?sheet=' + encodeURIComponent(sheetName));
    const data = await response.json();
    if (data.success) return data.data || [];
    return [];
  } catch (error) {
    console.error('Network error fetching sheet "' + sheetName + '":', error);
    return [];
  }
}

export async function postAction(payload: SheetAction, opaque?: boolean): Promise<void> {
  try {
    const opts: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    };
    if (opaque) {
      opts.mode = 'no-cors';
    }
    await fetch(APPS_SCRIPT_URL, opts);
  } catch (error) {
    console.error('Network error posting action to Google Sheets:', error);
    throw error;
  }
}
