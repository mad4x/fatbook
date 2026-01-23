'use client';

import { useEffect, useState } from 'react';
import { getBaseUrl } from '@/lib/api-url';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${getBaseUrl()}/users`, { cache: 'no-store' });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Utenti Registrati</h3>
                <button
                    onClick={fetchUsers}
                    className="text-sm bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md shadow-sm transition-all flex items-center gap-2"
                >
                    <span className={loading ? 'animate-spin' : ''}>🔄</span> Aggiorna
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-3 font-semibold">Nome</th>
                        <th className="px-6 py-3 font-semibold">Email</th>
                        <th className="px-6 py-3 font-semibold">Password (Hash)</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {users.map((user: {id: number, nome: string, email: string, password: string}) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-slate-900 font-medium">{user.nome}</td>
                            <td className="px-6 py-4 text-slate-600">{user.email}</td>
                            <td className="px-6 py-4 text-slate-400 font-mono text-sm">••••••••</td>
                        </tr>
                    ))}
                    {users.length === 0 && !loading && (
                        <tr>
                            <td colSpan={3} className="px-6 py-10 text-center text-slate-400">Nessun utente presente</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}