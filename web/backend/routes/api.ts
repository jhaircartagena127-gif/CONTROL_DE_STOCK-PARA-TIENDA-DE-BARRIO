import { Router } from 'express';
import { productoController } from '../controllers/productoController.ts';
import { agendaController } from '../controllers/agendaController.ts';
import { papelitoController } from '../controllers/papelitoController.ts';
import { db } from '../config/db.ts';

export const apiRouter = Router();

// Productos & Inventario Maestro
apiRouter.get('/productos', productoController.getProductos);
apiRouter.post('/productos', productoController.addProducto);
apiRouter.put('/productos/:id', productoController.updateProducto);
apiRouter.patch('/productos/:id/stock', productoController.updateStockRapido);
apiRouter.delete('/productos/:id', productoController.deleteProducto);

// Alertas Automatizadas & Métricas Rápidas
apiRouter.get('/alertas', productoController.getAlertas);
apiRouter.get('/metricas', productoController.getMetricas);

// Proveedores e Historial
apiRouter.get('/proveedores', productoController.getProveedores);
apiRouter.get('/historial', productoController.getHistorial);
apiRouter.post('/system/reset', productoController.resetData);

// Agenda de Abastecimiento & Google Calendar Webhook
apiRouter.get('/agenda', agendaController.getAgenda);
apiRouter.post('/agenda', agendaController.addAgenda);
apiRouter.put('/agenda/:id', agendaController.updateAgenda);
apiRouter.delete('/agenda/:id', agendaController.deleteAgenda);

// Webhook simulador/receptor
apiRouter.post('/webhook/google-calendar', (req, res) => {
  console.log('📡 Webhook Google Calendar recibido:', req.body);
  res.json({
    ok: true,
    recibido: true,
    timestamp: new Date().toISOString(),
    mensaje: 'Evento procesado correctamente en webhook de Google Calendar'
  });
});

// Consola Inteligente de Papelito (Gemini AI + Voz)
apiRouter.post('/papelito/chat', papelitoController.chat);

// Estado de la Base de Datos y Conexión MongoDB Atlas
apiRouter.get('/database/status', (req, res) => {
  const status = db.getDatabaseStatus();
  res.json({ ok: true, status });
});

apiRouter.post('/database/test', async (req, res) => {
  const { uri } = req.body;
  const result = await db.testMongoConnection(uri);
  res.json(result);
});
