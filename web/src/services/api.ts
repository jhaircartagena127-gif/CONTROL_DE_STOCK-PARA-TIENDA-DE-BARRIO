import { Producto, MetricasResponse, AgendaPedido, Proveedor, MovimientoStock, AlertaStock, AlertaVencimiento } from '../types/inventory.ts';

export const api = {
  // Productos
  async getProductos(params?: { categoria?: string; proveedor?: string; search?: string; estadoAlerta?: string }): Promise<{ ok: boolean; productos: Producto[] }> {
    const searchParams = new URLSearchParams();
    if (params?.categoria) searchParams.append('categoria', params.categoria);
    if (params?.proveedor) searchParams.append('proveedor', params.proveedor);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.estadoAlerta) searchParams.append('estadoAlerta', params.estadoAlerta);

    const res = await fetch(`/api/productos?${searchParams.toString()}`);
    return res.json();
  },

  async addProducto(data: Partial<Producto>): Promise<{ ok: boolean; producto: Producto; mensaje?: string; error?: string }> {
    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateProducto(id: string, data: Partial<Producto>): Promise<{ ok: boolean; producto: Producto; mensaje?: string; error?: string }> {
    const res = await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateStockRapido(id: string, options: { cambio?: number; nuevoStock?: number; motivo?: string }): Promise<{ ok: boolean; producto: Producto; mensaje?: string; error?: string }> {
    const res = await fetch(`/api/productos/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    return res.json();
  },

  async deleteProducto(id: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Alertas & Métricas
  async getAlertas(): Promise<{
    ok: boolean;
    totalAlertas: number;
    alertasStock: AlertaStock[];
    alertasVencimiento: AlertaVencimiento[];
  }> {
    const res = await fetch('/api/alertas');
    return res.json();
  },

  async getMetricas(): Promise<{ ok: boolean; metricas: MetricasResponse }> {
    const res = await fetch('/api/metricas');
    return res.json();
  },

  // Agenda & Google Calendar
  async getAgenda(): Promise<{ ok: boolean; agenda: AgendaPedido[] }> {
    const res = await fetch('/api/agenda');
    return res.json();
  },

  async addAgenda(data: Partial<AgendaPedido>): Promise<{ ok: boolean; cita: AgendaPedido; error?: string }> {
    const res = await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateAgenda(id: string, data: Partial<AgendaPedido>): Promise<{ ok: boolean; cita: AgendaPedido }> {
    const res = await fetch(`/api/agenda/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteAgenda(id: string): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/agenda/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Proveedores & Historial
  async getProveedores(): Promise<{ ok: boolean; proveedores: Proveedor[] }> {
    const res = await fetch('/api/proveedores');
    return res.json();
  },

  async getHistorial(): Promise<{ ok: boolean; historial: MovimientoStock[] }> {
    const res = await fetch('/api/historial');
    return res.json();
  },

  async resetData(): Promise<{ ok: boolean; mensaje: string }> {
    const res = await fetch('/api/system/reset', { method: 'POST' });
    return res.json();
  },

  // Papelito Asistente AI
  async chatPapelito(mensaje: string, historial: any[] = []): Promise<{
    ok: boolean;
    respuesta: string;
    accion?: any;
    metricas?: MetricasResponse;
    error?: string;
  }> {
    const res = await fetch('/api/papelito/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje, historial }),
    });
    return res.json();
  },

  // Webhook Test
  async triggerWebhookTest(payload: any): Promise<any> {
    const res = await fetch('/api/webhook/google-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Base de Datos & MongoDB Atlas
  async getDatabaseStatus(): Promise<{
    ok: boolean;
    status: {
      type: 'mongodb_atlas' | 'postgresql' | 'local_json';
      isConnected: boolean;
      isAtlas: boolean;
      hasUriConfigured: boolean;
      uriMasked: string;
      dbName: string;
      errorMessage: string | null;
      itemCount: { productos: number; agenda: number; proveedores: number };
    };
  }> {
    const res = await fetch('/api/database/status');
    return res.json();
  },

  async testDatabaseConnection(uri: string): Promise<{ ok: boolean; message: string; dbName?: string }> {
    const res = await fetch('/api/database/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    return res.json();
  }
};
