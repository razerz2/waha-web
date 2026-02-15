import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiMethods } from '../services/api';

const SESSION_POLL_INTERVAL = 5000;

export const useSessionByName = (sessionName) => {
  const { api, logout } = useAuth();
  const [session, setSession] = useState(null);
  const [me, setMe] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const qrUrlRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const name = sessionName || 'default';
  const isDefault = name === 'default';

  const fetchSession = useCallback(async () => {
    if (!api || !name) return;

    try {
      setError(null);
      const { data } = await apiMethods.getSession(api, name);
      setSession(data);

      try {
        const { data: meData } = await apiMethods.getSessionMe(api, name);
        setMe(meData);
      } catch {
        setMe(null);
      }

      if (isDefault && data?.status === 'SCAN_QR_CODE') {
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
      setError(err.response?.data?.message || err.message || 'Erro ao carregar sessão');
      setSession(null);
      setMe(null);
      if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
      qrUrlRef.current = null;
      setQrImage(null);
    } finally {
      setLoading(false);
    }
  }, [api, name, isDefault, logout]);

  useEffect(() => {
    if (!api || !name) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchSession();

    const interval = setInterval(fetchSession, SESSION_POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
      qrUrlRef.current = null;
    };
  }, [api, name, fetchSession]);

  const runAction = async (action) => {
    if (!api) return;
    setActionLoading(true);
    try {
      await action(api, name);
      await fetchSession();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.message || 'Erro na ação');
    } finally {
      setActionLoading(false);
    }
  };

  const startSession = () => runAction(apiMethods.startSession);
  const stopSession = () => runAction(apiMethods.stopSession);
  const logoutSession = () => runAction(apiMethods.logoutSession);
  const restartSession = () => runAction(apiMethods.restartSession);

  return {
    session,
    me,
    qrImage,
    loading,
    error,
    actionLoading,
    fetchSession,
    startSession,
    stopSession,
    logoutSession,
    restartSession,
  };
};
