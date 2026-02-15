import { useSession } from '../hooks/useSession';

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

const SessionStatusCard = ({ session: sessionProp }) => {
  const {
    session: sessionData,
    actionLoading,
    startSession,
    logoutSession,
    createSession,
  } = useSession();

  const data = sessionProp || sessionData;
  const status = data?.status || 'STOPPED';
  const me = data?.me || data?.user;
  const phoneNumber = me?.id || me?.wid || '-';

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Status da Sessão</h3>

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
          {(status === 'STOPPED' || status === 'FAILED' || !data) && (
            <button
              onClick={createSession}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {actionLoading ? 'Criando...' : 'Criar Sessão'}
            </button>
          )}
          {(status === 'STOPPED' || status === 'FAILED') && data && (
            <button
              onClick={startSession}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {actionLoading ? 'Iniciando...' : 'Start Session'}
            </button>
          )}
          {(status === 'SCAN_QR_CODE' || status === 'WORKING' || status === 'STARTING') && (
            <button
              onClick={logoutSession}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Desconectando...' : 'Logout'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionStatusCard;
