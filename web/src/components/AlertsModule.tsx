import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Plus, 
  CheckCircle2, 
  MessageCircle, 
  ShoppingBag,
  CheckCircle,
  Truck
} from 'lucide-react';
import { AlertaStock, AlertaVencimiento } from '../types/inventory.ts';

interface AlertsModuleProps {
  alertasStock: AlertaStock[];
  alertasVencimiento: AlertaVencimiento[];
  onRestock: (productoId: string, cantidad: number) => void;
  onAskPapelito: (query: string) => void;
  onScheduleSupplier: (proveedor: string, productoNombre: string) => void;
}

export const AlertsModule: React.FC<AlertsModuleProps> = ({
  alertasStock,
  alertasVencimiento,
  onRestock,
  onAskPapelito,
  onScheduleSupplier,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'stock' | 'vencimiento'>('all');

  const total = alertasStock.length + alertasVencimiento.length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
      
      {/* Cabecera amigable */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Avisos de Mercadería</span>
            </h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              total > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {total} {total === 1 ? 'aviso activo' : 'avisos activos'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            En <strong className="text-rose-600">rojo</strong> lo que se te está acabando y en <strong className="text-amber-600">amarillo</strong> lo que vence en menos de 15 días.
          </p>
        </div>

        {/* Botones de filtro grandes */}
        {total > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({total})
            </button>
            <button
              onClick={() => setFilterType('stock')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterType === 'stock' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Por acabarse ({alertasStock.length})
            </button>
            <button
              onClick={() => setFilterType('vencimiento')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterType === 'vencimiento' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Por vencer ({alertasVencimiento.length})
            </button>
          </div>
        )}
      </div>

      {/* Estado cuando no hay alertas */}
      {total === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            ¡Todo tu stock está en orden!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1">
            No tienes productos agotados ni mercancía pronta a vencer. Cuando registres productos y el stock baje de tu mínimo, te avisaremos aquí de inmediato.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          
          {/* Alertas de Stock (ROJO: stock_actual <= stock_minimo) */}
          {(filterType === 'all' || filterType === 'stock') &&
            alertasStock.map((alerta) => {
              const p = alerta.producto;
              return (
                <div
                  key={`stock-${p.id}`}
                  className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-5 shadow-sm hover:shadow transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-200/80 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                        ⚠️ Por Acabarse (Stock Bajo)
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {p.nombre}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                      {p.categoria}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-rose-100 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Te quedan</span>
                      <span className="text-rose-600 font-black text-base">
                        {p.stock_actual} {p.unidad_medida}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Tu mínimo</span>
                      <span className="text-slate-700 font-bold text-sm">
                        {p.stock_minimo} {p.unidad_medida}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Falta comprar</span>
                      <span className="text-amber-700 font-black text-base">
                        +{alerta.deficiencia}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600">
                    Proveedor sugerido: <strong>{p.proveedor || 'No especificado'}</strong>
                  </p>

                  {/* Botones de acción grandes */}
                  <div className="mt-4 pt-3 border-t border-rose-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => onRestock(p.id, alerta.deficiencia > 0 ? alerta.deficiencia : 5)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Reponer +{alerta.deficiencia > 0 ? alerta.deficiencia : 5} {p.unidad_medida}</span>
                    </button>

                    <button
                      onClick={() => onScheduleSupplier(p.proveedor, p.nombre)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Agendar Visita</span>
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Alertas de Vencimiento (AMARILLO: vencimiento < 15 días) */}
          {(filterType === 'all' || filterType === 'vencimiento') &&
            alertasVencimiento.map((alerta) => {
              const p = alerta.producto;
              const dias = alerta.dias_restantes;
              return (
                <div
                  key={`venc-${p.id}`}
                  className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                        ⏳ Por Vencer en Menos de 15 Días
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {p.nombre}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                      {p.categoria}
                    </span>
                  </div>

                  <div className="mt-3 bg-white p-3 rounded-xl border border-amber-100 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Fecha en empaque</span>
                      <span className="text-amber-900 font-extrabold text-sm">
                        {p.fecha_vencimiento}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">Tiempo que queda</span>
                      <span className={`font-black text-base ${dias <= 5 ? 'text-rose-600' : 'text-amber-800'}`}>
                        {dias <= 0 ? '¡VENCE HOY O YA VENCIÓ!' : `${dias} días para vencer`}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600">
                    Unidades en estante a rotar: <strong>{p.stock_actual} {p.unidad_medida}</strong>
                  </p>

                  <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
                    <span className="text-xs text-amber-900 font-semibold">
                      💡 Consejo: Ponlo adelante en el mostrador o hazle rebaja.
                    </span>
                    <button
                      onClick={() => onAskPapelito(`¿Qué me recomiendas hacer con las ${p.stock_actual} unidades de ${p.nombre} que vencen el ${p.fecha_vencimiento}?`)}
                      className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-xs transition"
                    >
                      Preguntar a Papelito
                    </button>
                  </div>
                </div>
              );
            })}

        </div>
      )}

    </div>
  );
};
