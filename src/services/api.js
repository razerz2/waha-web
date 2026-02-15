import axios from 'axios';

const STORAGE_HOST = 'waha_host';
const STORAGE_TOKEN = 'waha_token';

export const getStoredCredentials = () => ({
  host: localStorage.getItem(STORAGE_HOST) || '',
  token: localStorage.getItem(STORAGE_TOKEN) || '',
});

export const setStoredCredentials = (host, token) => {
  localStorage.setItem(STORAGE_HOST, host);
  localStorage.setItem(STORAGE_TOKEN, token);
};

export const clearStoredCredentials = () => {
  localStorage.removeItem(STORAGE_HOST);
  localStorage.removeItem(STORAGE_TOKEN);
};

/**
 * Cria instância Axios dinâmica baseada no host e token
 */
export const createApiInstance = (host, token) => {
  const baseURL = host.replace(/\/$/, '');
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': token,
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearStoredCredentials();
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Testa conexão com a API (usado no login)
 * Agora exige 200 em /api/sessions e valida que data seja um array
 */
export const testConnection = async (host, token) => {
  const cleanHost = host.trim().replace(/\/$/, '');
  const cleanToken = token.trim();

  if (!cleanHost) {
    const error = new Error('Host não informado');
    error.code = 'INVALID_HOST';
    throw error;
  }

  if (!cleanToken) {
    const error = new Error('API Key não pode ser vazia');
    error.code = 'EMPTY_API_KEY';
    throw error;
  }

  const api = axios.create({
    baseURL: cleanHost,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': cleanToken,
    },
    timeout: 10000,
  });

  try {
    const response = await api.get('/api/sessions');

    if (response.status !== 200) {
      const error = new Error('Status inesperado da API');
      error.code = 'UNEXPECTED_STATUS';
      error.response = response;
      throw error;
    }

    if (!Array.isArray(response.data)) {
      const error = new Error('Formato de resposta inválido da API WAHA');
      error.code = 'INVALID_PAYLOAD';
      error.response = response;
      throw error;
    }

    return { ok: true, sessions: response.data };
  } catch (err) {
    if (err.response) {
      const status = err.response.status;

      if (status === 401) {
        const error = new Error('API Key inválida');
        error.code = 'INVALID_API_KEY';
        error.response = err.response;
        throw error;
      }

      if (status === 404) {
        const error = new Error('Endpoint não encontrado');
        error.code = 'ENDPOINT_NOT_FOUND';
        error.response = err.response;
        throw error;
      }

      const error = new Error('Erro HTTP ao conectar à API WAHA');
      error.code = 'HTTP_ERROR';
      error.response = err.response;
      throw error;
    }

    if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
      const error = new Error('Host inacessível ou tempo excedido');
      error.code = 'NETWORK_ERROR';
      throw error;
    }

    throw err;
  }
};

// --- Sessões ---
export const apiMethods = {
  getSessions: (api) => api.get('/api/sessions'),
  getSession: (api, sessionName = 'default') => api.get(`/api/sessions/${encodeURIComponent(sessionName)}`),
  getSessionMe: (api, sessionName = 'default') =>
    api.get(`/api/sessions/${encodeURIComponent(sessionName)}/me`),
  createSession: (api, name = 'default') => api.post('/api/sessions', { name }),
  startSession: (api, sessionName = 'default') =>
    api.post(`/api/sessions/${encodeURIComponent(sessionName)}/start`),
  stopSession: (api, sessionName = 'default') =>
    api.post(`/api/sessions/${encodeURIComponent(sessionName)}/stop`),
  logoutSession: (api, sessionName = 'default') =>
    api.post(`/api/sessions/${encodeURIComponent(sessionName)}/logout`),
  restartSession: (api, sessionName = 'default') =>
    api.post(`/api/sessions/${encodeURIComponent(sessionName)}/restart`),

  // QR (somente quando status = SCAN_QR_CODE, sessão default)
  getQr: (api) =>
    api.get('/api/default/auth/qr', {
      responseType: 'blob',
    }),

  // Perfil (default)
  getProfile: (api) => api.get('/api/default/profile'),
  updateProfileName: (api, name) => api.put('/api/default/profile/name', { name }),
  updateProfileStatus: (api, status) => api.put('/api/default/profile/status', { status }),
  updateProfilePicture: (api, formData) =>
    api.put('/api/default/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProfilePicture: (api) => api.delete('/api/default/profile/picture'),

  // Envio
  sendText: (api, { session = 'default', chatId, text }) =>
    api.post('/api/sendText', {
      session,
      chatId: chatId.includes('@') ? chatId : `${chatId}@c.us`,
      text,
    }),
  sendImage: (api, formData) => api.post('/api/sendImage', formData),
  sendFile: (api, formData) => api.post('/api/sendFile', formData),
  sendVoice: (api, formData) => api.post('/api/sendVoice', formData),
  sendVideo: (api, formData) => api.post('/api/sendVideo', formData),
  sendButtons: (api, { session = 'default', chatId, text, buttons }) =>
    api.post('/api/sendButtons', {
      session,
      chatId: chatId.includes('@') ? chatId : `${chatId}@c.us`,
      text,
      buttons,
    }),
};
