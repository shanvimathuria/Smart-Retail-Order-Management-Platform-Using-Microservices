import type { SignupFormData, User } from '../types';

const USER_API_BASE_URL = (
  import.meta.env.VITE_USER_API_URL ??
  (import.meta.env.DEV ? '/api/user' : 'http://127.0.0.1:8002')
).replace(/\/$/, '');

type BackendUserRecord = {
  id: number;
  name: string;
  phone: string;
  email: string;
  created_at: string;
};

type AuthSession = {
  token: string;
  tokenType: string;
  user: User;
};

type JsonRecord = Record<string, unknown>;

const parseResponsePayload = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const readErrorMessage = (payload: unknown, fallback: string): string => {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as JsonRecord;
    const detail = record.detail;
    const message = record.message;

    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const joined = detail
        .map((item) => {
          if (item && typeof item === 'object' && 'msg' in (item as JsonRecord)) {
            return String((item as JsonRecord).msg);
          }

          return String(item);
        })
        .filter(Boolean)
        .join(', ');

      if (joined) {
        return joined;
      }
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${USER_API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error('Unable to reach the user service. Check that the backend is running and that local API proxy or CORS is configured.');
  }

  const payload = await parseResponsePayload(response);

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload as T;
};

const splitName = (name: string) => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};

const deriveUsername = (email: string, name: string) => {
  const emailPrefix = email.split('@')[0]?.trim();
  if (emailPrefix) {
    return emailPrefix;
  }

  return name.trim().toLowerCase().replace(/\s+/g, '.') || `user-${Date.now()}`;
};

const mapBackendUser = (backendUser: BackendUserRecord): User => {
  const { firstName, lastName } = splitName(backendUser.name);

  return {
    id: String(backendUser.id),
    username: deriveUsername(backendUser.email, backendUser.name),
    email: backendUser.email,
    firstName,
    lastName,
    phone: backendUser.phone,
    createdAt: backendUser.created_at,
  };
};

const extractUsersArray = (payload: unknown): BackendUserRecord[] => {
  if (Array.isArray(payload)) {
    return payload as BackendUserRecord[];
  }

  if (payload && typeof payload === 'object') {
    const maybeValue = (payload as JsonRecord).value;
    if (Array.isArray(maybeValue)) {
      return maybeValue as BackendUserRecord[];
    }
  }

  return [];
};

const extractTokenData = (payload: unknown): { token: string; tokenType: string; userPayload?: unknown } => {
  if (typeof payload === 'string' && payload.trim()) {
    return { token: payload.trim(), tokenType: 'Bearer' };
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Login succeeded but no JWT token was returned by the backend.');
  }

  const record = payload as JsonRecord;
  const nested = (record.data && typeof record.data === 'object' ? (record.data as JsonRecord) : undefined);

  const tokenCandidate = [
    record.access_token,
    record.accessToken,
    record.token,
    record.jwt,
    record.jwt_token,
    nested?.access_token,
    nested?.accessToken,
    nested?.token,
  ].find((value) => typeof value === 'string' && value.trim()) as string | undefined;

  if (!tokenCandidate) {
    throw new Error('Login succeeded but no JWT token was returned by the backend.');
  }

  const tokenTypeCandidate = [record.token_type, record.tokenType, nested?.token_type, nested?.tokenType]
    .find((value) => typeof value === 'string' && value.trim()) as string | undefined;

  return {
    token: tokenCandidate,
    tokenType: tokenTypeCandidate ?? 'Bearer',
    userPayload: record.user ?? record.user_data ?? record.profile ?? nested?.user,
  };
};

export const fetchUsers = async (): Promise<User[]> => {
  const payload = await requestJson<unknown>('/users/');
  return extractUsersArray(payload).map(mapBackendUser);
};

const findUserByEmail = async (email: string): Promise<User | null> => {
  const users = await fetchUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
};

export const registerUser = async (userData: SignupFormData): Promise<User> => {
  const name = `${userData.firstName} ${userData.lastName}`.trim();
  const payload = await requestJson<BackendUserRecord>('/users/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
    }),
  });

  return mapBackendUser(payload);
};

export const loginUser = async (email: string, password: string): Promise<AuthSession> => {
  const payload = await requestJson<unknown>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const tokenData = extractTokenData(payload);
  const user = tokenData.userPayload
    ? mapBackendUser(tokenData.userPayload as BackendUserRecord)
    : (await findUserByEmail(email)) ?? {
        id: email,
        username: deriveUsername(email, email),
        email,
        firstName: email.split('@')[0] ?? 'User',
        lastName: '',
      };

  return {
    token: tokenData.token,
    tokenType: tokenData.tokenType,
    user,
  };
};

export const getStoredAuthHeader = (): HeadersInit => {
  const rawToken = localStorage.getItem('auth_token');
  const rawTokenType = localStorage.getItem('auth_token_type');

  const token = rawToken?.trim().replace(/^"|"$/g, '');
  const normalizedTokenType = rawTokenType?.trim().replace(/^"|"$/g, '');
  const tokenType = normalizedTokenType
    ? normalizedTokenType.toLowerCase() === 'bearer'
      ? 'Bearer'
      : normalizedTokenType
    : 'Bearer';

  if (!token) {
    return {};
  }

  return {
    Authorization: `${tokenType} ${token}`,
  };
};