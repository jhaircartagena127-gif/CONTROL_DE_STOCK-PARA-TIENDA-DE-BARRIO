import React from 'react';
import { Phone, Mail, MapPin, Calendar, Truck, Sparkles, CalendarPlus, ShieldCheck } from 'lucide-react';
import { Proveedor, Producto } from '../types/inventory.ts';

interface SuppliersViewProps {
  proveedores: Proveedor[];
  productos: Producto[];
  onScheduleSupplier: (proveedorNombre: string) => void;
  onAskPapelito: (query: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  proveedores,
  productos,
  onScheduleSupplier,
  onAskPapelito
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Directorio Oficial de Proveedores &amp; Distribuidores
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {proveedores.length} Registrados
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Canales directos de abastecimiento con días de visita, contactos comerciales y catálogos vinculados.
          </p>
        </div>
      </div>

      {/* Grid de Proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proveedores.map((prov) => {
          const prodsDelProv = productos.filter(p => p.proveedor.toLowerCase().includes(prov.nombre.toLowerCase()));
          const prodsAlerta = prodsDelProv.filter(p => p.stock_actual <= p.stock_minimo);

          return (
            <div
              key={prov.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {prov.categoria}
                  </span>
                  {prodsAlerta.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                      {prodsAlerta.length} Alerta(s)
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {prov.nombre}
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-3">
                  Contacto: <span className="text-slate-200">{prov.contacto}</span>
                </p>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <a
                      href={`tel:${prov.telefono.replace(/\s+/g, '')}`}
                      className="text-emerald-400 hover:underline font-mono font-semibold"
                    >
                      {prov.telefono}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 truncate">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{prov.email}</span>
                  </div>

                  <div className="flex items-start gap-2 text-amber-300/90">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{prov.dias_visita}</span>
                  </div>

                  {prov.direccion && (
                    <div className="flex items-start gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] truncate">{prov.direccion}</span>
                    </div>
                  )}
                </div>

                {/* Productos que distribuye */}
                <div className="text-[11px] text-slate-400 mb-4">
                  <span className="block font-semibold text-slate-300 mb-1">
                    Productos abastecidos ({prodsDelProv.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {prodsDelProv.slice(0, 3).map(p => (
                      <span key={p.id} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {p.nombre}
                      </span>
                    ))}
                    {prodsDelProv.length > 3 && (
                      <span className="text-[10px] text-slate-500">+{prodsDelProv.length - 3} más</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onScheduleSupplier(prov.nombre)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Agendar Visita</span>
                </button>

                <button
                  onClick={() => onAskPapelito(`¿Qué productos nos suministra ${prov.nombre} y cuál es el stock actual de cada uno?`)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                  title="Consultar a Papelito sobre este proveedor"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
