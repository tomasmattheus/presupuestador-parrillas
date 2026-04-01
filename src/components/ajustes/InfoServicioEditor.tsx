import type { InfoServicioCard } from '../../types';

interface InfoServicioEditorProps {
  cards: InfoServicioCard[];
  onChange: (cards: InfoServicioCard[]) => void;
}

export default function InfoServicioEditor({ cards = [], onChange }: InfoServicioEditorProps) {
  const updateCardTitle = (cardIdx: number, titulo: string) => {
    const next = cards.map((c, i) => (i === cardIdx ? { ...c, titulo } : c));
    onChange(next);
  };

  const updateItem = (cardIdx: number, itemIdx: number, value: string) => {
    const next = cards.map((c, i) => {
      if (i !== cardIdx) return c;
      const items = c.items.map((it, j) => (j === itemIdx ? value : it));
      return { ...c, items };
    });
    onChange(next);
  };

  const deleteItem = (cardIdx: number, itemIdx: number) => {
    const next = cards.map((c, i) => {
      if (i !== cardIdx) return c;
      return { ...c, items: c.items.filter((_, j) => j !== itemIdx) };
    });
    onChange(next);
  };

  const addItem = (cardIdx: number) => {
    const next = cards.map((c, i) => {
      if (i !== cardIdx) return c;
      return { ...c, items: [...c.items, ''] };
    });
    onChange(next);
  };

  const deleteCard = (cardIdx: number) => {
    onChange(cards.filter((_, i) => i !== cardIdx));
  };

  const addCard = () => {
    onChange([...cards, { titulo: 'Nueva tarjeta', items: ['Item 1'] }]);
  };

  return (
    <div className="grid grid-cols-1 gap-5 mb-6">
      <div className="bg-white rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <p className="text-xs text-[#999] mb-3">
          Edita las 4 tarjetas de informacion que aparecen en la pagina 3 del presupuesto.
        </p>

        {cards.map((card, cardIdx) => (
          <div
            key={cardIdx}
            className="bg-[#f8f9fa] border border-[#eee] rounded-lg p-3.5 mb-3"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <input
                type="text"
                className="flex-1 px-2.5 py-1.5 border border-[#ddd] rounded text-[13px] font-semibold text-[#2a2a2a] outline-none focus:border-[#1DA1F2] font-[inherit]"
                placeholder="Titulo de la tarjeta"
                value={card.titulo}
                onChange={(e) => updateCardTitle(cardIdx, e.target.value)}
              />
              <button
                className="bg-transparent border-none text-[#ef4444] text-base cursor-pointer px-1.5 py-0.5 rounded hover:bg-red-50"
                onClick={() => deleteCard(cardIdx)}
                title="Eliminar tarjeta"
              >
                &#10007;
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {card.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    className="flex-1 px-2 py-[5px] border border-[#ddd] rounded text-xs text-[#2a2a2a] outline-none focus:border-[#1DA1F2] font-[inherit]"
                    placeholder="Item..."
                    value={item}
                    onChange={(e) => updateItem(cardIdx, itemIdx, e.target.value)}
                  />
                  <button
                    className="bg-transparent border-none text-[#ccc] text-sm cursor-pointer px-1 hover:text-[#ef4444]"
                    onClick={() => deleteItem(cardIdx, itemIdx)}
                    title="Eliminar"
                  >
                    &#10007;
                  </button>
                </div>
              ))}
            </div>

            <button
              className="bg-transparent border-none text-[#1DA1F2] text-xs cursor-pointer py-1 font-semibold mt-1"
              onClick={() => addItem(cardIdx)}
            >
              + Agregar item
            </button>
          </div>
        ))}

        <button
          className="w-full mt-2 bg-transparent border border-dashed border-[#ccc] text-[#888] py-2 px-4 rounded-md cursor-pointer text-[13px] font-semibold font-[inherit] transition-all hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
          onClick={addCard}
        >
          + Agregar tarjeta
        </button>
      </div>
    </div>
  );
}
