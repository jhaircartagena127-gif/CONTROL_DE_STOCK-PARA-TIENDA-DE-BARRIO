import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Edit3, 
  Download, 
  PlusCircle, 
  PackageOpen, 
  AlertCircle, 
  Calendar,
  Sparkles,
  Camera
} from 'lucide-react';
import { Producto } from '../types/inventory.ts';
import { ClippyAvatar } from './ClippyAvatar.tsx';

interface MasterInventoryTableProps {
  productos: Producto[];
  onUpdateStock: (id: string, cambio: number) => void;
  onSetDirectStock: (id: string, nuevoStock: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (producto: Producto) => void;
  onDeleteProducto: (id: string) => void;
  onOpenExportModal: () => void;
  onOpenScanner?: () => void;
}

export const MasterInventoryTable: React.FC<MasterInventoryTableProps> = ({
  productos,
  onUpdateStock,
  onSetDirectStock,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProducto,
  onOpenExportModal,
  onOpenScanner
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('Todas');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);

  // Categorías para chips de filtro
  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach(p => { if (p.categoria) set.add(p.categoria); });
    return ['Todas', ...Array.from(set)];
  }, [productos]);

  // Filtrado
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      if (search) {
        const q = search.toLowerCase().trim();
        const match = p.nombre.toLowerCase().includes(q) ||
                      p.sku.toLowerCase().includes(q) ||
                      p.categoria.toLowerCase().includes(q) ||
                      p.proveedor.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedCategoria !== 'Todas' && p.categoria !== selectedCategoria) {
        return false;
      }

      return true;
    });
  }, [productos, search, selectedCategoria]);

  const handleStartEditing = (prod: Producto) => {
    setEditingStockId(prod.id);
    setEditingStockVal(prod.stock_actual);
  };

  const handleSaveDirectStock = (id: string) => {
    onSetDirectStock(id, editingStockVal);
    setEditingStockId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      
      {/* Barra superior con botones grandes */}
      <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Inventario de Productos</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Controla las existencias en tu estantería y cambia las cantidades con un toque.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Botón Escanear con Cámara */}
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 transition shadow-sm active:scale-95"
                title="Escanear código de barras con la cámara"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Escanear Código</span>
              </button>
            )}

            {/* Botón Descargar (PDF o Excel) */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Descargar (PDF / Excel)</span>
            </button>

            {/* Botón Registrar Producto */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Registrar Producto</span>
            </button>
          </div>
        </div>

        {/* Buscador grande y chips de categorías */}
        {productos.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre (ej: Arroz, Leche, Aceite)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
              />
            </div>

            {/* Categorías como chips táctiles */}
            {categorias.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Filtrar:</span>
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoria(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCategoria === cat
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Estado vacío cuando NO HAY PRODUCTOS (el usuario los ingresará uno por uno) */}
      {productos.length === 0 ? (
        <div className="py-14 px-6 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="mb-4">
            <ClippyAvatar 
              size="lg" 
              state="idle" 
              speechBubble="¡Hola! Apunta la cámara a cualquier empaque para leer su código de barras o anótalo a mano." 
            />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-2 mt-2">
            Tu tienda está lista para empezar
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Aún no tienes productos registrados. Puedes ir agregando uno por uno los productos que vendes en tu mostrador (arroz, aceite, leche, gaseosas, etc.) escaneando su código de barras con la cámara o escribiendo sus datos.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm transition transform active:scale-95"
              >
                <Camera className="w-5 h-5 text-emerald-700" />
                <span>📷 Escanear con Cámara</span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ Registrar Manualmente</span>
            </button>
          </div>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="font-bold text-slate-700">No se encontró ningún producto con esa búsqueda</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategoria('Todas'); }}
            className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        /* Tabla para computadoras y lista de tarjetas en celulares */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-3">Categoría</th>
                <th className="py-3.5 px-4 text-center">Cantidad en Tienda</th>
                <th className="py-3.5 px-3 text-right">Costo / Venta</th>
                <th className="py-3.5 px-3">Vencimiento</th>
                <th className="py-3.5 px-3">Proveedor</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {productosFiltrados.map((prod) => {
                const isCritico = prod.stock_actual <= prod.stock_minimo;
                
                // Vencimiento
                let isVencePronto = false;
                let diasVenc: number | null = null;
                if (prod.fecha_vencimiento) {
                  const hoy = new Date('2026-10-15T12:00:00Z').getTime();
                  const diff = new Date(prod.fecha_vencimiento + 'T00:00:00Z').getTime() - hoy;
                  diasVenc = Math.ceil(diff / (1000 * 60 * 60 * 24));
                  if (diasVenc <= 15) isVencePronto = true;
                }

                return (
                  <tr 
                    key={prod.id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      isCritico ? 'bg-rose-50/50' : isVencePronto ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Nombre y SKU */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isCritico ? 'bg-rose-500 animate-pulse' : isVencePronto ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="font-extrabold text-slate-900 text-sm">
                            {prod.nombre}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          Cód: {prod.sku}
                        </span>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-4 px-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                        {prod.categoria}
                      </span>
                    </td>

                    {/* Controles GRANDES de Stock táctiles (+ y -) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón MENOS */}
                        <button
                          onClick={() => onUpdateStock(prod.id, -1)}
                          disabled={prod.stock_actual <= 0}
                          title="Restar 1 unidad"
                          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 flex items-center justify-center font-black text-lg transition border border-slate-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        {/* Cantidad grande y editable */}
                        {editingStockId === prod.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={editingStockVal}
                              onChange={(e) => setEditingStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 text-center font-bold text-sm bg-white border-2 border-emerald-600 rounded-lg py-1 text-slate-900 focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveDirectStock(prod.id);
                                if (e.key === 'Escape') setEditingStockId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveDirectStock(prod.id)}
                              className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-lg font-bold"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditing(prod)}
                            title="Haz clic para escribir el número directamente"
                            className={`px-3 py-1.5 rounded-xl font-black text-center cursor-pointer transition select-none flex flex-col items-center min-w-[70px] ${
                              isCritico
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-900 border border-slate-200 hover:border-emerald-500'
                            }`}
                          >
                            <span className="text-base sm:text-lg">{prod.stock_actual}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {prod.unidad_medida}
                            </span>
                          </div>
                        )}

                        {/* Botón MÁS */}
                        <button
                          onClick={() => onUpdateStock(prod.id, 1)}
                          title="Sumar 1 unidad"
                          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 flex items-center justify-center font-black text-lg transition border border-slate-200 active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {isCritico && (
                        <p className="text-[11px] text-center text-rose-600 font-bold mt-1">
                          ¡Quedan pocas! (Mínimo: {prod.stock_minimo})
                        </p>
                      )}
                    </td>

                    {/* Precios Compra / Venta */}
                    <td className="py-4 px-3 text-right">
                      <div className="font-semibold">
                        <span className="text-slate-900 font-bold block">
                          Venta: Bs. {prod.precio_venta.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Costo: Bs. {prod.precio_compra.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Vencimiento */}
                    <td className="py-4 px-3">
                      {prod.fecha_vencimiento ? (
                        <div>
                          <span className={`font-semibold block ${isVencePronto ? 'text-amber-700 font-bold' : 'text-slate-700'}`}>
                            {prod.fecha_vencimiento}
                          </span>
                          {diasVenc !== null && (
                            <span className={`text-[11px] font-bold ${diasVenc <= 5 ? 'text-rose-600' : 'text-amber-600'}`}>
                              {diasVenc <= 0 ? '¡Vencido!' : `En ${diasVenc} días`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Proveedor */}
                    <td className="py-4 px-3">
                      <span className="text-slate-700 text-xs font-semibold block truncate max-w-[140px]">
                        {prod.proveedor || 'Sin asignar'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditModal(prod)}
                          title="Editar producto"
                          className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProducto(prod.id)}
                          title="Eliminar producto"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pie de tabla */}
      {productos.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>💡 Consejo: Toca los botones <strong>+</strong> y <strong>-</strong> para sumar o restar existencias al instante.</span>
          <span className="font-semibold text-slate-700">Total en catálogo: {productos.length} productos</span>
        </div>
      )}

    </div>
  );
};
