import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiMethods } from '../services/api';

const formatChatId = (num) => {
  const cleaned = String(num).replace(/\D/g, '');
  return cleaned ? `${cleaned}@c.us` : '';
};

const TABS = [
  { id: 'text', label: 'Texto' },
  { id: 'image', label: 'Imagem' },
  { id: 'file', label: 'Arquivo' },
  { id: 'voice', label: 'Voz' },
  { id: 'video', label: 'Vídeo' },
  { id: 'buttons', label: 'Botões' },
];

const SendMessagePage = () => {
  const { api } = useAuth();
  const [session, setSession] = useState('default');
  const [sessionsList, setSessionsList] = useState(['default']);
  const [number, setNumber] = useState('');
  const [activeTab, setActiveTab] = useState('text');

  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [fileFile, setFileFile] = useState(null);
  const [voiceFile, setVoiceFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [buttonsText, setButtonsText] = useState('');
  const [buttonsList, setButtonsList] = useState([{ id: '1', text: '' }, { id: '2', text: '' }]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!api) return;
    apiMethods
      .getSessions(api)
      .then(({ data }) => {
        const names = Array.isArray(data) ? data.map((s) => s.name || s) : [];
        if (names.length) setSessionsList(['default', ...names.filter((n) => n !== 'default')]);
      })
      .catch(() => {});
  }, [api]);

  const chatId = formatChatId(number);
  const clearFeedback = () => {
    setResult(null);
    setError('');
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!api || !chatId || !text.trim()) return;
    setLoading(true);
    clearFeedback();
    try {
      const { data } = await apiMethods.sendText(api, { session, chatId, text: text.trim() });
      setResult(data);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  const sendFormData = async (method, file, fileStateSetter) => {
    if (!api || !chatId || !file) return;
    setLoading(true);
    clearFeedback();
    try {
      const form = new FormData();
      form.append('session', session);
      form.append('chatId', chatId);
      form.append('file', file);
      const { data } = await method(api, form);
      setResult(data);
      fileStateSetter(null);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  const handleSendImage = (e) => {
    e.preventDefault();
    sendFormData(apiMethods.sendImage, imageFile, setImageFile);
  };

  const handleSendFile = (e) => {
    e.preventDefault();
    sendFormData(apiMethods.sendFile, fileFile, setFileFile);
  };

  const handleSendVoice = (e) => {
    e.preventDefault();
    sendFormData(apiMethods.sendVoice, voiceFile, setVoiceFile);
  };

  const handleSendVideo = (e) => {
    e.preventDefault();
    sendFormData(apiMethods.sendVideo, videoFile, setVideoFile);
  };

  const handleSendButtons = async (e) => {
    e.preventDefault();
    const list = buttonsList.filter((b) => b.text.trim());
    if (!api || !chatId || !buttonsText.trim() || list.length === 0) return;
    setLoading(true);
    clearFeedback();
    try {
      const { data } = await apiMethods.sendButtons(api, {
        session,
        chatId,
        text: buttonsText.trim(),
        buttons: list,
      });
      setResult(data);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  const addButton = () => {
    setButtonsList((prev) => [...prev, { id: String(prev.length + 1), text: '' }]);
  };

  const updateButton = (index, field, value) => {
    setButtonsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Enviar</h1>
        <p className="text-gray-400 mt-1">Texto, mídia e botões (sessão e chatId)</p>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sessão</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {sessionsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="send-number" className="block text-sm font-medium text-gray-300 mb-2">
            ChatId / Número (ex: 5511999999999)
          </label>
          <input
            id="send-number"
            type="text"
            value={number}
            onChange={(e) => {
              setNumber(e.target.value);
              clearFeedback();
            }}
            placeholder="5511999999999"
            className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={loading}
          />
        </div>
      </div>

      <div className="border-b border-dark-600">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-dark-700 text-white border border-dark-600 border-b-0 -mb-px'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      {result && (
        <div className="p-4 bg-dark-700 rounded-lg border border-dark-500">
          <p className="text-sm text-gray-400 mb-2">Resposta:</p>
          <pre className="text-sm text-emerald-400 overflow-x-auto whitespace-pre-wrap break-words font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {activeTab === 'text' && (
        <form onSubmit={handleSendText} className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-300">Mensagem</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Digite o texto..."
            className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !chatId || !text.trim()}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Enviando...' : 'Enviar texto'}
          </button>
        </form>
      )}

      {activeTab === 'image' && (
        <form onSubmit={handleSendImage} className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-300">Imagem</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-600 file:text-white"
          />
          <button
            type="submit"
            disabled={loading || !chatId || !imageFile}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar imagem'}
          </button>
        </form>
      )}

      {activeTab === 'file' && (
        <form onSubmit={handleSendFile} className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-300">Arquivo</label>
          <input
            type="file"
            onChange={(e) => setFileFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-600 file:text-white"
          />
          <button
            type="submit"
            disabled={loading || !chatId || !fileFile}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar arquivo'}
          </button>
        </form>
      )}

      {activeTab === 'voice' && (
        <form onSubmit={handleSendVoice} className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-300">Áudio (voz)</label>
          <input
            type="file"
            accept="audio/*,.ogg,.mp3"
            onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-600 file:text-white"
          />
          <button
            type="submit"
            disabled={loading || !chatId || !voiceFile}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar voz'}
          </button>
        </form>
      )}

      {activeTab === 'video' && (
        <form onSubmit={handleSendVideo} className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-300">Vídeo</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-600 file:text-white"
          />
          <button
            type="submit"
            disabled={loading || !chatId || !videoFile}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar vídeo'}
          </button>
        </form>
      )}

      {activeTab === 'buttons' && (
        <form onSubmit={handleSendButtons} className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Texto (legenda)</label>
            <input
              type="text"
              value={buttonsText}
              onChange={(e) => setButtonsText(e.target.value)}
              placeholder="Escolha uma opção"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Botões</label>
              <button
                type="button"
                onClick={addButton}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                + Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {buttonsList.map((btn, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={btn.id}
                    onChange={(e) => updateButton(i, 'id', e.target.value)}
                    placeholder="id"
                    className="w-24 px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={btn.text}
                    onChange={(e) => updateButton(i, 'text', e.target.value)}
                    placeholder="Texto do botão"
                    className="flex-1 px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !chatId || !buttonsText.trim() || !buttonsList.some((b) => b.text.trim())}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar botões'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SendMessagePage;
