import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiMethods } from '../services/api';

const ProfilePage = () => {
  const { api } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [pictureFile, setPictureFile] = useState(null);

  useEffect(() => {
    if (!api) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setError('');
        const { data } = await apiMethods.getProfile(api);
        setProfile(data);
        setEditName(data?.name ?? data?.pushname ?? '');
        setEditStatus(data?.status ?? '');
      } catch (err) {
        if (err.response?.status === 401) {
          window.location.href = '/';
          return;
        }
        setError(err.response?.data?.message || err.message || 'Erro ao carregar perfil');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [api]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!api || actionLoading) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiMethods.updateProfileName(api, editName);
      setSuccess('Nome atualizado.');
      const { data } = await apiMethods.getProfile(api);
      setProfile(data);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao atualizar nome');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!api || actionLoading) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiMethods.updateProfileStatus(api, editStatus);
      setSuccess('Status atualizado.');
      const { data } = await apiMethods.getProfile(api);
      setProfile(data);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao atualizar status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadPicture = async (e) => {
    e.preventDefault();
    if (!api || !pictureFile || actionLoading) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', pictureFile);
      await apiMethods.updateProfilePicture(api, formData);
      setSuccess('Foto atualizada.');
      setPictureFile(null);
      const { data } = await apiMethods.getProfile(api);
      setProfile(data);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao enviar foto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!api || actionLoading) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiMethods.deleteProfilePicture(api);
      setSuccess('Foto removida.');
      const { data } = await apiMethods.getProfile(api);
      setProfile(data);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao remover foto');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-12 w-12 text-emerald-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Perfil</h1>
        <p className="text-gray-400 mt-1">Nome, status e foto do perfil (sessão default)</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">
          {success}
        </div>
      )}

      <div className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-6">
        {profile?.pictureUrl && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Foto atual</p>
            <img
              src={profile.pictureUrl}
              alt="Perfil"
              className="w-24 h-24 rounded-full object-cover border-2 border-dark-500"
            />
          </div>
        )}

        <form onSubmit={handleSaveName} className="space-y-2">
          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-300">
            Nome
          </label>
          <div className="flex gap-2">
            <input
              id="profile-name"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={actionLoading}
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>

        <form onSubmit={handleSaveStatus} className="space-y-2">
          <label htmlFor="profile-status" className="block text-sm font-medium text-gray-300">
            Status
          </label>
          <div className="flex gap-2">
            <input
              id="profile-status"
              type="text"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              placeholder="Status"
              className="flex-1 px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={actionLoading}
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-dark-600 space-y-4">
          <p className="text-sm font-medium text-gray-300">Foto de perfil</p>
          <form onSubmit={handleUploadPicture} className="flex flex-wrap items-end gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPictureFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-600 file:text-white"
            />
            <button
              type="submit"
              disabled={!pictureFile || actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              Enviar foto
            </button>
          </form>
          <button
            type="button"
            onClick={handleDeletePicture}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Remover foto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
