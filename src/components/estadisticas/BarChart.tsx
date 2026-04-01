interface BarData {
  label: string;
  count: number;
  color?: string;
  pct?: number;
}

interface Props {
  data: BarData[];
  title: string;
  fullWidth?: boolean;
}

export default function BarChart({ data, title, fullWidth }: Props) {
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count), 1) : 1;

  return (
    <div
      className={`bg-white rounded-[10px] py-5 px-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${
        fullWidth ? 'col-span-2' : ''
      }`}
    >
      <h3 className="text-sm font-bold text-[#2a2a2a] uppercase tracking-wide mb-4 pb-2 border-b-2 border-[#eee]">
        {title}
      </h3>
      {data.length === 0 && (
        <p className="text-[#888] text-[13px]">Sin datos</p>
      )}
      {data.map((item) => {
        const pct = item.pct ?? Math.round((item.count / maxCount) * 100);
        const barWidth = Math.max(pct, 3);
        const countInside = pct >= 25;
        const color = item.color || '#1DA1F2';

        return (
          <div key={item.label} className="flex items-center gap-2.5 mb-2.5">
            <div className="w-[130px] text-[13px] text-[#666] font-semibold text-right shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </div>
            <div className="flex-1 bg-[#eee] rounded-md h-6 relative overflow-hidden">
              <div
                className="h-full rounded-md transition-[width] duration-400 ease-out flex items-center justify-end pr-2 min-w-[2px]"
                style={{ width: barWidth + '%', background: color }}
              >
                {countInside && (
                  <span className="text-xs font-bold text-white whitespace-nowrap">
                    {item.count}
                  </span>
                )}
              </div>
            </div>
            {!countInside && (
              <span className="text-xs font-bold text-[#666] whitespace-nowrap ml-2">
                {item.count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
