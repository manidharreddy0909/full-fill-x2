import React, { useState } from 'react';
import { Shield, Lock, Building, User, Key, CheckCircle, ArrowRight, AlertTriangle, X, Cpu, Fingerprint, Award } from 'lucide-react';
import { useAuthStore, authStore } from '../../store/authStore';

interface IdentityGatewayProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const IdentityGateway: React.FC<IdentityGatewayProps> = ({ onSuccess, onClose }) => {
  const { isLoading, error, user } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@fulfillx.io');
  const [loginPassword, setLoginPassword] = useState('admin123!');

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrgName, setRegOrgName] = useState('');

  const quickRoles = [
    { email: 'admin@fulfillx.io', pass: 'admin123!', label: 'OWNER', color: '#06b6d4', icon: '👑' },
    { email: 'security@fulfillx.io', pass: 'sec123!', label: 'CISO / SEC', color: '#8b5cf6', icon: '🛡️' },
    { email: 'risk@fulfillx.io', pass: 'risk123!', label: 'RISK OFFICER', color: '#34d399', icon: '⚡' },
    { email: 'ops@fulfillx.io', pass: 'ops123!', label: 'OPS DIRECTOR', color: '#fbbf24', icon: '📊' },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    authStore.clearError();
    const success = await authStore.login(loginEmail, loginPassword);
    if (success) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    authStore.clearError();
    const success = await authStore.register(regEmail, regDisplayName, regPassword, regOrgName);
    if (success) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-[#080d17]/98 p-6 shadow-2xl backdrop-blur-2xl font-sans text-slate-100">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Background glow & mesh */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"></div>

      {/* Header */}
      <div className="relative mb-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-950/60 shadow-inner shadow-cyan-500/20">
          <Shield className="h-6 w-6 text-cyan-400" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white font-mono uppercase">
          FULFILL-X <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">IDENTITY GATEWAY</span>
        </h2>
        <p className="mt-1 text-[11px] text-slate-400 font-mono tracking-wider">
          AUTHENTICATION & MULTI-TENANT RBAC
        </p>
      </div>

      {/* Quick Role Presets */}
      <div className="mb-5 p-3 rounded-xl bg-[#030712]/90 border border-slate-800/80 space-y-2">
        <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Identity Presets</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickRoles.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => {
                setLoginEmail(r.email);
                setLoginPassword(r.pass);
                setMode('login');
              }}
              className="px-3 py-2.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono font-bold text-left flex items-center justify-between transition-all"
            >
              <span className="text-slate-200">{r.icon} {r.label}</span>
              <span style={{ color: r.color }}>{r.email.split('@')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mb-5 flex rounded-lg border border-slate-800 bg-[#030712]/90 p-1 font-mono">
        <button
          onClick={() => { setMode('login'); authStore.clearError(); }}
          className={`flex-1 rounded-md py-2.5 text-xs font-bold tracking-wider transition-all ${
            mode === 'login'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AUTHENTICATE SESSION
        </button>
        <button
          onClick={() => { setMode('register'); authStore.clearError(); }}
          className={`flex-1 rounded-md py-2.5 text-xs font-bold tracking-wider transition-all ${
            mode === 'register'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          PROVISION TENANT
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Content */}
      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300 font-mono">Corporate Email</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-cyan-400 pointer-events-none z-10" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '14px' }}
                className="w-full h-11 rounded-lg border border-slate-800 bg-[#030712]/90 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="user@organization.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300 font-mono">Passphrase</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-cyan-400 pointer-events-none z-10" />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '14px' }}
                className="w-full h-11 rounded-lg border border-slate-800 bg-[#030712]/90 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-mono font-bold text-white shadow-lg shadow-cyan-950 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all mt-2"
          >
            {isLoading ? 'AUTHENTICATING...' : 'ESTABLISH SECURE SESSION'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5 font-mono">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Corporate Email</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-cyan-400 pointer-events-none z-10" />
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '14px' }}
                className="w-full h-11 rounded-lg border border-slate-800 bg-[#030712]/90 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="executive@neworg.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Display Name</label>
            <div className="relative flex items-center">
              <Key className="absolute left-3.5 h-4 w-4 text-cyan-400 pointer-events-none z-10" />
              <input
                type="text"
                required
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '14px' }}
                className="w-full h-11 rounded-lg border border-slate-800 bg-[#030712]/90 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="Chief Risk Officer"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Organization Name</label>
            <div className="relative flex items-center">
              <Building className="absolute left-3.5 h-4 w-4 text-cyan-400 pointer-events-none z-10" />
              <input
                type="text"
                required
                value={regOrgName}
                onChange={(e) => setRegOrgName(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '14px' }}
                className="w-full h-11 rounded-lg border border-slate-800 bg-[#030712]/90 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="Global Freight Solutions LLC"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Passphrase</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-cyan-400 pointer-events-none z-10" />
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '14px' }}
                className="w-full h-11 rounded-lg border border-slate-800 bg-[#030712]/90 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white shadow-lg shadow-cyan-950 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all mt-2"
          >
            {isLoading ? 'PROVISIONING...' : 'INITIALIZE TENANT ACCOUNT'}
            <CheckCircle className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
};
