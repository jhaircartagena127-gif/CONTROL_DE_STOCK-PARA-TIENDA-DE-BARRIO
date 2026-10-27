import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Minus, 
  PlusCircle, 
  RefreshCw, 
  Barcode, 
  Flashlight, 
  Search,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Producto } from '../types/inventory.ts';
import { ClippyAvatar } from './ClippyAvatar.tsx';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  onUpdateStock: (id: string, cambio: number) => void;
  onRegisterNewProductWithBarcode: (barcode: string) => void;
  onOpenEditProduct: (producto: Producto) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  productos,
  onUpdateStock,
  onRegisterNewProductWithBarcode,
  onOpenEditProduct
}) => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Producto | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Reproducir sonido beep agradable al escanear
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      // Ignorar si el navegador bloquea audio
    }
  };

  const processBarcode = (code: string) => {
    playBeep();
    setScannedCode(code);

    // Buscar si el producto ya existe en la tienda (por SKU o coincidencia de código)
    const found = productos.find(p => 
      p.sku.toLowerCase().trim() === code.toLowerCase().trim()
    );

    if (found) {
      setMatchedProduct(found);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else {
      setMatchedProduct(null);
    }
  };

  // Iniciar scanner al abrir modal
  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
      setScannedCode(null);
      setMatchedProduct(null);
      setCameraError(null);
      setIsScanning(false);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        setIsScanning(true);

        const html5QrCode = new Html5Qrcode('barcode-video-container', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          verbose: false
        });

        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode },
          {
            fps: 15,
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.33
          },
          (decodedText) => {
            if (isMounted) {
              processBarcode(decodedText);
            }
          },
          () => {
            // Ignorar errores de frame mientras busca
          }
        );
      } catch (err: any) {
        console.warn('Error al iniciar cámara:', err);
        if (isMounted) {
          setCameraError(
            err.message || 'No se pudo acceder a la cámara. Revisa los permisos de tu navegador o prueba ingresando el código manualmente.'
          );
          setIsScanning(false);
        }
      }
    };

    // Pequeño timeout para asegurar que el div exista en el DOM
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
    };
  }, [isOpen, facingMode]);

  const handleToggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processBarcode(manualCode.trim());
    setManualCode('');
  };

  const handleScanAnother = () => {
    setScannedCode(null);
    setMatchedProduct(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        
        {/* Cabecera amigable */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                Escáner de Código de Barras
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Apunta la cámara al empaque (EAN / UPC / QR)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del escáner */}
        <div className="p-5 space-y-4">
          
          {/* Si ya se escaneó un código */}
          {scannedCode ? (
            <div className="space-y-4 animate-fade-in">
              {matchedProduct ? (
                /* Producto Encontrado */
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block">
                          ¡Producto Registrado Encontrado!
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                          {matchedProduct.nombre}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-emerald-200 text-xs text-center">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Stock Actual</span>
                      <span className="text-lg font-black text-slate-900">
                        {matchedProduct.stock_actual} {matchedProduct.unidad_medida}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Precio Venta</span>
                      <span className="text-base font-black text-emerald-700">
                        Bs. {matchedProduct.precio_venta.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Costo</span>
                      <span className="text-base font-bold text-slate-700">
                        Bs. {matchedProduct.precio_compra.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                    <Barcode className="w-4 h-4 text-slate-400" />
                    Código: <strong>{scannedCode}</strong>
                  </p>

                  {/* Acciones Rápidas con Botones Grandes */}
                  <div className="pt-2 border-t border-emerald-200 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onUpdateStock(matchedProduct.id, 1);
                        setMatchedProduct({ ...matchedProduct, stock_actual: matchedProduct.stock_actual + 1 });
                      }}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Sumar +1 Stock</span>
                    </button>

                    <button
                      onClick={() => {
                        onUpdateStock(matchedProduct.id, -1);
                        setMatchedProduct({ ...matchedProduct, stock_actual: Math.max(0, matchedProduct.stock_actual - 1) });
                      }}
                      disabled={matchedProduct.stock_actual <= 0}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition active:scale-95 disabled:opacity-40"
                    >
                      <Minus className="w-5 h-5" />
                      <span>Restar 1 (Venta)</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenEditProduct(matchedProduct);
                      }}
                      className="text-xs font-bold text-emerald-800 hover:underline"
                    >
                      Editar todos los datos del producto →
                    </button>

                    <button
                      onClick={handleScanAnother}
                      className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-extrabold text-slate-800 hover:bg-emerald-100 transition"
                    >
                      Escanear otro
                    </button>
                  </div>
                </div>
              ) : (
                /* Código NO registrado en tienda -> Ofrecer registrarlo al instante */
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                      <Barcode className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full inline-block">
                        Código Escaneado con Éxito
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">
                        Código: <span className="font-mono text-amber-900">{scannedCode}</span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Este código no pertenece a ningún producto de tu tienda todavía. ¿Deseas registrarlo ahora?
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center gap-3">
                    <ClippyAvatar size="sm" state="celebrating" />
                    <p className="text-xs text-slate-700 font-medium">
                      <strong>Clippy dice:</strong> "¡Genial! Si registras este producto, la próxima vez que lo escanees aparecerá al instante."
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => {
                        onClose();
                        onRegisterNewProductWithBarcode(scannedCode);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/30 transition active:scale-95"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>+ Registrar con este Código</span>
                    </button>

                    <button
                      onClick={handleScanAnother}
                      className="py-3 px-4 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Vista del Visor de Cámara Activo */
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-300 aspect-[4/3] flex items-center justify-center">
                
                {/* Contenedor del video HTML5 QR Code */}
                <div id="barcode-video-container" className="w-full h-full object-cover" />

                {/* Línea Láser Animada de Escaneo */}
                {isScanning && !cameraError && (
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-rose-600/80 px-2 py-0.5 rounded-full shadow -translate-y-4">
                      Alinea el código de barras aquí
                    </span>
                  </div>
                )}

                {/* Si hubo error al abrir cámara */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                    <h5 className="font-bold text-sm">Cámara no disponible</h5>
                    <p className="text-xs text-slate-300 mt-1 max-w-xs">{cameraError}</p>
                    <p className="text-xs text-emerald-400 font-bold mt-3">
                      💡 No te preocupes, puedes escribir o pegar el código abajo:
                    </p>
                  </div>
                )}
              </div>

              {/* Botón para cambiar de cámara (trasera / delantera) */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Cámara activa ({facingMode === 'environment' ? 'Trasera / Principal' : 'Frontal'})
                </span>

                <button
                  onClick={handleToggleCamera}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Girar Cámara</span>
                </button>
              </div>

              {/* Opción de ingreso manual o con lector USB/pistola */}
              <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ¿O prefieres escribir el código manualmente o usar pistola lectora?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Ej: 7750123456789..."
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-emerald-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95"
                  >
                    Buscar
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* Pie */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Compatible con códigos EAN-13, EAN-8, UPC y QR.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
