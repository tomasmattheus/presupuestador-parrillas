import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function LoginOverlay() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleLogin() {
    const success = login(username, password);
    if (!success) {
      setError(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div className="fixed inset-0 bg-surface-dark z-[10000] flex items-center justify-center">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl py-10 px-9 w-[340px] text-center">
        <div className="text-brand text-2xl font-black tracking-[2px]">
          QUALITY DECO
        </div>
        <div className="text-[#666] text-[11px] uppercase tracking-[2px] mt-1">
          Frentes de parrillas
        </div>
        <h3 className="text-[#ccc] text-sm font-normal my-6">
          Iniciar sesion
        </h3>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(false); }}
          onKeyDown={handleKeyDown}
          className="w-full py-2.5 px-3.5 bg-surface-card border border-[#444] rounded-md text-[#eee] text-sm font-sans outline-none mb-2.5 focus:border-brand"
        />
        <input
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          onKeyDown={handleKeyDown}
          className="w-full py-2.5 px-3.5 bg-surface-card border border-[#444] rounded-md text-[#eee] text-sm font-sans outline-none mb-2.5 focus:border-brand"
        />
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-brand text-white border-none rounded-md text-[15px] font-bold cursor-pointer mt-2 uppercase tracking-[1px] font-sans hover:bg-brand-hover transition-colors"
        >
          Ingresar
        </button>
        {error && (
          <div className="text-danger text-xs mt-2.5">
            Usuario o contrasena incorrectos
          </div>
        )}
      </div>
    </div>
  );
}
