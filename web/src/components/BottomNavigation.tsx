import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  Truck, 
  Sparkles, 
  Camera, 
  Plus,
  Layers
} from 'lucide-react';
import { ClippyAvatar } from './ClippyAvatar.tsx';

interface BottomNavigationProps {
  activeTab: 'inventario' | 'alertas' | 'proveedores' | 'asistente';
  setActiveTab: (tab: 'inventario' | 'alertas' | 'proveedores' | 'asistente') => void;
  alertCount: number;
  onOpenScanner: () => void;
  onOpenAddModal: () => void;
  onOpenPapelitoChat: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
  alertCount,
  onOpenScanner,
  onOpenAddModal,
  onOpenPapelitoChat
}) => {
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Navegación móvil"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        
        {/* Pestaña: Inventario */}
        <button
          onClick={() => setActiveTab('inventario')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 min-w-[60px] ${
            activeTab === 'inventario'
              ? 'text-emerald-700 font-extrabold bg-emerald-50'
              : 'text-slate-500 font-semibold hover:text-slate-800'
          }`}
        >
          <Package className={`w-5 h-5 mb-0.5 ${activeTab === 'inventario' ? 'text-emerald-600 scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Stock</span>
        </button>

        {/* Pestaña: Alertas */}
        <button
          onClick={() => setActiveTab('alertas')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 min-w-[60px] relative ${
            activeTab === 'alertas'
              ? 'text-amber-700 font-extrabold bg-amber-50'
              : 'text-slate-500 font-semibold hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <AlertTriangle className={`w-5 h-5 mb-0.5 ${activeTab === 'alertas' ? 'text-amber-600 scale-110' : ''}`} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-rose-600 text-[9px] font-black text-white shadow-sm ring-1 ring-white animate-pulse">
                {alertCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Alertas</span>
        </button>

        {/* Botón Central: Escáner Cámara Rápido */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            onClick={onOpenScanner}
            title="Escanear código con cámara del celular"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 ring-4 ring-white active:scale-90 transition-transform"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
          <span className="text-[10px] font-black text-emerald-800 mt-0.5">Escanear</span>
        </div>

        {/* Pestaña: Proveedores */}
        <button
          onClick={() => setActiveTab('proveedores')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 min-w-[60px] ${
            activeTab === 'proveedores'
              ? 'text-emerald-700 font-extrabold bg-emerald-50'
              : 'text-slate-500 font-semibold hover:text-slate-800'
          }`}
        >
          <Truck className={`w-5 h-5 mb-0.5 ${activeTab === 'proveedores' ? 'text-emerald-600 scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Proveedores</span>
        </button>

        {/* Pestaña: Clippy IA */}
        <button
          onClick={() => {
            setActiveTab('asistente');
            onOpenPapelitoChat();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 min-w-[60px] ${
            activeTab === 'asistente'
              ? 'text-amber-700 font-extrabold bg-amber-50'
              : 'text-slate-500 font-semibold hover:text-slate-800'
          }`}
        >
          <div className="scale-75 mb-0.5 -mt-1">
            <ClippyAvatar size="sm" state="idle" />
          </div>
          <span className="text-[10px] tracking-tight">Clippy IA</span>
        </button>

      </div>
    </nav>
  );
};
