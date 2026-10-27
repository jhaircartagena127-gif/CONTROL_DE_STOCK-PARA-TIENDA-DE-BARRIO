import { Request, Response } from 'express';
import { db } from '../config/db.ts';

export const productoController = {
  // Obtener lista completa con filtros
  getProductos(req: Request, res: Response) {
    try {
      const { categoria, proveedor, search, estadoAlerta } = req.query;
      let productos = db.getProductos();

      if (categoria && typeof categoria === 'string' && categoria !== 'Todas') {
        productos = productos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
      }

      if (proveedor && typeof proveedor === 'string' && proveedor !== 'Todos') {
        productos = productos.filter(p => p.proveedor.toLowerCase().includes(proveedor.toLowerCase()));
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase().trim();
        productos = productos.filter(p =>
          p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.proveedor.toLowerCase().includes(q)
        );
      }

      if (estadoAlerta === 'stock_bajo') {
        productos = productos.filter(p => p.stock_actual <= p.stock_minimo);
      }

      res.json({
        ok: true,
        total: productos.length,
        productos
      });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Alertas Automatizadas (Rojo: stock <= stock_minimo; Amarillo: vencimiento < 15 días)
  getAlertas(req: Request, res: Response) {
    try {
      const alertas = db.getAlertas();
      res.json({
        ok: true,
        ...alertas
      });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Métricas rápidas del Dashboard
  getMetricas(req: Request, res: Response) {
    try {
      const metricas = db.getMetricas();
      res.json({
        ok: true,
        metricas
      });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Crear producto
  addProducto(req: Request, res: Response) {
    try {
      const { nombre, categoria, sku, stock_actual, stock_minimo, precio_compra, precio_venta, fecha_vencimiento, proveedor, unidad_medida } = req.body;

      if (!nombre || stock_actual === undefined || stock_minimo === undefined) {
        return res.status(400).json({ ok: false, error: 'Nombre, stock actual y stock mínimo son obligatorios.' });
      }

      const nuevo = db.addProducto({
        nombre: String(nombre).trim(),
        categoria: categoria || 'Varios',
        sku: sku || `SKU-${Date.now().toString().slice(-5)}`,
        stock_actual: Number(stock_actual),
        stock_minimo: Number(stock_minimo),
        precio_compra: Number(precio_compra) || 0,
        precio_venta: Number(precio_venta) || 0,
        fecha_vencimiento: fecha_vencimiento || '',
        proveedor: proveedor || 'Sin asignar',
        unidad_medida: unidad_medida || 'unidades',
        activo: true
      });

      res.status(201).json({ ok: true, producto: nuevo, mensaje: 'Producto creado exitosamente' });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Actualizar producto completo
  updateProducto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const actualizado = db.updateProducto(id, updates);

      if (!actualizado) {
        return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
      }

      res.json({ ok: true, producto: actualizado, mensaje: 'Producto actualizado' });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Modificación rápida de stock (+1, -1, o valor fijado)
  updateStockRapido(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { cambio, nuevoStock, motivo } = req.body;
      const prod = db.getProductoById(id);

      if (!prod) {
        return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
      }

      let targetStock = prod.stock_actual;
      if (cambio !== undefined) {
        targetStock = Math.max(0, prod.stock_actual + Number(cambio));
      } else if (nuevoStock !== undefined) {
        targetStock = Math.max(0, Number(nuevoStock));
      }

      const actualizado = db.updateProducto(id, { stock_actual: targetStock }, motivo || 'Ajuste rápido desde interfaz');

      res.json({
        ok: true,
        producto: actualizado,
        mensaje: `Stock actualizado a ${targetStock} ${prod.unidad_medida}`
      });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Eliminar producto
  deleteProducto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const eliminado = db.deleteProducto(id);
      if (!eliminado) {
        return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
      }
      res.json({ ok: true, mensaje: 'Producto eliminado correctamente' });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Proveedores
  getProveedores(req: Request, res: Response) {
    try {
      res.json({ ok: true, proveedores: db.getProveedores() });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Historial de movimientos
  getHistorial(req: Request, res: Response) {
    try {
      res.json({ ok: true, historial: db.getHistorial() });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  // Reiniciar datos de demo
  resetData(req: Request, res: Response) {
    try {
      db.resetDemoData();
      res.json({ ok: true, mensaje: 'Base de datos restaurada con datos demo' });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
};
