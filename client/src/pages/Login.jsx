import { useState } from 'react';
import { AuthApi } from '../services/api';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk(false);
    try {
      const r = await AuthApi.login({ login, password });
      if (r?.ok) setOk(true);
    } catch (e) { setErr(e?.response?.data?.message || e?.message); }
  };
  return (
    <form onSubmit={submit} className="max-w-md mx-auto px-4 py-8 space-y-3">
      <h1 className="text-xl font-bold">Вход</h1>
      {err && <div className="text-red-400">{err}</div>}
      {ok && <div className="text-green-400">Готово!</div>}
      <input className="w-full rounded-xl bg-slate-800/60 px-4 py-2" placeholder="Email/ник" value={login} onChange={e=>setLogin(e.target.value)} />
      <input className="w-full rounded-xl bg-slate-800/60 px-4 py-2" placeholder="Пароль" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500 w-full">Войти</button>
    </form>
  );
}