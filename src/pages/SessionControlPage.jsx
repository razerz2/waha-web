import { useParams, Link } from 'react-router-dom';
import { useSessionByName } from '../hooks/useSessionByName';
import QRCodeDisplay from '../components/QRCodeDisplay';

const statusLabels = {
  STOPPED: 'Parada',
  STARTING: 'Iniciando',
  SCAN_QR_CODE: 'Escaneie o QR Code',
  WORKING: 'Conectada',
  FAILED: 'Falhou',
};

const statusColors = {
  STOPPED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  STARTING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SCAN_QR_CODE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  WORKING: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const SessionControlPage = () => {
  const { sessionId } = useParams();
  const {
    session,
    me,
    qrImage,
    loading,
    error,
    actionLoading,
    startSession,
    stopSession,
    logoutSession,
    restartSession,
  } = useSessionByName(sessionId);

  const status = session?.status || 'STOPPED';
  const phoneNumber = me?.id || me?.wid || session?.me?.id || session?.user?.id || '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Voltar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Sessão: {sessionId || 'default'}</h1>
          <p className="text-gray-400 mt-1">Controle da sessão (start, stop, logout, restart)</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400 flex items-center gap-3">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-12 w-12 text-emerald-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium border ${
                    statusColors[status] || statusColors.STOPPED
                  }`}
                >
                  {statusLabels[status] || status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Número conectado</p>
                <p className="text-white font-mono">{phoneNumber}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                {(status === 'STOPPED' || status === 'FAILED') && session && (
                  <button
                    onClick={startSession}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {actionLoading ? '...' : 'Start'}
                  </button>
                )}
                {(status === 'WORKING' || status === 'STARTING') && (
                  <button
                    onClick={stopSession}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? '...' : 'Stop'}
                  </button>
                )}
                {(status === 'SCAN_QR_CODE' || status === 'WORKING' || status === 'STARTING') && (
                  <button
                    onClick={logoutSession}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? '...' : 'Logout'}
                  </button>
                )}
                {session && (
                  <button
                    onClick={restartSession}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? '...' : 'Restart'}
                  </button>
                )}
              </div>
            </div>
          </div>
          {session?.status === 'SCAN_QR_CODE' && qrImage && (
            <QRCodeDisplay qrUrl={qrImage} />
          )}
        </div>
      )}
    </div>
  );
};

export default SessionControlPage;
