import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3 opacity-40">{icon}</div>
      <h3 className="text-base font-bold text-[#888] mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-[#aaa]">{subtitle}</p>
      )}
    </div>
  );
}
