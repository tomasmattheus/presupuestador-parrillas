const PIXEL_ID = '1349901186863960';
const ACCESS_TOKEN = 'EAA16gxEmF3wBRR16yAA6s6OqfTWZAJG2xMMdxZC4mTzvQbZCClj6479TZAUJwG8ftyBtdQaCNrStrAIhe96zXUhJs0aPkZCayX3sUlcvqjnDegxW1R617SByHhhz4ZCEoxymmQZCGabd1RPWkZBUG74wjA3RcLgjfFjKpvCetxcxSpFPxAQYtpJEdItGQ1k87eke9gZDZD';
const API_URL = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(phone: string): string {
  let num = phone.replace(/\D/g, '');
  if (!num.startsWith('54')) {
    if (num.startsWith('0')) num = '54' + num.substring(1);
    else num = '54' + num;
  }
  return num;
}

export async function sendPurchaseEvent(params: {
  phone: string;
  value?: number;
  currency?: string;
  clientName?: string;
}): Promise<void> {
  try {
    const phoneNorm = normalizePhone(params.phone);
    const hashedPhone = await sha256(phoneNorm);

    const eventData = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system_generated',
          user_data: {
            ph: [hashedPhone],
            country: [await sha256('ar')],
          },
          custom_data: {
            currency: params.currency || 'ARS',
            value: params.value || 0,
            content_name: params.clientName || '',
          },
        },
      ],
      access_token: ACCESS_TOKEN,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[CAPI] Error:', err);
    }
  } catch (error) {
    console.error('[CAPI] Network error:', error);
  }
}

export async function sendLeadEvent(phone: string): Promise<void> {
  try {
    const phoneNorm = normalizePhone(phone);
    const hashedPhone = await sha256(phoneNorm);

    const eventData = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system_generated',
          user_data: {
            ph: [hashedPhone],
            country: [await sha256('ar')],
          },
        },
      ],
      access_token: ACCESS_TOKEN,
    };

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
  } catch (error) {
    console.error('[CAPI] Network error:', error);
  }
}
