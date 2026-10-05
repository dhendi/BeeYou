import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  FlipHorizontal, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Flashlight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import jsQR from 'jsqr';
import { playChime } from '../utils/audio';

interface CameraQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedCode: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraQRScannerModal: React.FC<CameraQRScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan QR Code with Camera',
  subtitle = 'Point your camera at the BeeYou pairing QR code on the other device.'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Parse pairing code from URL or raw text
  const extractCode = (rawText: string): string => {
    const trimmed = rawText.trim();
    try {
      if (trimmed.includes('code=')) {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://beeyou.app/${trimmed.startsWith('?') ? '' : '?'}${trimmed}`);
        const code = url.searchParams.get('code');
        if (code) return code.trim().toUpperCase();
      }
    } catch {}
    return trimmed.toUpperCase();
  };

  const stopCameraStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchEnabled(false);
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCameraStream();
    setCameraState('starting');
    setErrorMessage(null);
    setScannedResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setErrorMessage('Camera access is not supported in this browser. Please enter the pairing code manually or upload a photo of the QR code.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
      }

      // Check torch / flashlight support
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setHasTorchSupport(Boolean(capabilities.torch));
      }

      setCameraState('active');
      startScanningLoop();
    } catch (err: any) {
      console.warn('Camera start error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Camera permission was blocked. Please enable camera access in your device/browser settings, or enter the code manually.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('unsupported');
        setErrorMessage('No working camera was detected on this device.');
      } else {
        setCameraState('denied');
        setErrorMessage(`Unable to open camera (${err.message || 'Unknown error'}). You can upload a photo of the QR code or enter the code manually.`);
      }
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorchSupport) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchEnabled;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchEnabled(nextState);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const startScanningLoop = () => {
    const scanFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const parsed = extractCode(code.data);
            if (parsed) {
              setScannedResult(parsed);
              playChime('complete');
              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }
              stopCameraStream();
              setTimeout(() => {
                onScan(parsed);
                onClose();
              }, 600);
              return;
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            const parsed = extractCode(code.data);
            setScannedResult(parsed);
            playChime('complete');
            setTimeout(() => {
              onScan(parsed);
              onClose();
            }, 600);
          } else {
            setErrorMessage('No valid QR code found in the uploaded image. Please try another image or enter the code.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-400/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-400 font-medium line-clamp-1">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close camera scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder Area */}
        <div className="relative bg-black aspect-square max-h-[380px] w-full flex items-center justify-center overflow-hidden">
          
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Target Frame Overlay */}
          {cameraState === 'active' && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="relative w-64 h-64 border-2 border-amber-400/70 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-2xl" />

                {/* Animated Laser Scanning Line */}
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_10px_#f59e0b] animate-bounce duration-1000 top-1/2" />
              </div>
            </div>
          )}

          {/* Scanned Code Success Splash */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 mb-3 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-white">QR Code Detected!</h4>
              <p className="font-mono text-2xl font-bold tracking-widest text-emerald-300 mt-1">
                {scannedResult}
              </p>
              <span className="text-xs text-emerald-200 mt-2">Connecting now...</span>
            </div>
          )}

          {/* Starting State Spinner */}
          {cameraState === 'starting' && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 gap-3 text-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-bold text-slate-300">Starting device camera...</p>
            </div>
          )}

          {/* Permission Denied or Error Fallback */}
          {(cameraState === 'denied' || cameraState === 'unsupported') && (
            <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Camera Access Needed</h4>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-medium">
                {errorMessage || 'Unable to access camera.'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer active:scale-95 transition"
                >
                  Retry Camera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer active:scale-95 transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Camera Controls Floating Bar */}
          {cameraState === 'active' && !scannedResult && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {hasTorchSupport && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-2xl backdrop-blur-md border transition cursor-pointer ${
                    torchEnabled 
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' 
                      : 'bg-slate-900/70 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title={torchEnabled ? 'Turn Off Flash' : 'Turn On Flash'}
                >
                  <Flashlight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleFlipCamera}
                className="p-2.5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-700 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                title="Switch between front and rear cameras"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Actions & Upload Option */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Upload Image from Gallery</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs cursor-pointer transition"
          >
            Cancel / Enter Code Manually
          </button>
        </div>

      </div>
    </div>
  );
};
