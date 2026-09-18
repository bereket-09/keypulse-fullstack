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

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('keypulse_token');
    }
    return null;
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }

    return json.data;
  }

  // Auth
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: { fullName: string; email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/auth/me');
  }

  // Keys
  async getKeys(): Promise<ApiKey[]> {
    return this.request<ApiKey[]>('/api/v1/keys');
  }

  async createKey(data: {
    name: string;
    description?: string;
    environment: string;
    rateLimitPerMinute: number;
    scopes: string[];
    expiresInDays?: number | null;
  }): Promise<CreatedApiKeyResponse> {
    return this.request<CreatedApiKeyResponse>('/api/v1/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async revokeKey(id: number): Promise<ApiKey> {
    return this.request<ApiKey>(`/api/v1/keys/${id}/revoke`, {
      method: 'PATCH',
    });
  }

  async deleteKey(id: number): Promise<void> {
    return this.request<void>(`/api/v1/keys/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>('/api/v1/analytics/overview');
  }

  async getTimeSeries(days: number = 14): Promise<TimeSeriesDataPoint[]> {
    return this.request<TimeSeriesDataPoint[]>(`/api/v1/analytics/time-series?days=${days}`);
  }

  async getLogs(page: number = 0, size: number = 20): Promise<PageResult<UsageLog>> {
    return this.request<PageResult<UsageLog>>(`/api/v1/analytics/logs?page=${page}&size=${size}`);
  }

  // Gateway Simulation (Uses x-api-key directly)
  async callGatewayMock(apiKey: string): Promise<{ status: number; headers: Record<string, string>; data: unknown }> {
    const start = performance.now();
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
  }

  async callGatewayEcho(
    apiKey: string,
    message: string,
    payload: Record<string, unknown>
  ): Promise<{ status: number; headers: Record<string, string>; data: unknown }> {
    const start = performance.now();
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
  }
}

export const api = new ApiClient();
