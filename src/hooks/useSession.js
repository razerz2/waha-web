import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiMethods } from '../services/api';

const SESSION_POLL_INTERVAL = 5000;

export const useSession = () => {
  const { api, logout } = useAuth();
  const [session, setSession] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const qrUrlRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!api) return;

    try {
      setError(null);
      const { data } = await apiMethods.getSession(api);
      setSession(data);

      // QR: só busca quando status === SCAN_QR_CODE via GET /api/default/auth/qr
      if (data?.status === 'SCAN_QR_CODE') {
        try {
          const { data: blob } = await apiMethods.getQr(api);
          if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
          qrUrlRef.current = URL.createObjectURL(blob);
          setQrImage(qrUrlRef.current);
        } catch {
          if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
          qrUrlRef.current = null;
          setQrImage(null);
        }
      } else {
        if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
        qrUrlRef.current = null;
        setQrImage(null);
      }
      return data;
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao conectar');
      setSession(null);
      if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
      qrUrlRef.current = null;
      setQrImage(null);
    } finally {
      setLoading(false);
    }
  }, [api, logout]);

  useEffect(() => {
    if (!api) {
      setLoading(false);
      return;
    }

    fetchSession();

    const interval = setInterval(fetchSession, SESSION_POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
      qrUrlRef.current = null;
    };
  }, [api, fetchSession]);

  const startSession = async () => {
    if (!api) return;
    setActionLoading(true);
    try {
      await apiMethods.startSession(api);
      await fetchSession();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao iniciar');
    } finally {
      setActionLoading(false);
    }
  };

  const logoutSession = async () => {
    if (!api) return;
    setActionLoading(true);
    try {
      await apiMethods.logoutSession(api);
      await fetchSession();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao desconectar');
    } finally {
      setActionLoading(false);
    }
  };

  const createSession = async () => {
    if (!api) return;
    setActionLoading(true);
    try {
      await apiMethods.createSession(api);
      await fetchSession();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro ao criar sessão');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    session,
    qrImage,
    loading,
    error,
    actionLoading,
    fetchSession,
    startSession,
    logoutSession,
    createSession,
  };
};
