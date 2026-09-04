// Funcionalidades #1 e #2 — Cadastro e login de usuário.
// Também guarda o usuário logado localmente (SecureStore), pra restaurar
// a sessão quando o app é reaberto, sem precisar de um endpoint "/me".

import * as SecureStore from 'expo-secure-store';
import { apiRequest, setToken, clearToken, getToken } from './client';

export type AuthUser = { id: number; name: string; email: string };

const USER_KEY = 'crossfit_auth_user';

async function persistUser(user: AuthUser) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

async function clearPersistedUser() {
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/users', {
    method: 'POST',
    body: { name, email, password },
    authenticated: false,
  });
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const result = await apiRequest<{ token: string; user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: { email, password },
    authenticated: false,
  });

  await setToken(result.token);
  await persistUser(result.user);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await clearToken();
  await clearPersistedUser();
}

// Restaura a sessão salva (chamado uma vez, ao abrir o app)
export async function bootstrapAuth(): Promise<AuthUser | null> {
  const token = await getToken();
  if (!token) return null;

  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}
