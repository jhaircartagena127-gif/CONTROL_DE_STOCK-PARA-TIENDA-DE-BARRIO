import React from 'react';
import { DollarSign, Package, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { MetricasResponse } from '../types/inventory.ts';

interface MetricsCardsProps {
  metricas: MetricasResponse | null;
  onFilterAlerts?: () => void;
  onOpenInventory?: () => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  metricas,
  onFilterAlerts,
  onOpenInventory
}) => {
  const invertido = metricas?.valorInvertidoTotal || 0;
  const ventaEst = metricas?.valorVentaTotal || 0;
  const ganancia = metricas?.gananciaProyectada || 0;
  const cantProductos = metricas?.cantidadProductos || 0;
  const unidades = metricas?.unidadesTotales || 0;
  const alertas = metricas?.alertasActivas || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      
      {/* Tarjeta 1: Dinero invertido en mercadería */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Dinero Invertido en Mercadería
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Bs. {invertido.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            Venta total: Bs. {ventaEst.toFixed(2)}
          </span>
          <span className="font-medium">
            Ganancia est.: Bs. {ganancia.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tarjeta 2: Cantidad de Productos */}
      <div 
        onClick={onOpenInventory}
        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Productos en tu Tienda
          </span>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {cantProductos}
          </span>
          <span className="text-xs font-semibold text-slate-500">productos distintos</span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{unidades} unidades físicas en estantería</span>
          <span className="font-bold text-blue-600 group-hover:underline">Ver catálogo →</span>
        </div>
      </div>

      {/* Tarjeta 3: Alertas de Stock y Vencimiento */}
      <div 
        onClick={onFilterAlerts}
        className={`rounded-3xl p-6 transition-all cursor-pointer border ${
          alertas > 0
            ? 'bg-rose-50/70 border-rose-200 hover:shadow-md'
            : 'bg-white border-slate-200 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Avisos de Mercadería
          </span>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
            alertas > 0 ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
            alertas > 0 ? 'text-rose-600' : 'text-slate-900'
          }`}>
            {alertas}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {alertas === 1 ? 'producto requiere atención' : 'productos requieren atención'}
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
          {alertas > 0 ? (
            <span className="text-rose-700 font-bold">
              ⚠️ Productos por acabarse o vencer
            </span>
          ) : (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Todo en buen estado
            </span>
          )}
          <span className="font-bold text-slate-700 hover:underline">Revisar avisos →</span>
        </div>
      </div>

    </div>
  );
};
