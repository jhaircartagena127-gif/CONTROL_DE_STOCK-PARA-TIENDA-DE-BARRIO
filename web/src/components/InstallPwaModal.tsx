import React from 'react';
import { 
  Smartphone, 
  Laptop, 
  DownloadCloud, 
  X, 
  CheckCircle, 
  Share, 
  PlusSquare, 
  ShieldCheck, 
  WifiOff, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  onInstall: () => Promise<'accepted' | 'dismissed' | 'manual'>;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  isAndroid,
  onInstall
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const outcome = await onInstall();
    if (outcome === 'accepted') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-800 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con degradado verde esmeralda */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                App para Celular y Laptop
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                Instalar Mi Tiendita
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100">
            Úsala como una aplicación nativa en tu teléfono o computadora sin depender del navegador web.
          </p>
        </div>

        {/* Contenido deslizable */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Ya está instalada */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-base">¡Ya tienes la App instalada!</h3>
              <p className="text-xs text-slate-600">
                La aplicación ya se encuentra lista en tu dispositivo. Puedes abrirla directamente desde el icono en tu pantalla de inicio o escritorio.
              </p>
            </div>
          ) : (
            <>
              {/* Botón de instalación directa si el navegador lo soporta */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center space-y-3 shadow-sm">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-sm">
                    <DownloadCloud className="w-5 h-5 text-emerald-600 animate-bounce" />
                    <span>Instalación en 1 Clic Disponible</span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium">
                    Toca el botón de abajo para agregar "Mi Tiendita" directamente a tu pantalla de inicio o escritorio.
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    <DownloadCloud className="w-5 h-5" />
                    <span>Instalar en este Dispositivo</span>
                  </button>
                </div>
              )}

              {/* Guía para Celulares Android */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>En Celular Android (Google Chrome)</span>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                  <li>Toca los <span className="font-bold text-slate-800">tres puntos verticales (⋮)</span> en la esquina superior de Chrome.</li>
                  <li>Selecciona <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">"Instalar aplicación"</span> o <span className="font-bold text-slate-800">"Agregar a pantalla principal"</span>.</li>
                  <li>Confirma en <span className="font-bold text-slate-800">"Instalar"</span>. ¡Aparecerá el icono de Mi Tiendita junto a WhatsApp y tus demás apps!</li>
                </ol>
              </div>

              {/* Guía para iPhone / iPad (iOS Safari) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <Share className="w-4 h-4 text-amber-600" />
                  <span>En iPhone o iPad (Navegador Safari)</span>
                </div>
                <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                  <li>En la parte inferior de Safari, pulsa el botón <span className="font-bold text-slate-900">Compartir</span> (icono del cuadrado con la flecha hacia arriba <Share className="w-3.5 h-3.5 inline mx-0.5" />).</li>
                  <li>Desliza hacia abajo en las opciones y toca <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">"Agregar a inicio" <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" /></span>.</li>
                  <li>Toca <span className="font-bold text-slate-900">"Agregar"</span> en la esquina superior derecha.</li>
                </ol>
              </div>

              {/* Guía para Laptop o Computadora */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <Laptop className="w-4 h-4 text-teal-600" />
                  <span>En Laptop o PC (Chrome / Microsoft Edge)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  En la barra de direcciones arriba verás un pequeño icono de <span className="font-bold text-slate-800">pantalla con flecha</span> que dice <em>"Instalar Mi Tiendita"</em>. Al instalarla, se abrirá en su propia ventana limpia como programa de escritorio independiente.
                </p>
              </div>

              {/* Ventajas de la App */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <span className="block text-[11px] font-black text-slate-800">Ultra Rápida</span>
                  <span className="text-[10px] text-slate-500 leading-tight">Carga al instante</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <WifiOff className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-black text-slate-800">Sin Internet</span>
                  <span className="text-[10px] text-slate-500 leading-tight">Funciona offline</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-black text-slate-800">0 MB Descarga</span>
                  <span className="text-[10px] text-slate-500 leading-tight">No satura tu cel</span>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Pie de modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
