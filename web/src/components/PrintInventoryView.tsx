import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Producto, MetricasResponse } from '../types/inventory.ts';

interface PrintInventoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  metricas: MetricasResponse | null;
}

export const PrintInventoryView: React.FC<PrintInventoryViewProps> = ({
  isOpen,
  onClose,
  productos,
  metricas
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const hoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8 border border-slate-200">
        
        {/* Barra de control superior (oculta al imprimir) */}
        <div className="no-print bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base block">
                Hoja de Inventario para Imprimir o Guardar en PDF
              </span>
              <span className="text-xs text-slate-400">
                Se ajusta perfectamente a hojas A4 o Carta.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hoja limpia para imprimir */}
        <div className="p-8 font-sans print:p-0">
          
          {/* Cabecera del Documento */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Control de Inventario y Stock
              </h1>
              <p className="text-sm font-bold text-emerald-700">
                Mi Tiendita • Control de Existencias Papelito
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Fecha de Emisión: <strong>{hoy}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800">
                REPORTE OFICIAL
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Total Ítems: <strong>{productos.length}</strong>
              </p>
            </div>
          </div>

          {/* Resumen de Métricas */}
          <div className="grid grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Ítems</span>
              <span className="text-lg font-black text-slate-900">{productos.length} prod.</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Unidades Físicas</span>
              <span className="text-lg font-black text-slate-900">{metricas?.unidadesTotales || 0} unid.</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Costo Invertido</span>
              <span className="text-lg font-black text-slate-900">Bs. {(metricas?.valorInvertidoTotal || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Venta Estimada</span>
              <span className="text-lg font-black text-emerald-700">Bs. {(metricas?.valorVentaTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Tabla Limpia Imprimible */}
          {productos.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-300 rounded-2xl mb-8">
              <p className="font-bold">Aún no hay productos registrados en este reporte.</p>
              <p className="text-xs mt-1">Registra productos en la aplicación para verlos detallados aquí.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs mb-8">
              <thead>
                <tr className="border-b-2 border-slate-800 text-[10px] font-black uppercase text-slate-700 bg-slate-100">
                  <th className="py-2.5 px-2">Cód.</th>
                  <th className="py-2.5 px-2">Producto</th>
                  <th className="py-2.5 px-2">Categoría</th>
                  <th className="py-2.5 px-2 text-center">Stock Actual</th>
                  <th className="py-2.5 px-2 text-center">Mínimo</th>
                  <th className="py-2.5 px-2 text-right">Costo Unit.</th>
                  <th className="py-2.5 px-2 text-right">Venta Unit.</th>
                  <th className="py-2.5 px-2 text-right">Subtotal Costo</th>
                  <th className="py-2.5 px-2">Vencimiento</th>
                  <th className="py-2.5 px-2">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {productos.map((prod) => {
                  const subtotal = prod.stock_actual * prod.precio_compra;
                  const isCritico = prod.stock_actual <= prod.stock_minimo;
                  return (
                    <tr key={prod.id} className={isCritico ? 'bg-rose-50/80 font-medium' : ''}>
                      <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{prod.sku}</td>
                      <td className="py-2 px-2 font-bold text-slate-900">
                        {prod.nombre}
                        {isCritico && (
                          <span className="ml-1 text-[9px] font-bold text-rose-700 uppercase">[Por Acabarse]</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-slate-600">{prod.categoria}</td>
                      <td className={`py-2 px-2 text-center font-black ${isCritico ? 'text-rose-700' : 'text-slate-900'}`}>
                        {prod.stock_actual} {prod.unidad_medida}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-600">{prod.stock_minimo}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-700">Bs. {prod.precio_compra.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">Bs. {prod.precio_venta.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">Bs. {subtotal.toFixed(2)}</td>
                      <td className="py-2 px-2 font-mono text-slate-600">{prod.fecha_vencimiento || '—'}</td>
                      <td className="py-2 px-2 text-slate-700">{prod.proveedor}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold bg-slate-50 text-slate-900">
                  <td colSpan={7} className="py-3 px-2 text-right uppercase text-[11px]">
                    Total Valorizado al Costo:
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-black text-sm">
                    Bs. {(metricas?.valorInvertidoTotal || 0).toFixed(2)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* Firmas y sellos */}
          <div className="pt-10 grid grid-cols-2 gap-12 text-center text-xs text-slate-600">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800">Firma del Encargado / Dueño de Tienda</p>
              <p className="text-[10px] text-slate-500">Mi Tiendita • Control Físico</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800">Fecha de Cotejo</p>
              <p className="text-[10px] text-slate-500">{hoy}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
