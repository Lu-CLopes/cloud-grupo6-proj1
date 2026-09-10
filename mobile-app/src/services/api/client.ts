// Cliente HTTP genérico do app mobile.
// Todas as chamadas passam pela VM1 (Front-End Gateway), nunca direto
// pra VM2 — quem decide pra onde encaminhar é a própria VM1.

import * as SecureStore from 'expo-secure-store';

// A rede interna das VMs (intnet1, 10.20.30.0/24) não é alcançável direto
// do host/celular. O Vagrantfile encaminha a porta 3000 da VM frontend
// (gateway) para a porta 3000 da máquina física rodando o `vagrant up`.
//
// Usa o IP do Mac na LAN — funciona no simulador, no emulador e no
// celular físico (Expo Go), desde que todos estejam na mesma Wi-Fi.
// Se mudar de rede, atualize aqui (pegue o IP atual com `ipconfig getifaddr en0`).
const HOST = '192.168.68.52';
const API_BASE_URL = `http://${HOST}:3000/api`;

const TOKEN_KEY = 'crossfit_auth_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
};

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, authenticated = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (authenticated) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data && data.error) || `Erro ${response.status} ao chamar ${path}`;
    throw new Error(message);
  }

  return data as T;
}
