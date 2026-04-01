import { useState, useCallback } from 'react';
import type { LineItem } from '../../types';
import { formatPrice, parsePriceInput } from '../../lib/formatters';

interface Props {
  items: LineItem[];
  onRemove: (id: number) => void;
  onUpdateName: (id: number, name: string) => void;
  onUpdatePrice: (id: number, price: number) => void;
  onAdd: () => void;
}

function PriceCell({ item, onUpdatePrice }: { item: LineItem; onUpdatePrice: (id: number, price: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [rawValue, setRawValue] = useState('');

  const displayPrice = item.isFree ? 'Sin cargo' : (item.price > 0 ? formatPrice(item.price) : '');

  const handleFocus = useCallback(() => {
    if (item.isFree) return;
    setEditing(true);
    setRawValue(item.price > 0 ? String(item.price) : '');
  }, [item.isFree, item.price]);

  const handleBlur = useCallback(() => {
    setEditing(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawValue(val);
    onUpdatePrice(item.id, parsePriceInput(val));
  }, [item.id, onUpdatePrice]);

  return (
    <input
      type="text"
      className="w-full text-right text-[13px] py-1.5 px-2 bg-white border border-[#ddd] rounded-md font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]"
      value={editing ? rawValue : displayPrice}
      readOnly={item.isFree}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      style={item.isFree ? { color: '#4a9e5c', background: '#f0f7f1' } : undefined}
    />
  );
}

export default function LineItemsTable({ items, onRemove, onUpdateName, onUpdatePrice, onAdd }: Props) {
  return (
    <div>
      <table className="w-full mt-2 border-collapse table-fixed">
        <thead>
          <tr>
            <th className="text-[11px] text-[#999] uppercase text-left py-1 px-1.5 border-b border-[#eee]">Descripcion</th>
            <th className="text-[11px] text-[#999] uppercase text-left py-1 px-1.5 border-b border-[#eee] w-[130px]">Precio</th>
            <th className="text-[11px] text-[#999] uppercase text-left py-1 px-1.5 border-b border-[#eee] w-[30px]"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-1 px-1 align-middle">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdateName(item.id, e.target.value)}
                  className="w-full min-w-0 text-[13px] text-[#2a2a2a] py-1.5 px-2 bg-white border border-[#ddd] rounded-md font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]"
                />
              </td>
              <td className="py-1 px-1 align-middle">
                <PriceCell item={item} onUpdatePrice={onUpdatePrice} />
              </td>
              <td className="py-1 px-1 align-middle">
                {!item.isFixed && (
                  <button
                    onClick={() => onRemove(item.id)}
                    className="bg-transparent border-none text-[#e55] text-lg cursor-pointer py-0.5 px-1.5 rounded-sm leading-none hover:bg-[rgba(238,85,85,0.15)]"
                  >
                    &times;
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={onAdd}
        className="bg-brand text-white border-none py-2 px-4 rounded cursor-pointer text-[13px] font-semibold mt-2 w-full font-sans hover:bg-brand-hover transition-colors"
      >
        + Agregar producto
      </button>
    </div>
  );
}
