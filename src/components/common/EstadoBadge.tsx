interface Props {
  stage: string;
}

const STAGE_STYLES: Record<string, string> = {
  'nuevo lead': 'bg-[#e8f5fd] text-brand',
  'presupuesto enviado': 'bg-[#fef3e2] text-[#b45309]',
  'en seguimiento': 'bg-[#f3e8ff] text-[#7c3aed]',
  'cerrado ganado': 'bg-[#d1fae5] text-[#059669]',
  'cerrado perdido': 'bg-[#fee2e2] text-[#dc2626]',
};

export default function EstadoBadge({ stage }: Props) {
  const key = (stage || '').toLowerCase().trim();
  const style = STAGE_STYLES[key] ?? STAGE_STYLES['nuevo lead'];

  return (
    <span className={`inline-block py-0.5 px-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.3px] whitespace-nowrap ${style}`}>
      {stage || 'Nuevo Lead'}
    </span>
  );
}
