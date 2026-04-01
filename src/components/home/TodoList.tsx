import { useState } from 'react';
import { useTodos } from '../../hooks/useTodos';

export default function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [input, setInput] = useState('');

  const pending = todos.filter((t) => !t.done).length;
  const countLabel = pending > 0
    ? `${pending} pendiente${pending > 1 ? 's' : ''}`
    : 'Todo listo';

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTodo(text);
    setInput('');
  };

  return (
    <div className="max-w-[420px] mx-auto mt-5 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#f0f0f0]">
        <h3 className="text-sm font-bold text-[#2a2a2a] tracking-wide">Tareas del dia</h3>
        <span className="text-[11px] text-[#999] bg-[#f5f5f5] px-2.5 py-0.5 rounded-[10px] font-semibold">
          {countLabel}
        </span>
      </div>

      <ul className="list-none p-0 max-h-[220px] overflow-y-auto">
        {todos.length === 0 && (
          <li className="py-5 text-center text-[#ccc] text-[13px]">
            Sin tareas. Agrega una abajo.
          </li>
        )}
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="group flex items-center gap-2.5 px-[18px] py-2.5 border-b border-[#f7f7f7] last:border-b-0 transition-colors hover:bg-[#fafafa]"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
              className="w-[18px] h-[18px] accent-[#1DA1F2] cursor-pointer shrink-0"
            />
            <span
              className={`flex-1 text-[13px] ${
                todo.done ? 'line-through text-[#bbb]' : 'text-[#2a2a2a]'
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-transparent border-none text-[#ddd] text-base cursor-pointer px-1 leading-none opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 px-[18px] py-2.5 border-t border-[#f0f0f0]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Agregar tarea..."
          className="flex-1 border border-[#eee] rounded-md px-3 py-2 text-[13px] font-sans outline-none text-[#2a2a2a] placeholder:text-[#ccc] focus:border-[#1DA1F2]"
        />
        <button
          onClick={handleAdd}
          className="bg-[#1DA1F2] text-white border-none rounded-md px-3.5 py-2 text-[13px] font-semibold cursor-pointer font-sans transition-colors hover:bg-[#0d8de0]"
        >
          +
        </button>
      </div>
    </div>
  );
}
