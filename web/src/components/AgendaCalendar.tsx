import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Truck, 
  Phone, 
  FileText, 
  Package, 
  DollarSign,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { AgendaPedido, Proveedor } from '../types/inventory.ts';

interface AgendaCalendarProps {
  agenda: AgendaPedido[];
  proveedores: Proveedor[];
  onAddAgenda: (cita: Partial<AgendaPedido>) => void;
  onUpdateStatus: (id: string, estado: 'programado' | 'completado' | 'cancelado') => void;
  onDeleteAgenda: (id: string) => void;
  onTestWebhook: (cita: AgendaPedido) => void;
}

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({
  agenda,
  proveedores,
  onAddAgenda,
  onUpdateStatus,
  onDeleteAgenda,
  onTestWebhook
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    proveedor: proveedores[0]?.nombre || 'Distribuidora General',
    fecha: '2026-10-16',
    hora: '10:00',
    contacto: '',
    nota: 'Visita de abastecimiento y reposición de mercadería',
    productos_esperados: '',
    monto_estimado: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proveedor || !formData.fecha) return;

    onAddAgenda({
      ...formData,
      monto_estimado: formData.monto_estimado ? Number(formData.monto_estimado) : 0,
      estado: 'programado'
    });

    setShowForm(false);
    setFormData({
      proveedor: proveedores[0]?.nombre || '',
      fecha: '2026-10-16',
      hora: '10:00',
      contacto: '',
      nota: '',
      productos_esperados: '',
      monto_estimado: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Visitas y Pedidos */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Agenda de Proveedores &amp; Repartos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Anota qué días vienen los distribuidores a dejar mercadería a tu tienda y agrégalo directo a tu Google Calendar para que no se te pase.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-md shadow-amber-500/20 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cerrar Formulario' : '+ Agendar Nueva Visita'}</span>
        </button>
      </div>

      {/* Formulario grande */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            Anotar Visita de Repartidor o Distribuidor
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-800 font-bold mb-1">Distribuidor / Proveedor *</label>
              <input
                type="text"
                required
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                placeholder="Ej: Repartidor de Lácteos, Don Jorge..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Día de la visita *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Hora aproximada</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Monto a pagar (Bs.)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.monto_estimado}
                onChange={(e) => setFormData({ ...formData, monto_estimado: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-800 font-bold mb-1">¿Qué productos te van a traer?</label>
              <input
                type="text"
                placeholder="Ej: 2 cajas de aceite, 1 fardo de arroz..."
                value={formData.productos_esperados}
                onChange={(e) => setFormData({ ...formData, productos_esperados: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Nota o número de contacto</label>
              <input
                type="text"
                placeholder="Ej: Tener cambio listo, Cel: 987 654 321"
                value={formData.nota}
                onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-md transition"
            >
              Guardar y Sincronizar Calendario
            </button>
          </div>
        </form>
      )}

      {/* Lista de Citas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agenda.length === 0 ? (
          <div className="col-span-2 py-12 px-6 text-center bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-extrabold text-slate-800">No hay visitas de proveedores agendadas</h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Puedes agregar una visita con el botón "+ Agendar Nueva Visita" o simplemente decírselo por voz a Papelito: "Agenda que el distribuidor de leche viene el viernes a las 10 AM".
            </p>
          </div>
        ) : (
          agenda.map((cita) => {
            const isCompletado = cita.estado === 'completado';
            const isCancelado = cita.estado === 'cancelado';

            return (
              <div
                key={cita.id}
                className={`bg-white border rounded-3xl p-6 transition-all shadow-sm ${
                  isCompletado
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-85'
                    : isCancelado
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      isCompletado
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCancelado
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {cita.estado === 'programado' ? '📅 Pedido Programado' : cita.estado === 'completado' ? '✅ Ya recibido' : 'Cancelado'}
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-2">
                      {cita.proveedor}
                    </h4>
                  </div>

                  <button
                    onClick={() => onDeleteAgenda(cita.id)}
                    title="Eliminar de la lista"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-4 bg-slate-50 p-3 rounded-2xl text-xs sm:text-sm text-slate-700 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>{cita.fecha}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{cita.hora} hrs</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs sm:text-sm text-slate-600">
                  {cita.productos_esperados && (
                    <p className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>Mercadería: <strong>{cita.productos_esperados}</strong></span>
                    </p>
                  )}
                  {cita.nota && (
                    <p className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>Nota: {cita.nota}</span>
                    </p>
                  )}
                  {cita.monto_estimado && cita.monto_estimado > 0 ? (
                    <p className="flex items-center gap-2 text-emerald-700 font-extrabold">
                      <DollarSign className="w-4 h-4" />
                      <span>A pagar aprox: Bs. {cita.monto_estimado.toFixed(2)}</span>
                    </p>
                  ) : null}
                </div>

                {/* Botón Google Calendar & Marcado de recibido */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {cita.google_calendar_url && (
                    <a
                      href={cita.google_calendar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir en Google Calendar</span>
                    </a>
                  )}

                  {!isCompletado && (
                    <button
                      onClick={() => onUpdateStatus(cita.id, 'completado')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition ml-auto"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Marcar como Recibido</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
