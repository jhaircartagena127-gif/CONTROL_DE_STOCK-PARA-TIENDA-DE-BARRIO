import React from 'react';
import { X, FileSpreadsheet, Printer, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Producto, MetricasResponse } from '../types/inventory.ts';

interface ExportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  metricas: MetricasResponse | null;
  onOpenPdf: () => void;
}

export const ExportDownloadModal: React.FC<ExportDownloadModalProps> = ({
  isOpen,
  onClose,
  productos,
  metricas,
  onOpenPdf
}) => {
  if (!isOpen) return null;

  // Exportar a Excel (Formato CSV compatible universal con UTF-8 para Microsoft Excel y Google Sheets)
  const handleExportExcel = () => {
    if (productos.length === 0) {
      alert('Aún no tienes productos registrados para exportar. Agrega al menos uno primero.');
      return;
    }

    const headers = [
      'Código / SKU',
      'Producto',
      'Categoría',
      'Stock Actual',
      'Stock Mínimo',
      'Unidad',
      'Precio Compra (Bs.)',
      'Precio Venta (Bs.)',
      'Total Invertido (Bs.)',
      'Venta Proyectada (Bs.)',
      'Ganancia Estimada (Bs.)',
      'Fecha Vencimiento',
      'Proveedor',
      'Estado Alerta'
    ];

    const rows = productos.map(p => {
      const totalCosto = p.stock_actual * p.precio_compra;
      const totalVenta = p.stock_actual * p.precio_venta;
      const ganancia = totalVenta - totalCosto;
      
      let estado = 'Normal (Stock Suficiente)';
      if (p.stock_actual <= p.stock_minimo) {
        estado = 'ALERTA: Stock Bajo';
      }

      return [
        `"${p.sku}"`,
        `"${p.nombre.replace(/"/g, '""')}"`,
        `"${p.categoria}"`,
        p.stock_actual,
        p.stock_minimo,
        `"${p.unidad_medida}"`,
        p.precio_compra.toFixed(2),
        p.precio_venta.toFixed(2),
        totalCosto.toFixed(2),
        totalVenta.toFixed(2),
        ganancia.toFixed(2),
        `"${p.fecha_vencimiento || 'N/A'}"`,
        `"${p.proveedor.replace(/"/g, '""')}"`,
        `"${estado}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventario_Tienda_Papelito_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleChoosePdf = () => {
    onClose();
    onOpenPdf();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Cabecera amigable */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Descargar Inventario de la Tienda</h3>
              <p className="text-xs text-emerald-100">
                Elige el formato que te sea más cómodo para revisar o guardar.
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

        {/* Contenido / Opciones con botones grandes */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Se incluirán tus <strong>{productos.length} productos</strong> registrados, con sus precios, cantidades y alertas.
          </p>

          <div className="grid grid-cols-1 gap-3.5">
            
            {/* Opción 1: Excel */}
            <button
              onClick={handleExportExcel}
              className="group text-left p-5 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 transition-all flex items-center justify-between shadow-sm hover:shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    Descargar en Excel (.csv / .xlsx)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Abre en Microsoft Excel o Google Sheets. Listo para editar cálculos o guardar en tu computadora.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0 ml-2 shadow-sm">
                Descargar
              </span>
            </button>

            {/* Opción 2: PDF */}
            <button
              onClick={handleChoosePdf}
              className="group text-left p-5 rounded-2xl border-2 border-rose-500/30 hover:border-rose-600 bg-rose-50/50 hover:bg-rose-50 transition-all flex items-center justify-between shadow-sm hover:shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition">
                    Descargar o Imprimir en PDF
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hoja limpia y formal con el membrete de tu tienda, totales valorizados y firmas para imprimir.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shrink-0 ml-2 shadow-sm">
                Ver Hoja PDF
              </span>
            </button>

          </div>

          {productos.length === 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Nota: Tu inventario está vacío ahora. Los archivos se descargarán con tus columnas listas cuando registres productos.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
