const QRCodeDisplay = ({ qrUrl }) => {
  if (!qrUrl) return null;

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Escaneie o QR Code</h3>
      <p className="text-gray-400 text-sm mb-4">
        Abra o WhatsApp no seu celular e escaneie o código abaixo para conectar.
      </p>
      <div className="flex justify-center p-4 bg-white rounded-lg inline-block">
        <img
          src={qrUrl}
          alt="QR Code WhatsApp"
          className="w-64 h-64 object-contain"
        />
      </div>
      <p className="text-gray-500 text-xs mt-4 text-center">
        Atualização automática a cada 5 segundos
      </p>
    </div>
  );
};

export default QRCodeDisplay;
