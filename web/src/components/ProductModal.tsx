import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, PackageCheck, AlertCircle, Camera, Barcode } from 'lucide-react';
import { Producto, Proveedor } from '../types/inventory.ts';
import { ClippyAvatar } from './ClippyAvatar.tsx';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prod: Partial<Producto>) => void;
  productoParaEditar?: Producto | null;
  proveedores: Proveedor[];
  onOpenScanner?: () => void;
  initialBarcode?: string | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productoParaEditar,
  proveedores,
  onOpenScanner,
  initialBarcode
}) => {
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: '',
    sku: '',
    categoria: 'Abarrotes',
    stock_actual: 10,
    stock_minimo: 3,
    precio_compra: 0,
    precio_venta: 0,
    fecha_vencimiento: '',
    proveedor: proveedores[0]?.nombre || 'Distribuidora General',
    unidad_medida: 'unidades'
  });

  useEffect(() => {
    if (productoParaEditar) {
      setFormData(productoParaEditar);
    } else {
      setFormData({
        nombre: '',
        sku: initialBarcode || `PROD-${Date.now().toString().slice(-4)}`,
        categoria: 'Abarrotes',
        stock_actual: 10,
        stock_minimo: 3,
        precio_compra: 0,
        precio_venta: 0,
        fecha_vencimiento: '',
        proveedor: proveedores[0]?.nombre || 'Distribuidora General',
        unidad_medida: 'unidades'
      });
    }
  }, [productoParaEditar, proveedores, isOpen, initialBarcode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre?.trim()) {
      alert('Por favor ingresa el nombre del producto.');
      return;
    }

    onSave({
      ...formData,
      nombre: formData.nombre.trim(),
      sku: formData.sku?.trim() || `PROD-${Date.now().toString().slice(-4)}`,
      stock_actual: Math.max(0, Number(formData.stock_actual) || 0),
      stock_minimo: Math.max(1, Number(formData.stock_minimo) || 1),
      precio_compra: Math.max(0, Number(formData.precio_compra) || 0),
      precio_venta: Math.max(0, Number(formData.precio_venta) || 0),
    });
    onClose();
  };

  const categorias = [
    'Abarrotes',
    'Bebidas & Gaseosas',
    'Lácteos & Huevos',
    'Panadería & Galletas',
    'Snacks & Golosinas',
    'Limpieza del Hogar',
    'Embutidos & Carnes',
    'Frutas & Verduras',
    'Cuidado Personal'
  ];

  const unidades = ['unidades', 'kilos', 'bolsas', 'botellas', 'latas', 'paquetes', 'cajas'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6">
        
        {/* Cabecera amigable con Clippy */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 bg-white/20 p-1 rounded-2xl">
              <ClippyAvatar size="sm" state="idle" showBadge={false} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">
                {productoParaEditar ? 'Modificar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <p className="text-xs text-emerald-100">
                Lleva el control de tus compras, ventas y stock fácilmente.
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          
          {/* Nombre del Producto */}
          <div>
            <label className="block text-slate-800 font-bold mb-1.5 text-xs sm:text-sm">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Arroz Superior 1kg, Leche Gloria, Aceite Primor 900ml..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 transition font-medium"
            />
          </div>

          {/* Código de Barras / SKU con Botón Escáner */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-800 font-bold text-xs">
                Código de Barras (EAN / UPC / SKU)
              </label>
              {onOpenScanner && (
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Escanear con Cámara</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="7750123456789 o PROD-001"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 transition"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Puedes escanearlo con la cámara de tu celular/PC o dejar el código sugerido.
            </span>
          </div>

          {/* Categoría y Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-bold mb-1.5 text-xs">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1.5 text-xs">Unidad de Venta</label>
              <select
                value={formData.unidad_medida}
                onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
              >
                {unidades.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cantidades de Stock */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
              📦 Control de Cantidades
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ¿Cuántas unidades tienes hoy en tienda? *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock_actual}
                  onChange={(e) => setFormData({ ...formData, stock_actual: Number(e.target.value) })}
                  className="w-full bg-white border-2 border-emerald-300 rounded-xl px-4 py-2 text-base font-extrabold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ¿Avisarme cuando queden menos de: *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
                  className="w-full bg-white border-2 border-emerald-300 rounded-xl px-4 py-2 text-base font-extrabold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium">
              💡 Cuando el stock baje a ese número, se pondrá en rojo para avisarte que debes pedir más.
            </p>
          </div>

          {/* Precios: Costo y Venta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                Precio de Compra / Costo (Bs.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.precio_compra || ''}
                onChange={(e) => setFormData({ ...formData, precio_compra: Number(e.target.value) })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">¿Cuánto pagaste por cada uno?</span>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                Precio de Venta al Público (Bs.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.precio_venta || ''}
                onChange={(e) => setFormData({ ...formData, precio_venta: Number(e.target.value) })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-emerald-700 focus:outline-none focus:bg-white focus:border-emerald-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">¿A cuánto lo vendes al cliente?</span>
            </div>
          </div>

          {/* Vencimiento y Proveedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                Fecha de Vencimiento (Opcional)
              </label>
              <input
                type="date"
                value={formData.fecha_vencimiento || ''}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                Proveedor / Distribuidor
              </label>
              <input
                type="text"
                value={formData.proveedor || ''}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                placeholder="Ej: Distribuidora San Martín..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition transform active:scale-95"
            >
              <Save className="w-5 h-5" />
              <span>{productoParaEditar ? 'Guardar Cambios' : 'Guardar Producto en Mi Tienda'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
