import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE || process.env.NEXT_PUBLIC_API_BASE || '/api',
  withCredentials: true,
  timeout: 15000,
});

export const CatalogApi = {
  async list(params: Record<string, any> = {}) {
    const { data } = await api.get('/catalog', { params });
    return data;
  },
  async search(q: string, params: Record<string, any> = {}) {
    const { data } = await api.get('/catalog/search', { params: { q, ...params } });
    return data;
  },
  async title(id: string | number) {
    const { data } = await api.get(`/catalog/title/${id}`);
    return data;
  },
};

export const AuthApi = {
  async register(payload: { email: string; username: string; password: string }) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  async login(payload: { login: string; password: string }) {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },
  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};