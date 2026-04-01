import { useState, useEffect } from 'react';
import { getUsers, saveUsers } from '../../services/settings.service';
import { pushSingleKey } from '../../services/sync.service';
import { CACHE_KEYS } from '../../lib/cache';

export default function UsersManager() {
  const [users, setUsers] = useState<Record<string, string>>({});
  const [newUser, setNewUser] = useState('');
  const [newPw, setNewPw] = useState('');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleAdd = () => {
    const name = newUser.trim().toLowerCase();
    const pw = newPw.trim();
    if (!name || !pw) return;
    if (users[name]) return;
    const next = { ...users, [name]: pw };
    saveUsers(next); pushSingleKey(CACHE_KEYS.users).catch(() => {});
    setUsers(next);
    setNewUser('');
    setNewPw('');
  };

  const handleDelete = (username: string) => {
    if (username === 'admin') return;
    const next = { ...users };
    delete next[username];
    saveUsers(next); pushSingleKey(CACHE_KEYS.users).catch(() => {});
    setUsers(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <div className="bg-white rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-bold text-[#888] uppercase tracking-wide px-2.5 py-1.5 border-b-2 border-[#eee]">
                Usuario
              </th>
              <th className="text-left text-[11px] font-bold text-[#888] uppercase tracking-wide px-2.5 py-1.5 border-b-2 border-[#eee]">
                Contrasena
              </th>
              <th className="text-left text-[11px] font-bold text-[#888] uppercase tracking-wide px-2.5 py-1.5 border-b-2 border-[#eee]">
                Rol
              </th>
              <th className="text-left text-[11px] font-bold text-[#888] uppercase tracking-wide px-2.5 py-1.5 border-b-2 border-[#eee]" />
            </tr>
          </thead>
          <tbody>
            {Object.entries(users).map(([username, password]) => (
              <tr key={username}>
                <td className="px-2.5 py-2 border-b border-[#f0f0f0] text-[#2a2a2a]">
                  {username}
                </td>
                <td className="px-2.5 py-2 border-b border-[#f0f0f0] text-[#2a2a2a]">
                  {password}
                </td>
                <td className="px-2.5 py-2 border-b border-[#f0f0f0] text-[#2a2a2a]">
                  {username === 'admin' ? 'Admin' : 'Usuario'}
                </td>
                <td className="px-2.5 py-2 border-b border-[#f0f0f0]">
                  {username !== 'admin' && (
                    <button
                      className="bg-transparent border-none text-[#ef4444] text-sm cursor-pointer hover:text-red-700"
                      onClick={() => handleDelete(username)}
                    >
                      &#10007;
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2.5 flex gap-2">
          <input
            type="text"
            className="flex-1 px-2.5 py-1.5 border border-[#ddd] rounded text-[13px] outline-none focus:border-[#1DA1F2] font-[inherit]"
            placeholder="Usuario"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
          />
          <input
            type="text"
            className="flex-1 px-2.5 py-1.5 border border-[#ddd] rounded text-[13px] outline-none focus:border-[#1DA1F2] font-[inherit]"
            placeholder="Contrasena"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <button
            className="px-3.5 py-1.5 bg-[#1DA1F2] text-white border-none rounded font-semibold cursor-pointer text-[13px] hover:bg-[#0d8de0]"
            onClick={handleAdd}
          >
            + Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
