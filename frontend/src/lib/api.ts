const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface ApiKey {
  id: number;
  name: string;
  description: string;
  keyPrefix: string;
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  status: 'ACTIVE' | 'REVOKED';
  rateLimitPerMinute: number;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  isExpired: boolean;
}

export interface CreatedApiKeyResponse {
  keyDetails: ApiKey;
  rawKey: string;
  warning: string;
}

export interface AnalyticsOverview {
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  errorRequests: number;
  successRate: number;
  averageLatencyMs: number;
  activeKeysCount: number;
  totalKeysCount: number;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  total: number;
  success: number;
  rateLimited: number;
  error: number;
  avgLatencyMs: number;
}

export interface UsageLog {
  id: number;
  keyName: string;
  keyPrefix: string;
  endpoint: string;
  httpMethod: string;
  statusCode: number;
  latencyMs: number;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Fallback mock dataset for live web demos when the backend is initializing or offline
const DEMO_USER: User = {
  id: 1,
  email: 'demo@keypulse.dev',
  fullName: 'Alex Vance',
  role: 'ROLE_DEVELOPER',
  createdAt: '2026-09-18T10:00:00Z',
};

const INITIAL_DEMO_KEYS: ApiKey[] = [
  {
    id: 1,
    name: 'Production Mobile Client',
    description: 'High-throughput key for iOS & Android apps',
    keyPrefix: 'kp_live_9a7b',
    environment: 'PRODUCTION',
    status: 'ACTIVE',
    rateLimitPerMinute: 120,
    scopes: ['read', 'write', 'gateway:access'],
    expiresAt: null,
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    isExpired: false,
  },
  {
    id: 2,
    name: 'Staging Web Gateway',
    description: 'Pre-production test suite and QA pipeline',
    keyPrefix: 'kp_test_3f2e',
    environment: 'STAGING',
    status: 'ACTIVE',
    rateLimitPerMinute: 60,
    scopes: ['read', 'gateway:access'],
    expiresAt: null,
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    isExpired: false,
  },
  {
    id: 3,
    name: 'Deprecated Integration Key',
    description: 'Legacy v1 client key scheduled for decommissioning',
    keyPrefix: 'kp_dev_c1d2',
    environment: 'DEVELOPMENT',
    status: 'REVOKED',
    rateLimitPerMinute: 30,
    scopes: ['read'],
    expiresAt: null,
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    isExpired: true,
  },
];

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('keypulse_token');
    }
    return null;
  }

  private isDemoSession(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('keypulse_demo_mode') === 'true';
    }
    return false;
  }

  private setDemoSession(enabled: boolean) {
    if (typeof window !== 'undefined') {
      if (enabled) {
        localStorage.setItem('keypulse_demo_mode', 'true');
      } else {
        localStorage.removeItem('keypulse_demo_mode');
      }
    }
  }

  private getStoredDemoKeys(): ApiKey[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('keypulse_demo_keys');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
      localStorage.setItem('keypulse_demo_keys', JSON.stringify(INITIAL_DEMO_KEYS));
    }
    return INITIAL_DEMO_KEYS;
  }

  private saveStoredDemoKeys(keys: ApiKey[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('keypulse_demo_keys', JSON.stringify(keys));
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || `Request failed with status ${response.status}`);
      }

      return json.data;
    } catch (err: unknown) {
      // Re-throw if error already has specific server message
      if (err instanceof Error && !err.message.includes('fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      throw err;
    }
  }

  // Auth
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const result = await this.request<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      this.setDemoSession(false);
      return result;
    } catch (err: unknown) {
      // If server is unavailable / blocked by browser localhost CORS, allow demo credentials
      if (credentials.email.toLowerCase() === 'demo@keypulse.dev' && credentials.password === 'password123') {
        this.setDemoSession(true);
        return {
          token: 'demo_mock_jwt_token_alex_vance',
          tokenType: 'Bearer',
          user: DEMO_USER,
        };
      }
      throw err;
    }
  }

  async register(data: { fullName: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      const result = await this.request<AuthResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      this.setDemoSession(false);
      return result;
    } catch (err: unknown) {
      this.setDemoSession(true);
      const user: User = {
        id: Math.floor(Math.random() * 1000) + 10,
        email: data.email,
        fullName: data.fullName,
        role: 'ROLE_DEVELOPER',
        createdAt: new Date().toISOString(),
      };
      return {
        token: `demo_mock_jwt_token_${user.id}`,
        tokenType: 'Bearer',
        user,
      };
    }
  }

  async getCurrentUser(): Promise<User> {
    if (this.isDemoSession()) {
      return DEMO_USER;
    }
    try {
      return await this.request<User>('/api/v1/auth/me');
    } catch (err) {
      if (this.isDemoSession()) return DEMO_USER;
      throw err;
    }
  }

  // Keys
  async getKeys(): Promise<ApiKey[]> {
    if (this.isDemoSession()) {
      return this.getStoredDemoKeys();
    }
    try {
      return await this.request<ApiKey[]>('/api/v1/keys');
    } catch {
      return this.getStoredDemoKeys();
    }
  }

  async createKey(data: {
    name: string;
    description?: string;
    environment: string;
    rateLimitPerMinute: number;
    scopes: string[];
    expiresInDays?: number | null;
  }): Promise<CreatedApiKeyResponse> {
    if (!this.isDemoSession()) {
      try {
        return await this.request<CreatedApiKeyResponse>('/api/v1/keys', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        // Fall back to demo mode state
      }
    }

    const randomHex = Math.random().toString(16).substring(2, 10);
    const prefixEnv = data.environment === 'PRODUCTION' ? 'live' : data.environment === 'STAGING' ? 'test' : 'dev';
    const keyPrefix = `kp_${prefixEnv}_${randomHex}`;
    const rawKey = `${keyPrefix}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const newKey: ApiKey = {
      id: Date.now(),
      name: data.name,
      description: data.description || '',
      keyPrefix,
      environment: data.environment as 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION',
      status: 'ACTIVE',
      rateLimitPerMinute: data.rateLimitPerMinute,
      scopes: data.scopes,
      expiresAt: data.expiresInDays ? new Date(Date.now() + data.expiresInDays * 86400000).toISOString() : null,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      isExpired: false,
    };

    const keys = this.getStoredDemoKeys();
    this.saveStoredDemoKeys([newKey, ...keys]);

    return {
      keyDetails: newKey,
      rawKey,
      warning: 'Store this key in a secure location. You will not be able to view it again.',
    };
  }

  async revokeKey(id: number): Promise<ApiKey> {
    if (!this.isDemoSession()) {
      try {
        return await this.request<ApiKey>(`/api/v1/keys/${id}/revoke`, {
          method: 'PATCH',
        });
      } catch {
        // Fall back to demo mode state
      }
    }

    const keys = this.getStoredDemoKeys().map((k) =>
      k.id === id ? { ...k, status: 'REVOKED' as const } : k
    );
    this.saveStoredDemoKeys(keys);
    const updated = keys.find((k) => k.id === id);
    if (!updated) throw new Error('Key not found');
    return updated;
  }

  async deleteKey(id: number): Promise<void> {
    if (!this.isDemoSession()) {
      try {
        await this.request<void>(`/api/v1/keys/${id}`, {
          method: 'DELETE',
        });
        return;
      } catch {
        // Fall back to demo mode state
      }
    }

    const keys = this.getStoredDemoKeys().filter((k) => k.id !== id);
    this.saveStoredDemoKeys(keys);
  }

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    if (!this.isDemoSession()) {
      try {
        return await this.request<AnalyticsOverview>('/api/v1/analytics/overview');
      } catch {
        // Fall back to demo mode
      }
    }

    const keys = this.getStoredDemoKeys();
    const active = keys.filter((k) => k.status === 'ACTIVE').length;

    return {
      totalRequests: 14285,
      successfulRequests: 14056,
      rateLimitedRequests: 182,
      errorRequests: 47,
      successRate: 98.4,
      averageLatencyMs: 38.5,
      activeKeysCount: active,
      totalKeysCount: keys.length,
    };
  }

  async getTimeSeries(days: number = 14): Promise<TimeSeriesDataPoint[]> {
    if (!this.isDemoSession()) {
      try {
        return await this.request<TimeSeriesDataPoint[]>(`/api/v1/analytics/time-series?days=${days}`);
      } catch {
        // Fall back
      }
    }

    const points: TimeSeriesDataPoint[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const total = Math.floor(Math.random() * 500) + 800;
      const rateLimited = Math.floor(Math.random() * 20);
      const error = Math.floor(Math.random() * 8);
      const success = total - rateLimited - error;
      points.push({
        timestamp: d.toISOString().split('T')[0],
        total,
        success,
        rateLimited,
        error,
        avgLatencyMs: Math.floor(Math.random() * 25) + 30,
      });
    }
    return points;
  }

  async getLogs(page: number = 0, size: number = 20): Promise<PageResult<UsageLog>> {
    if (!this.isDemoSession()) {
      try {
        return await this.request<PageResult<UsageLog>>(`/api/v1/analytics/logs?page=${page}&size=${size}`);
      } catch {
        // Fall back
      }
    }

    const endpoints = ['/api/v1/gateway/mock-data', '/api/v1/gateway/echo', '/api/v1/users', '/api/v1/orders'];
    const methods = ['GET', 'POST', 'GET', 'GET'];
    const keys = this.getStoredDemoKeys();
    const logs: UsageLog[] = [];

    for (let i = 0; i < size; i++) {
      const k = keys[i % keys.length] || INITIAL_DEMO_KEYS[0];
      const isRateLimit = i === 4 || i === 11;
      const statusCode = isRateLimit ? 429 : 200;
      const latency = isRateLimit ? 4 : Math.floor(Math.random() * 60) + 20;

      logs.push({
        id: 1000 - (page * size + i),
        keyName: k.name,
        keyPrefix: k.keyPrefix,
        endpoint: endpoints[i % endpoints.length],
        httpMethod: methods[i % methods.length],
        statusCode,
        latencyMs: latency,
        ipAddress: `192.168.1.${10 + (i % 20)}`,
        userAgent: 'KeyPulse-SDK/1.2 (Node/20)',
        timestamp: new Date(Date.now() - (i * 180000 + page * 3600000)).toISOString(),
      });
    }

    return {
      content: logs,
      totalElements: 589,
      totalPages: Math.ceil(589 / size),
      size,
      number: page,
    };
  }

  // Gateway Simulation (Uses x-api-key directly)
  async callGatewayMock(apiKey: string): Promise<{ status: number; headers: Record<string, string>; data: unknown }> {
    const start = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/gateway/mock-data`, {
        headers: {
          'x-api-key': apiKey,
          Accept: 'application/json',
        },
      });
      const latency = Math.round(performance.now() - start);
      const data = await response.json();

      const headers: Record<string, string> = {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit') || 'N/A',
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining') || 'N/A',
        'retry-after': response.headers.get('retry-after') || '0',
        'latency-ms': `${latency}ms`,
      };

      return {
        status: response.status,
        headers,
        data,
      };
    } catch {
      // Simulated gateway response if backend is offline
      const latency = Math.round(performance.now() - start) + 18;
      const isValid = apiKey && apiKey.startsWith('kp_');
      const isRevoked = apiKey.includes('dev_c1d2');

      if (!isValid) {
        return {
          status: 401,
          headers: { 'x-ratelimit-limit': 'N/A', 'x-ratelimit-remaining': 'N/A', 'latency-ms': `${latency}ms` },
          data: { success: false, message: 'Invalid or missing API Key. Header x-api-key required.' },
        };
      }

      if (isRevoked) {
        return {
          status: 403,
          headers: { 'x-ratelimit-limit': 'N/A', 'x-ratelimit-remaining': 'N/A', 'latency-ms': `${latency}ms` },
          data: { success: false, message: 'API Key has been revoked. Access denied.' },
        };
      }

      return {
        status: 200,
        headers: {
          'x-ratelimit-limit': '120',
          'x-ratelimit-remaining': '119',
          'retry-after': '0',
          'latency-ms': `${latency}ms`,
        },
        data: {
          success: true,
          message: 'Gateway request verified and authorized',
          data: {
            status: 'SUCCESS',
            authenticatedKey: apiKey.substring(0, 11),
            environment: apiKey.includes('live') ? 'PRODUCTION' : 'STAGING',
            timestamp: new Date().toISOString(),
            data: {
              serverStatus: 'OPERATIONAL',
              uptimeSeconds: 142857,
              version: 'v1.4.2',
              activeNodes: 8,
              currentLoad: '23.4%',
              scopesGranted: ['read', 'write', 'gateway:access'],
            },
          },
        },
      };
    }
  }

  async callGatewayEcho(
    apiKey: string,
    message: string,
    payload: Record<string, unknown>
  ): Promise<{ status: number; headers: Record<string, string>; data: unknown }> {
    const start = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/gateway/echo`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message, payload }),
      });
      const latency = Math.round(performance.now() - start);
      const data = await response.json();

      const headers: Record<string, string> = {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit') || 'N/A',
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining') || 'N/A',
        'retry-after': response.headers.get('retry-after') || '0',
        'latency-ms': `${latency}ms`,
      };

      return {
        status: response.status,
        headers,
        data,
      };
    } catch {
      const latency = Math.round(performance.now() - start) + 24;
      const isValid = apiKey && apiKey.startsWith('kp_');

      if (!isValid) {
        return {
          status: 401,
          headers: { 'x-ratelimit-limit': 'N/A', 'x-ratelimit-remaining': 'N/A', 'latency-ms': `${latency}ms` },
          data: { success: false, message: 'Invalid API Key supplied' },
        };
      }

      return {
        status: 200,
        headers: {
          'x-ratelimit-limit': '120',
          'x-ratelimit-remaining': '118',
          'retry-after': '0',
          'latency-ms': `${latency}ms`,
        },
        data: {
          success: true,
          message: 'Payload processed successfully',
          data: {
            status: 'SUCCESS',
            authenticatedKey: apiKey.substring(0, 11),
            environment: apiKey.includes('live') ? 'PRODUCTION' : 'STAGING',
            timestamp: new Date().toISOString(),
            data: {
              echoedMessage: message || 'No message supplied',
              payloadReceived: payload,
            },
          },
        },
      };
    }
  }
}

export const api = new ApiClient();
