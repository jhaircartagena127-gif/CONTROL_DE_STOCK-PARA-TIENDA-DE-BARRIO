import { Request, Response } from 'express';
import { db } from '../config/db.ts';

export const agendaController = {
  // Obtener todas las citas y pedidos agendados
  getAgenda(req: Request, res: Response) {
    try {
      const agenda = db.getAgenda();
      res.json({
        ok: true,
        total: agenda.length,
        agenda
      });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Registrar nueva visita o pedido en la agenda + Webhook a Google Calendar
  async addAgenda(req: Request, res: Response) {
    try {
      const { proveedor, fecha, hora, contacto, nota, productos_esperados, monto_estimado } = req.body;

      if (!proveedor || !fecha) {
        return res.status(400).json({ ok: false, error: 'Proveedor y fecha son obligatorios' });
      }

      // Buscar si el proveedor tiene contacto registrado
      const provInfo = db.getProveedorByName(proveedor);
      const contactoFinal = contacto || (provInfo ? `${provInfo.contacto} (${provInfo.telefono})` : 'Por coordinar');

      const nuevaCita = db.addAgenda({
        proveedor,
        fecha,
        hora: hora || '10:00',
        contacto: contactoFinal,
        nota: nota || `Visita de abastecimiento con ${proveedor}`,
        productos_esperados: productos_esperados || 'Pedido de reposición',
        monto_estimado: Number(monto_estimado) || 0,
        estado: 'programado'
      });

      // Disparo de Webhook (si está configurada una URL en variables de entorno o payload simulado)
      let webhookStatus = { enviado: true, mensaje: 'Webhook ejecutado: Evento registrado para Google Calendar' };
      if (process.env.WEBHOOK_CALENDAR_URL) {
        try {
          await fetch(process.env.WEBHOOK_CALENDAR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evento: 'NUEVA_VISITA_PROVEEDOR',
              datos: nuevaCita,
              timestamp: new Date().toISOString()
            })
          });
        } catch (err: any) {
          console.warn('Fallo al disparar webhook externo:', err.message);
          webhookStatus = { enviado: false, mensaje: `Webhook externo falló: ${err.message}` };
        }
      }

      res.status(201).json({
        ok: true,
        cita: nuevaCita,
        webhook: webhookStatus,
        mensaje: `Visita con ${proveedor} agendada para el ${fecha} a las ${hora || '10:00'}`
      });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Actualizar estado (ej: completado, cancelado)
  updateAgenda(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const cita = db.updateAgenda(id, updates);

      if (!cita) {
        return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
      }

      res.json({ ok: true, cita, mensaje: 'Agenda actualizada' });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Eliminar de la agenda
  deleteAgenda(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const borrado = db.deleteAgenda(id);
      if (!borrado) {
        return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
      }
      res.json({ ok: true, mensaje: 'Cita eliminada del calendario' });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
};
