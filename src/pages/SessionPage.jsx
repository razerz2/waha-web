import { useSession } from '../hooks/useSession';
import SessionStatusCard from '../components/SessionStatusCard';
import QRCodeDisplay from '../components/QRCodeDisplay';

const SessionPage = () => {
  const { session, qrImage, loading, error } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sessão</h1>
        <p className="text-gray-400 mt-1">Gerencie sua sessão WhatsApp</p>
      </div>

      {error && (
        <div className="p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400 flex items-center gap-3">
          <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
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
          <SessionStatusCard session={session} />
          {session?.status === 'SCAN_QR_CODE' && (
            <QRCodeDisplay qrUrl={qrImage} />
          )}
        </div>
      )}
    </div>
  );
};

export default SessionPage;
