/**
 * Conexión y Gestión de Base de Datos para Control de Stock & Agenda (Tienda de Barrio)
 * Soporta conexión directa a MongoDB Atlas (en la nube o Docker) mediante la variable MONGODB_URI,
 * soporte PostgreSQL alternativo, y almacenamiento JSON persistente automático sin dependencias externas.
 */

import { MongoClient, Db } from 'mongodb';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  precio_compra: number;
  precio_venta: number;
  fecha_vencimiento: string; // YYYY-MM-DD
  proveedor: string;
  unidad_medida: string;
  activo: boolean;
  actualizado_en?: string;
}

export interface AgendaPedido {
  id: string;
  proveedor: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  contacto?: string;
  nota: string;
  productos_esperados?: string;
  monto_estimado?: number;
  estado: 'programado' | 'completado' | 'cancelado';
  google_calendar_url?: string;
  webhook_enviado: boolean;
  creado_en: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  categoria: string;
  dias_visita: string;
  direccion?: string;
}

export interface MovimientoStock {
  id: string;
  producto_id: string;
  producto_nombre: string;
  tipo: 'ajuste_manual' | 'pedido_recibido' | 'venta' | 'comando_terminal' | 'asistente_papelito';
  cantidad_anterior: number;
  cantidad_nueva: number;
  diferencia: number;
  fecha: string;
  motivo: string;
}

// Configuración de MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || '';
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;
let mongoError: string | null = null;

// Configuración de PostgreSQL
const isPgConfigured = Boolean(process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGDATABASE));

export const pool = isPgConfigured
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    })
  : null;

// Directorio base de proveedores para Bolivia
const INITIAL_PROVEEDORES: Proveedor[] = [
  {
    id: 'prov-1',
    nombre: 'PIL Andina / Lácteos',
    contacto: 'Carlos Mendoza',
    telefono: '+591 71234567',
    email: 'pedidos@pilandina.com.bo',
    categoria: 'Lácteos',
    dias_visita: 'Martes y Viernes (09:00 - 12:00)',
    direccion: 'Av. Blanco Galindo Km 10'
  },
  {
    id: 'prov-2',
    nombre: 'Embol S.A. (Coca-Cola / Fanta)',
    contacto: 'Mariana Ríos',
    telefono: '+591 72345678',
    email: 'preventa@embol.com.bo',
    categoria: 'Bebidas',
    dias_visita: 'Lunes y Jueves (11:00 - 15:00)',
    direccion: 'Parque Industrial Mz. 5'
  },
  {
    id: 'prov-3',
    nombre: 'Distribuidora La Paz (Abarrotes y Granos)',
    contacto: 'Jorge Quispe',
    telefono: '+591 73456789',
    email: 'distribuidoralapaz@bolivia.bo',
    categoria: 'Abarrotes',
    dias_visita: 'Miércoles (08:00 - 13:00)',
    direccion: 'Calle Mercado 450'
  },
  {
    id: 'prov-4',
    nombre: 'Panificadora San Gabriel',
    contacto: 'Lucía Fernández',
    telefono: '+591 74567890',
    email: 'despacho@sangabriel.com.bo',
    categoria: 'Panadería y Galletas',
    dias_visita: 'Lunes a Sábado (06:30 - 08:00)',
    direccion: 'Av. Kollasuyo 210'
  },
  {
    id: 'prov-5',
    nombre: 'Distribuidora Ola / Productos de Limpieza',
    contacto: 'Roberto Alva',
    telefono: '+591 75678901',
    email: 'ventas@olalimpieza.bo',
    categoria: 'Limpieza',
    dias_visita: 'Primer y tercer Viernes de cada mes',
    direccion: 'Av. Panamericana 1120'
  }
];

const INITIAL_PRODUCTOS: Producto[] = [];
const INITIAL_AGENDA: AgendaPedido[] = [];

// Almacén seguro en archivo / memoria
const DB_FILE_PATH = path.resolve(process.cwd(), '.papelito_db.json');

interface LocalDatabase {
  productos: Producto[];
  agenda_pedidos: AgendaPedido[];
  proveedores: Proveedor[];
  historial: MovimientoStock[];
}

function loadDatabase(): LocalDatabase {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.productos && Array.isArray(parsed.productos)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error al leer .papelito_db.json:', err);
  }

  // Fallback con datos limpios para tienda nueva (sin productos previos)
  const initialData: LocalDatabase = {
    productos: [],
    agenda_pedidos: [],
    proveedores: INITIAL_PROVEEDORES,
    historial: []
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: LocalDatabase): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar .papelito_db.json:', err);
  }
}

let dbCache: LocalDatabase = loadDatabase();

export const db = {
  // Inicialización de la base de datos (MongoDB Atlas / Postgres / JSON)
  async init(): Promise<void> {
    // 1. Probar conexión a MongoDB Atlas si está configurada la variable MONGODB_URI
    if (MONGODB_URI) {
      try {
        console.log('🍃 Conectando a MongoDB Atlas...');
        mongoClient = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        await mongoClient.connect();
        mongoDb = mongoClient.db();
        isMongoConnected = true;
        mongoError = null;
        console.log(`✅ Conexión establecida con MongoDB Atlas (Base de datos: "${mongoDb.databaseName}")`);

        // Sincronizar colección productos
        const prodCollection = mongoDb.collection<Producto>('productos');
        const prodCount = await prodCollection.countDocuments();
        if (prodCount > 0) {
          const docs = await prodCollection.find().toArray();
          dbCache.productos = docs.map(d => ({
            id: d.id || (d as any)._id?.toString() || 'prod-' + Date.now(),
            sku: d.sku || '',
            nombre: d.nombre || '',
            categoria: d.categoria || 'Varios',
            stock_actual: Number(d.stock_actual) || 0,
            stock_minimo: Number(d.stock_minimo) || 0,
            precio_compra: Number(d.precio_compra) || 0,
            precio_venta: Number(d.precio_venta) || 0,
            fecha_vencimiento: d.fecha_vencimiento || '',
            proveedor: d.proveedor || '',
            unidad_medida: d.unidad_medida || 'unid',
            activo: d.activo !== false,
            actualizado_en: d.actualizado_en
          }));
        } else if (dbCache.productos.length > 0) {
          await prodCollection.insertMany(dbCache.productos as any);
        }

        // Sincronizar colección agenda
        const agCollection = mongoDb.collection<AgendaPedido>('agenda_pedidos');
        const agCount = await agCollection.countDocuments();
        if (agCount > 0) {
          const docs = await agCollection.find().toArray();
          dbCache.agenda_pedidos = docs.map(d => ({
            id: d.id || (d as any)._id?.toString() || 'agd-' + Date.now(),
            proveedor: d.proveedor,
            fecha: d.fecha,
            hora: d.hora,
            contacto: d.contacto,
            nota: d.nota,
            productos_esperados: d.productos_esperados,
            monto_estimado: Number(d.monto_estimado) || 0,
            estado: d.estado || 'programado',
            google_calendar_url: d.google_calendar_url,
            webhook_enviado: d.webhook_enviado !== false,
            creado_en: d.creado_en || new Date().toISOString()
          }));
        } else if (dbCache.agenda_pedidos.length > 0) {
          await agCollection.insertMany(dbCache.agenda_pedidos as any);
        }

        saveDatabase(dbCache);
        return;
      } catch (err: any) {
        isMongoConnected = false;
        mongoError = err.message || 'Error al conectar con MongoDB Atlas';
        console.warn('⚠️ No se pudo conectar a MongoDB Atlas en este momento, usando motor local persistente:', mongoError);
      }
    }

    // 2. Fallback PostgreSQL si está configurado
    if (pool) {
      try {
        console.log('🔗 Conectando a PostgreSQL...');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS productos (
            id VARCHAR(50) PRIMARY KEY,
            sku VARCHAR(50) UNIQUE,
            nombre VARCHAR(255) NOT NULL,
            categoria VARCHAR(100) NOT NULL,
            stock_actual NUMERIC NOT NULL,
            stock_minimo NUMERIC NOT NULL,
            precio_compra NUMERIC NOT NULL,
            precio_venta NUMERIC NOT NULL,
            fecha_vencimiento DATE,
            proveedor VARCHAR(255),
            unidad_medida VARCHAR(50),
            activo BOOLEAN DEFAULT TRUE,
            actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ Tablas PostgreSQL inicializadas con éxito.');
      } catch (error) {
        console.warn('⚠️ No se pudo inicializar PostgreSQL, usando motor JSON de alta velocidad.');
      }
    } else {
      console.log('📦 Motor de datos activo: JSON DB Local con almacenamiento permanente.');
    }
  },

  // Consulta de estado de la base de datos para la interfaz de usuario
  getDatabaseStatus() {
    return {
      type: isMongoConnected ? 'mongodb_atlas' : (isPgConfigured ? 'postgresql' : 'local_json'),
      isConnected: isMongoConnected || (!MONGODB_URI && !isPgConfigured),
      isAtlas: isMongoConnected,
      hasUriConfigured: Boolean(process.env.MONGODB_URI),
      uriMasked: process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':••••••@')
        : '',
      dbName: isMongoConnected && mongoDb ? mongoDb.databaseName : 'tienda_papelito',
      errorMessage: mongoError,
      itemCount: {
        productos: dbCache.productos.length,
        agenda: dbCache.agenda_pedidos.length,
        proveedores: dbCache.proveedores.length
      }
    };
  },

  // Verificación en vivo de una URI de MongoDB Atlas
  async testMongoConnection(uri: string): Promise<{ ok: boolean; message: string; dbName?: string }> {
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
      return {
        ok: false,
        message: 'La cadena de conexión debe comenzar con "mongodb+srv://" o "mongodb://".'
      };
    }

    let testClient: MongoClient | null = null;
    try {
      testClient = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
      await testClient.connect();
      const admin = testClient.db().admin();
      await admin.ping();
      const dbName = testClient.db().databaseName || 'tienda_papelito';
      await testClient.close();
      return {
        ok: true,
        message: `¡Conexión verificada con éxito! Tu clúster de MongoDB Atlas respondió correctamente (Base de datos: ${dbName}).`,
        dbName
      };
    } catch (err: any) {
      if (testClient) {
        try { await testClient.close(); } catch {}
      }
      return {
        ok: false,
        message: `Fallo al conectar: ${err.message || 'Verifica tu usuario, contraseña y que en Network Access hayas autorizado 0.0.0.0/0.'}`
      };
    }
  },

  // PRODUCTOS
  getProductos(): Producto[] {
    return dbCache.productos;
  },

  getProductoById(id: string): Producto | undefined {
    return dbCache.productos.find(p => p.id === id);
  },

  addProducto(prodData: Omit<Producto, 'id' | 'actualizado_en'>): Producto {
    const nuevo: Producto = {
      ...prodData,
      id: 'prod-' + Date.now(),
      actualizado_en: new Date().toISOString()
    };
    dbCache.productos.unshift(nuevo);
    saveDatabase(dbCache);

    // Persistir asíncronamente en MongoDB Atlas si está conectado
    if (isMongoConnected && mongoDb) {
      mongoDb.collection('productos').insertOne(nuevo as any).catch(err => {
        console.error('Error insertando en MongoDB Atlas:', err);
      });
    }

    return nuevo;
  },

  updateProducto(id: string, updates: Partial<Producto>, motivo?: string): Producto | null {
    const idx = dbCache.productos.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const actual = dbCache.productos[idx];
    const prevStock = actual.stock_actual;

    const actualizado: Producto = {
      ...actual,
      ...updates,
      actualizado_en: new Date().toISOString()
    };

    if (updates.stock_actual !== undefined && updates.stock_actual !== prevStock) {
      db.registrarMovimiento({
        producto_id: actual.id,
        producto_nombre: actual.nombre,
        tipo: 'ajuste_manual',
        cantidad_anterior: prevStock,
        cantidad_nueva: updates.stock_actual,
        diferencia: updates.stock_actual - prevStock,
        fecha: new Date().toISOString(),
        motivo: motivo || 'Ajuste de inventario'
      });
    }

    dbCache.productos[idx] = actualizado;
    saveDatabase(dbCache);

    // Persistir asíncronamente en MongoDB Atlas si está conectado
    if (isMongoConnected && mongoDb) {
      mongoDb.collection('productos').updateOne({ id }, { $set: actualizado }, { upsert: true }).catch(err => {
        console.error('Error actualizando en MongoDB Atlas:', err);
      });
    }

    return actualizado;
  },

  deleteProducto(id: string): boolean {
    const prevLen = dbCache.productos.length;
    dbCache.productos = dbCache.productos.filter(p => p.id !== id);
    if (dbCache.productos.length !== prevLen) {
      saveDatabase(dbCache);

      if (isMongoConnected && mongoDb) {
        mongoDb.collection('productos').deleteOne({ id }).catch(err => {
          console.error('Error borrando en MongoDB Atlas:', err);
        });
      }
      return true;
    }
    return false;
  },

  // ALERTAS: productos con stock <= stock_minimo (ROJA) o vencimiento en menos de 15 días (AMARILLA)
  getAlertas() {
    const hoy = new Date('2026-10-14T12:00:00Z');

    const alertasStock: Array<{ producto: Producto; motivo: string; nivel: 'critico_rojo'; deficiencia: number }> = [];
    const alertasVencimiento: Array<{ producto: Producto; motivo: string; nivel: 'advertencia_amarillo'; dias_restantes: number }> = [];

    for (const prod of dbCache.productos) {
      // Alerta de stock mínimo (ROJA)
      if (prod.stock_actual <= prod.stock_minimo) {
        const deficiencia = prod.stock_minimo - prod.stock_actual;
        alertasStock.push({
          producto: prod,
          motivo: `Stock actual (${prod.stock_actual}) menor o igual al mínimo requerido (${prod.stock_minimo})`,
          nivel: 'critico_rojo',
          deficiencia
        });
      }

      // Alerta de vencimiento (AMARILLA)
      if (prod.fecha_vencimiento) {
        const fechaVenc = new Date(prod.fecha_vencimiento + 'T00:00:00Z');
        const diffMs = fechaVenc.getTime() - hoy.getTime();
        const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDias <= 15) {
          alertasVencimiento.push({
            producto: prod,
            motivo: diffDias < 0
              ? `¡PRODUCTO VENCIDO hace ${Math.abs(diffDias)} días!`
              : diffDias === 0
              ? '¡VENCE HOY!'
              : `Vence en ${diffDias} día${diffDias === 1 ? '' : 's'} (${prod.fecha_vencimiento})`,
            nivel: 'advertencia_amarillo',
            dias_restantes: diffDias
          });
        }
      }
    }

    return {
      totalAlertas: alertasStock.length + alertasVencimiento.length,
      alertasStock,
      alertasVencimiento
    };
  },

  // METRICAS RÁPIDAS
  getMetricas() {
    const productos = dbCache.productos;
    let valorInvertidoTotal = 0;
    let valorVentaTotal = 0;
    let unidadesTotales = 0;

    for (const p of productos) {
      valorInvertidoTotal += (p.stock_actual * p.precio_compra);
      valorVentaTotal += (p.stock_actual * p.precio_venta);
      unidadesTotales += p.stock_actual;
    }

    const { totalAlertas, alertasStock, alertasVencimiento } = db.getAlertas();

    return {
      valorInvertidoTotal: Math.round(valorInvertidoTotal * 100) / 100,
      valorVentaTotal: Math.round(valorVentaTotal * 100) / 100,
      gananciaProyectada: Math.round((valorVentaTotal - valorInvertidoTotal) * 100) / 100,
      cantidadProductos: productos.length,
      unidadesTotales,
      alertasActivas: totalAlertas,
      alertasCriticasStock: alertasStock.length,
      alertasVencimientoProximo: alertasVencimiento.length
    };
  },

  // AGENDA PEDIDOS
  getAgenda(): AgendaPedido[] {
    return [...dbCache.agenda_pedidos].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  },

  addAgenda(cita: Omit<AgendaPedido, 'id' | 'creado_en' | 'webhook_enviado'>): AgendaPedido {
    const id = 'agd-' + Date.now();
    
    // Generador de enlace directo a Google Calendar
    const tituloEncoded = encodeURIComponent(`Visita Proveedor: ${cita.proveedor} (Tienda)`);
    const detalleEncoded = encodeURIComponent(`Notas: ${cita.nota || ''}\nProductos: ${cita.productos_esperados || 'Por coordinar'}\nContacto: ${cita.contacto || ''}`);
    const fechaLimpia = cita.fecha.replace(/-/g, '');
    const horaLimpia = (cita.hora || '10:00').replace(':', '') + '00';
    const dates = `${fechaLimpia}T${horaLimpia}/${fechaLimpia}T${(parseInt(horaLimpia) + 10000).toString().padStart(6, '0')}`;
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${tituloEncoded}&dates=${dates}&details=${detalleEncoded}`;

    const nuevaCita: AgendaPedido = {
      ...cita,
      id,
      google_calendar_url: cita.google_calendar_url || gCalUrl,
      webhook_enviado: true,
      creado_en: new Date().toISOString()
    };

    dbCache.agenda_pedidos.unshift(nuevaCita);
    saveDatabase(dbCache);

    if (isMongoConnected && mongoDb) {
      mongoDb.collection('agenda_pedidos').insertOne(nuevaCita as any).catch(err => {
        console.error('Error insertando cita en MongoDB Atlas:', err);
      });
    }

    return nuevaCita;
  },

  updateAgenda(id: string, updates: Partial<AgendaPedido>): AgendaPedido | null {
    const idx = dbCache.agenda_pedidos.findIndex(a => a.id === id);
    if (idx === -1) return null;
    dbCache.agenda_pedidos[idx] = { ...dbCache.agenda_pedidos[idx], ...updates };
    saveDatabase(dbCache);

    if (isMongoConnected && mongoDb) {
      mongoDb.collection('agenda_pedidos').updateOne({ id }, { $set: updates }).catch(err => {
        console.error('Error actualizando cita en MongoDB Atlas:', err);
      });
    }

    return dbCache.agenda_pedidos[idx];
  },

  deleteAgenda(id: string): boolean {
    const prev = dbCache.agenda_pedidos.length;
    dbCache.agenda_pedidos = dbCache.agenda_pedidos.filter(a => a.id !== id);
    if (dbCache.agenda_pedidos.length !== prev) {
      saveDatabase(dbCache);

      if (isMongoConnected && mongoDb) {
        mongoDb.collection('agenda_pedidos').deleteOne({ id }).catch(err => {
          console.error('Error eliminando cita en MongoDB Atlas:', err);
        });
      }
      return true;
    }
    return false;
  },

  // PROVEEDORES
  getProveedores(): Proveedor[] {
    return dbCache.proveedores;
  },

  getProveedorByName(nombre: string): Proveedor | undefined {
    const search = nombre.toLowerCase().trim();
    return dbCache.proveedores.find(p => 
      p.nombre.toLowerCase().includes(search) || 
      p.categoria.toLowerCase().includes(search)
    );
  },

  // MOVIMIENTOS
  registrarMovimiento(mov: Omit<MovimientoStock, 'id'>): MovimientoStock {
    const nuevo: MovimientoStock = {
      ...mov,
      id: 'mov-' + Date.now()
    };
    dbCache.historial.unshift(nuevo);
    if (dbCache.historial.length > 100) {
      dbCache.historial = dbCache.historial.slice(0, 100);
    }
    saveDatabase(dbCache);

    if (isMongoConnected && mongoDb) {
      mongoDb.collection('historial').insertOne(nuevo as any).catch(err => {
        console.error('Error registrando movimiento en MongoDB Atlas:', err);
      });
    }

    return nuevo;
  },

  getHistorial(): MovimientoStock[] {
    return dbCache.historial;
  },

  // Reset demo data
  resetDemoData(): void {
    dbCache = {
      productos: INITIAL_PRODUCTOS,
      agenda_pedidos: INITIAL_AGENDA,
      proveedores: INITIAL_PROVEEDORES,
      historial: []
    };
    saveDatabase(dbCache);
  }
};
