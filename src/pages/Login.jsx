import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testConnection } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [host, setHost] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanHost = host.trim();
    const cleanKey = apiKey.trim();

    if (!cleanHost) {
      setError('Informe o Host da API');
      return;
    }

    if (!cleanKey) {
      setError('Informe a API Key');
      return;
    }

    try {
      const url = new URL(cleanHost);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        setError('Host inválido. Use apenas http:// ou https://');
        return;
      }
    } catch {
      setError('Host inválido. Use uma URL completa começando com http:// ou https://');
      return;
    }

    const formattedHost = cleanHost.replace(/\/$/, '');

    setLoading(true);

    try {
      await testConnection(formattedHost, cleanKey);
      login(formattedHost, cleanKey);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'INVALID_HOST') {
        setError('Host inválido. Verifique se a URL está correta.');
      } else if (err.code === 'EMPTY_API_KEY') {
        setError('API Key não pode ser vazia.');
      } else if (err.code === 'INVALID_API_KEY' || err.response?.status === 401) {
        setError('API Key inválida. Verifique suas credenciais.');
      } else if (err.code === 'ENDPOINT_NOT_FOUND' || err.response?.status === 404) {
        setError('Endpoint /api/sessions não encontrado. Verifique o host e se a API WAHA está correta.');
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        setError('Não foi possível conectar ao host. Verifique a URL e se a API está online.');
      } else if (err.code === 'INVALID_PAYLOAD') {
        setError('A API respondeu em um formato inesperado. Confirme se é realmente uma instância WAHA.');
      } else {
        setError(err.response?.data?.message || err.message || 'Erro ao conectar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-800 rounded-xl shadow-2xl p-8 border border-dark-600">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">WAHA Panel</h1>
            <p className="text-gray-400">WhatsApp HTTP API</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-300 mb-2">
                Host da API
              </label>
              <input
                id="host"
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="https://sua-api.com"
                className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Sua API Key"
                className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Conectando...
                </>
              ) : (
                'Conectar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Conecte-se à sua instância WAHA para gerenciar sua sessão WhatsApp
        </p>
      </div>
    </div>
  );
};

export default Login;
