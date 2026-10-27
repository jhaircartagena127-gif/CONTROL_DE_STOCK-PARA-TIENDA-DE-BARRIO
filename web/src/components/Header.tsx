import React from 'react';
import { 
  Store, 
  Package, 
  AlertTriangle, 
  Truck, 
  Download, 
  PlusCircle, 
  Camera, 
  Sparkles,
  RefreshCw,
  Database,
  Smartphone
} from 'lucide-react';
import { ClippyAvatar } from './ClippyAvatar.tsx';

interface HeaderProps {
  activeTab: 'inventario' | 'alertas' | 'proveedores' | 'asistente';
  setActiveTab: (tab: 'inventario' | 'alertas' | 'proveedores' | 'asistente') => void;
  alertCount: number;
  productCount: number;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenPapelitoChat: () => void;
  onOpenScanner: () => void;
  onOpenDatabaseModal: () => void;
  onOpenInstallModal: () => void;
  onRefreshData: () => void;
  isInstalled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  alertCount,
  productCount,
  onOpenAddModal,
  onOpenExportModal,
  onOpenPapelitoChat,
  onOpenScanner,
  onOpenDatabaseModal,
  onOpenInstallModal,
  onRefreshData,
  isInstalled = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo y Clippy Ayudante de Tienda */}
          <div className="flex items-center gap-3">
            <div 
              onClick={onOpenPapelitoChat}
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              title="¡Haz clic para hablar con Clippy!"
            >
              <ClippyAvatar size="md" state="idle" showBadge={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Mi Tiendita
                </h1>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Clippy IA
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Control fácil de productos, escáner de barras y compras
              </p>
            </div>
          </div>

          {/* Botones Grandes de Acción Principal (Escritorio) */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Botón Escáner con Cámara */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 transition shadow-sm active:scale-95"
              title="Escanear código de barras con la cámara"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Escanear Código (Cámara)</span>
            </button>

            {/* Botón Descargar (PDF o Excel) */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition shadow-sm active:scale-95"
              title="Descargar inventario en PDF o Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Descargar (PDF / Excel)</span>
            </button>

            {/* Botón Registrar Nuevo Producto */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nuevo Producto</span>
            </button>

            {/* Botón Base de Datos & Docker */}
            <button
              onClick={onOpenDatabaseModal}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 transition shadow-sm active:scale-95"
              title="Configurar conexión con MongoDB Atlas y Docker"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Base de Datos</span>
            </button>

            {/* Botón Instalar como App */}
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-sm shadow-emerald-700/20 transition active:scale-95"
              title="Instalar Mi Tiendita en Celular o Laptop"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isInstalled ? 'App Lista' : 'Instalar App'}</span>
            </button>

            {/* Asistente Clippy */}
            <button
              onClick={onOpenPapelitoChat}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-400/25 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Hablar con Clippy</span>
            </button>
          </div>

          {/* Botones rápidos en celular */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenInstallModal}
              title="Instalar App en el Celular"
              className="p-2.5 rounded-2xl bg-teal-50 text-teal-800 border border-teal-300"
            >
              <Smartphone className="w-5 h-5 text-teal-700" />
            </button>
            <button
              onClick={onOpenDatabaseModal}
              title="Base de datos y Docker"
              className="p-2.5 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-700"
            >
              <Database className="w-5 h-5 text-emerald-400" />
            </button>
            <button
              onClick={onOpenScanner}
              title="Escanear con cámara"
              className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300"
            >
              <Camera className="w-5 h-5 text-emerald-700" />
            </button>
            <button
              onClick={onOpenExportModal}
              title="Descargar reporte"
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200"
            >
              <Download className="w-5 h-5 text-emerald-600" />
            </button>
            <button
              onClick={onOpenAddModal}
              title="Nuevo producto"
              className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Barra de pestañas grandes y claras */}
        <div className="flex items-center justify-between pb-3 pt-1 border-t border-slate-100 overflow-x-auto no-scrollbar gap-2">
          <nav className="flex items-center gap-2">
            
            <button
              onClick={() => setActiveTab('inventario')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'inventario'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Mis Productos ({productCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('alertas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'alertas'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Avisos y Alertas</span>
              {alertCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-white text-rose-600 ml-1">
                  {alertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('proveedores')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'proveedores'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Proveedores &amp; Pedidos</span>
            </button>

            <button
              onClick={() => setActiveTab('asistente')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'asistente'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              <span className="text-base">📎</span>
              <span>Clippy IA (Voz)</span>
            </button>

          </nav>

          <button
            onClick={onRefreshData}
            title="Actualizar datos"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0 hidden sm:block"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
