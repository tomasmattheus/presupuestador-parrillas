import type { SheetAction } from '../types';
import { APPS_SCRIPT_URL } from '../config/api';

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
