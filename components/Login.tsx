import React, { useState } from 'react';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [licenseId, setLicenseId] = useState('');
    const [securityToken, setSecurityToken] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (licenseId.trim() === '' || securityToken.trim() === '') {
            setError('Invalid medical credentials.');
            return;
        }
        setError('');
        // Simulate successful login for any non-empty credentials
        onLoginSuccess();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 login-bg relative overflow-hidden">
            <div className="dark-glass-panel max-w-md w-full rounded-[3rem] p-8 md:p-12 text-center relative z-10 animate-fade-in">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-purple-400 text-3xl mb-4 shadow-inner">
                        <i className="fas fa-dna"></i>
                    </div>
                    <h1 className="text-3xl font-black text-slate-100 tracking-tight">GenoFlow <span className="text-purple-500">Pro</span></h1>
                    <p className="text-purple-400 text-xs font-bold tracking-widest uppercase opacity-80">Clinical Pedigree Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div>
                        <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 ml-1">Medical License ID</label>
                        <div className="relative">
                            <i className="fas fa-user-md absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                            <input
                                id="login-license"
                                type="text"
                                placeholder="MD-99821-XP"
                                required
                                value={licenseId}
                                onChange={(e) => setLicenseId(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 ml-1">Security Token</label>
                        <div className="relative">
                            <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                            <input
                                id="login-token"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={securityToken}
                                onChange={(e) => setSecurityToken(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-[10px] font-bold uppercase text-center py-2 animate-pulse">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-gradient-to-br from-purple-600 to-purple-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:brightness-110">
                        <span>Authorize Portal</span>
                        <i className="fas fa-arrow-right text-sm"></i>
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <span>HIPAA COMPLIANT</span>
                    <span>v3.0.1</span>
                </div>
            </div>
        </div>
    );
};

export default Login;