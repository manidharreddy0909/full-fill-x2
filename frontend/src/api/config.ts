/**
 * Dynamic API and WebSocket Base URL resolver for Development, Docker, and Cloud Production.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && window.location.port !== '5173') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const getWsBaseUrl = (): string => {
  const envWs = (import.meta as any).env?.VITE_WS_URL;
  if (envWs) {
    return envWs;
  }
  if (typeof window !== 'undefined' && window.location.port !== '5173') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  return 'ws://localhost:8000/ws';
};
