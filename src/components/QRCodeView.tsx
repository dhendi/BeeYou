import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 200,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;

    // Generate pairing URL so phone cameras can directly open BeeYou with code
    const pairingUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(value)}&caregiver=true`
      : `https://beeyou.app/?code=${encodeURIComponent(value)}&caregiver=true`;

    QRCode.toDataURL(pairingUrl, {
      width: size * 2,
      margin: 1.5,
      color: {
        dark: '#1E293B', // slate-800
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setDataUrl(url))
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`flex items-center justify-center bg-slate-100 rounded-2xl animate-pulse ${className}`}
      >
        <span className="text-xs text-slate-400 font-bold">Generating QR...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <img
        src={dataUrl}
        alt={`QR code for pairing ${value}`}
        style={{ width: size, height: size }}
        className="rounded-2xl border-2 border-amber-300 shadow-sm bg-white p-2 object-contain"
      />
    </div>
  );
};
