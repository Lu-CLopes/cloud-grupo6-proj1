// Cliente HTTP genérico do app mobile.
// Todas as chamadas passam pela VM1 (Front-End Gateway), nunca direto
// pra VM2 — quem decide pra onde encaminhar é a própria VM1.

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// A rede interna das VMs (intnet1, 10.20.30.0/24) não é alcançável direto
// do host/celular. O Vagrantfile encaminha a porta 3000 da VM frontend
// (gateway) para a porta 3000 de quem rodou o `vagrant up`.
//
// O host do gateway não pode ser fixo no código: cada pessoa do grupo
// roda isso em uma rede/notebook diferente. Ele é configurável em
// Configurações > Conexão e fica salvo no dispositivo — o único
// requisito real é celular e host estarem na mesma rede local. Como
// sugestão inicial (não como valor definitivo), tentamos adivinhar via
// hostUri do Expo, que é o host que serviu o Metro pro celular — só
// funciona quando quem roda `expo start` é a mesma máquina do `vagrant up`.
const HOST_KEY = 'crossfit_api_host';

function detectHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ?? (Constants as any).expoGoConfig?.debuggerHost;
  return hostUri ? hostUri.split(':')[0] : null;
}

export function getSuggestedHost(): string {
  return detectHost() ?? '';
}

export async function getApiHost(): Promise<string> {
  const saved = await SecureStore.getItemAsync(HOST_KEY);
  return saved || getSuggestedHost();
}

export async function setApiHost(host: string): Promise<void> {
  await SecureStore.setItemAsync(HOST_KEY, host.trim());
}

async function getApiBaseUrl(): Promise<string> {
  const host = await getApiHost();
  if (!host) {
    throw new Error(
      'Endereço do servidor não configurado. Defina o IP em Configurações > Conexão.'
    );
  }
  return `http://${host}:3000/api`;
}

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

  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
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
