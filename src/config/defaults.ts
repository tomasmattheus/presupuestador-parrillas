import type { AppSettings, MessageTemplate, PipelineStage } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  empresaNombre: 'QUALITY DECO',
  empresaSubtitulo: 'Frentes de parrillas',
  empresaDireccion: 'Campbell 1505 A · Rosario · Santa Fe',
  empresaTelefono: '0341-3664952',
  empresaInstagram: '@qualitydeco.ok',
  empresaWhatsapp: '5493413664952',
  iva: 21,
  descuento: 5,
  recargo: 15,
  cuotas: 3,
  validez: '10 dias',
  saludo: '¡Hola [cliente]! Gracias por contactarte con Quality Deco 👋 En base a las medidas y preferencias que nos compartiste, te armamos este presupuesto para tu frente de parrilla. Cualquier consulta, no dudes en escribirnos 💬',
  cta: 'Te interesa avanzar? Contactanos por WhatsApp y coordinamos la visita de medicion en tu obra.',
  legal: 'Los precios expresados son en pesos argentinos y no incluyen IVA. El presupuesto tiene una validez especificada a partir de la fecha de emision. Las medidas definitivas se confirman en la visita tecnica. Los plazos de fabricacion se acuerdan al momento de la sena. Quality Deco no se responsabiliza por modificaciones en obra no comunicadas previamente. La garantia cubre defectos de fabricacion, no el desgaste por uso normal.',
  infoServicio: [
    { titulo: 'Fabricacion y entrega', items: ['Fabricacion 100% propia en nuestro taller', 'Plazo estimado: 15 a 20 dias habiles', 'Entrega e instalacion en obra'] },
    { titulo: 'El frente incluye', items: ['Frente completo segun configuracion', 'Palita y atizador de regalo', 'Instalacion profesional en obra'] },
    { titulo: 'Garantia', items: ['Garantia por defectos de fabricacion', 'Soporte post-venta permanente', 'Materiales de primera calidad'] },
    { titulo: 'Proceso', items: ['Visita tecnica para medicion', 'Confirmacion con sena del 50%', 'Fabricacion, entrega e instalacion'] },
  ],
};

export const DEFAULT_USERS: Record<string, string> = {
  admin: 'tomi',
  gaston: 'gaston',
};

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { name: 'Nuevo Lead', color: '#1DA1F2' },
  { name: 'Presupuesto Enviado', color: '#f59e0b' },
  { name: 'En Seguimiento', color: '#8b5cf6' },
  { name: 'Cerrado Ganado', color: '#10b981' },
  { name: 'Cerrado Perdido', color: '#ef4444' },
];

export const DEFAULT_MESSAGE_TEMPLATES: MessageTemplate[] = [
  { name: 'Envio de presupuesto', text: 'Hola [nombre]! Soy Gaston de Quality Deco 👋\n\nTe prepare el presupuesto para tu frente de parrilla. Te lo adjunto aca.\n\nIncluye la colocacion en obra y los accesorios de regalo (palita + atizador).\n\nCualquier duda o si queres ajustar algo del presupuesto, escribime tranquilo.' },
  { name: 'Seguimiento 2-3 dias', text: '[nombre], pudiste ver el presupuesto? Si tenes alguna duda sobre medidas, material o formas de pago te lo explico sin compromiso.\n\nTambien te puedo armar una version en otro material si queres comparar.' },
  { name: 'Seguimiento 7 dias', text: 'Hola [nombre], te escribo porque el presupuesto que te mande tiene validez de 10 dias y queria saber si estas avanzando con el proyecto.\n\nSi por ahora no es el momento, sin problema — queda el presupuesto guardado para cuando necesites.' },
];
