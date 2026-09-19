import {
  AuthTokens,
  AuthUser,
  LoginPayload,
  Organization,
  RegisterPayload,
  SecurityAuditItem,
} from '../types/auth';
import { getApiBaseUrl } from './config';

const getAuthApiUrl = () => `${getApiBaseUrl()}/auth`;

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  const res = await fetch(`${getAuthApiUrl()}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Authentication failed');
  }
  const body = await res.json();
  return body.data;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthTokens> {
  const res = await fetch(`${getAuthApiUrl()}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Registration failed');
  }
  const body = await res.json();
  return body.data;
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const res = await fetch(`${getAuthApiUrl()}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Fetch profile failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function refreshAuthToken(refreshToken: string): Promise<AuthTokens> {
  const res = await fetch(`${getAuthApiUrl()}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function logoutUser(token: string): Promise<boolean> {
  const res = await fetch(`${getAuthApiUrl()}/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok;
}

export async function fetchUsers(token?: string): Promise<AuthUser[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${getAuthApiUrl()}/users`, { headers });
  if (!res.ok) throw new Error(`Fetch users failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function fetchCurrentOrganization(token?: string): Promise<Organization> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${getAuthApiUrl()}/organizations/current`, { headers });
  if (!res.ok) throw new Error(`Fetch organization failed: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}
