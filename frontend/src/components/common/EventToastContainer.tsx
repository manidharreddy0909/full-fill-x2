import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, X, Zap } from 'lucide-react';
import { useRealtimeStore, realtimeStore } from '../../store/realtimeStore';

export const EventToastContainer: React.FC = () => {
  const { toasts } = useRealtimeStore();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const isCritical = toast.severity === 'CRITICAL' || toast.severity === 'HIGH';
        const isSuccess = toast.title.includes('✓');

        return (
          <div
            key={toast.id}
            className="glass-panel"
            style={{
              pointerEvents: 'auto',
              padding: '12px 16px',
              borderRadius: '8px',
              background: isCritical
                ? 'rgba(239, 68, 68, 0.9)'
                : isSuccess
                ? 'rgba(16, 185, 129, 0.9)'
                : 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isCritical ? '#F87171' : isSuccess ? '#34D399' : '#8B5CF6'}`,
              color: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {isCritical ? (
                <ShieldAlert size={18} color="#FFFFFF" />
              ) : isSuccess ? (
                <CheckCircle2 size={18} color="#FFFFFF" />
              ) : (
                <Zap size={18} color="#A78BFA" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', marginTop: '2px', lineHeight: 1.3 }}>
                {toast.description}
              </div>
              <div className="mono" style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                {toast.timestamp}
              </div>
            </div>

            <button
              onClick={() => realtimeStore.removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '2px',
                opacity: 0.8,
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
