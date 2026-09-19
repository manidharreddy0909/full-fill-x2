import React, { useState } from 'react';
import { Shield, Lock, Building, User, Key, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
      {/* Background glow & mesh */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"></div>

      {/* Header */}
      <div className="relative mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-950/50 shadow-inner shadow-cyan-500/20">
          <Shield className="h-7 w-7 text-cyan-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          FULFILL-X <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">IDENTITY GATEWAY</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400 font-mono">
          ENTERPRISE ZERO-TRUST AUTHENTICATION & MULTI-TENANT ISOLATION
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mb-6 flex rounded-lg border border-slate-700 bg-slate-800/80 p-1">
        <button
          onClick={() => { setMode('login'); authStore.clearError(); }}
          className={`flex-1 rounded-md py-2 text-xs font-semibold tracking-wider transition-all ${
            mode === 'login'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AUTHENTICATE SESSION
        </button>
        <button
          onClick={() => { setMode('register'); authStore.clearError(); }}
          className={`flex-1 rounded-md py-2 text-xs font-semibold tracking-wider transition-all ${
            mode === 'register'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          PROVISION TENANT & USER
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
            <label className="mb-1 block text-xs font-medium text-slate-300">Corporate Email</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="user@organization.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Passphrase</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
              <span>SECURITY SCOPE</span>
              <span className="text-cyan-400 font-semibold">PBKDF2 + JWT HMAC-256</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tenant context resolution and sliding window rate limiting active.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-950 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'AUTHENTICATING...' : 'ESTABLISH SECURE SESSION'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Corporate Email</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="executive@neworg.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Display Name</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="Chief Risk Officer"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Organization Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={regOrgName}
                onChange={(e) => setRegOrgName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="Global Freight Solutions LLC"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Passphrase</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-950 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'PROVISIONING...' : 'INITIALIZE TENANT & OWNER ACCOUNT'}
            <CheckCircle className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* Footer Info */}
      <div className="mt-5 border-t border-slate-800 pt-3 text-center">
        <p className="text-[10px] text-slate-500 font-mono">
          DEFAULT TIER A LOCAL PROVIDER · OPTIONAL COGNITO ADAPTER COMPATIBLE
        </p>
      </div>
    </div>
  );
};
