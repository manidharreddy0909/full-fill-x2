import { useState, useEffect } from 'react';
import { AuthTokens, AuthUser, Organization, Permission, SystemRole } from '../types/auth';
import { loginUser, registerUser, fetchCurrentUser, fetchCurrentOrganization, logoutUser } from '../api/authApi';

export interface AuthStoreState {
  user: AuthUser | null;
  organization: Organization | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: SystemRole;
  userPermissions: Permission[];
}

const STORAGE_KEY_TOKEN = 'fulfillx_access_token';
const STORAGE_KEY_REFRESH = 'fulfillx_refresh_token';

class AuthStore {
  private state: AuthStoreState = {
    user: {
      id: 'usr-default-001',
      email: 'admin@fulfillx.io',
      display_name: 'Default Administrator',
      status: 'ACTIVE',
      primary_role: 'OWNER',
      organization_id: 'org-fulfillx-default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      permissions: [
        'world:read', 'world:mutate', 'risk:evaluate', 'signal:ingest', 'ai:reason',
        'agent:execute', 'plan:generate', 'decision:approve', 'verification:run',
        'evaluation:execute', 'data:read', 'data:ingest', 'data:export', 'data:reset',
        'system:read', 'system:admin', 'security:manage', 'audit:read'
      ],
    },
    organization: {
      id: 'org-enterprise-default',
      name: 'Autonomous Resilience Systems',
      slug: 'resilience-default',
      created_at: new Date().toISOString(),
      member_count: 12,
    },
    tokens: null,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    userRole: 'OWNER',
    userPermissions: [
      'world:read', 'world:mutate', 'risk:evaluate', 'signal:ingest', 'ai:reason',
      'agent:execute', 'plan:generate', 'decision:approve', 'verification:run',
      'evaluation:execute', 'data:read', 'data:ingest', 'data:export', 'data:reset',
      'system:read', 'system:admin', 'security:manage', 'audit:read'
    ],
  };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token) return;

    this.state.isLoading = true;
    this.notify();

    try {
      const user = await fetchCurrentUser(token);
      const org = await fetchCurrentOrganization(token).catch(() => null);

      this.state.user = user;
      this.state.organization = org || this.state.organization;
      this.state.isAuthenticated = true;
      this.state.userRole = user.primary_role;
      this.state.userPermissions = user.permissions || [];
    } catch {
      // Clear expired token on error
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_REFRESH);
    } finally {
      this.state.isLoading = false;
      this.notify();
    }
  }

  public async login(email: string, password: string): Promise<boolean> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notify();

    try {
      const tokens = await loginUser({ email, password });
      localStorage.setItem(STORAGE_KEY_TOKEN, tokens.access_token);
      localStorage.setItem(STORAGE_KEY_REFRESH, tokens.refresh_token);

      const user = await fetchCurrentUser(tokens.access_token);
      const org = await fetchCurrentOrganization(tokens.access_token).catch(() => null);

      this.state.tokens = tokens;
      this.state.user = user;
      this.state.organization = org || this.state.organization;
      this.state.isAuthenticated = true;
      this.state.userRole = user.primary_role;
      this.state.userPermissions = user.permissions || [];
      this.state.isLoading = false;
      this.notify();
      return true;
    } catch (err: any) {
      this.state.isLoading = false;
      this.state.error = err.message || 'Login failed';
      this.notify();
      return false;
    }
  }

  public async register(email: string, displayName: string, password: string, organizationName: string): Promise<boolean> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notify();

    try {
      const tokens = await registerUser({ email, display_name: displayName, password, organization_name: organizationName });
      localStorage.setItem(STORAGE_KEY_TOKEN, tokens.access_token);
      localStorage.setItem(STORAGE_KEY_REFRESH, tokens.refresh_token);

      const user = await fetchCurrentUser(tokens.access_token);
      const org = await fetchCurrentOrganization(tokens.access_token).catch(() => null);

      this.state.tokens = tokens;
      this.state.user = user;
      this.state.organization = org || this.state.organization;
      this.state.isAuthenticated = true;
      this.state.userRole = user.primary_role;
      this.state.userPermissions = user.permissions || [];
      this.state.isLoading = false;
      this.notify();
      return true;
    } catch (err: any) {
      this.state.isLoading = false;
      this.state.error = err.message || 'Registration failed';
      this.notify();
      return false;
    }
  }

  public async logout(): Promise<void> {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (token) {
      await logoutUser(token).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);

    this.state.tokens = null;
    this.state.isAuthenticated = false;
    this.state.error = null;
    this.notify();
  }

  public clearError(): void {
    this.state.error = null;
    this.notify();
  }

  public getState(): AuthStoreState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const authStore = new AuthStore();

export function useAuthStore(): AuthStoreState {
  const [state, setState] = useState<AuthStoreState>(authStore.getState());

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setState({ ...authStore.getState() });
    });
    return unsubscribe;
  }, []);

  return state;
}
