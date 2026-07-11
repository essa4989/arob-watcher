const TOKEN_KEY = 'aroob_session_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getDeviceName(): string {
  let device = localStorage.getItem('aroob_device_name');
  if (!device) {
    device = `جهاز-${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem('aroob_device_name', device);
  }
  return device;
}
export function setDeviceName(name: string) {
  localStorage.setItem('aroob_device_name', name);
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * The single entry point that talks to the backend. Every domain service in this
 * folder is a thin wrapper around this client — swapping the backend later means
 * touching this file and the services below, never the components.
 */
export async function apiCall<T = Record<string, unknown>>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T & { ok: boolean; error?: string }> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-session-token': token } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError('استجابة غير صالحة من الخادم', res.status);
  }
  return json as T & { ok: boolean; error?: string };
}
