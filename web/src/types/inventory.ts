export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  precio_compra: number;
  precio_venta: number;
  fecha_vencimiento: string;
  proveedor: string;
  unidad_medida: string;
  activo: boolean;
  actualizado_en?: string;
}

export interface AlertaStock {
  producto: Producto;
  motivo: string;
  nivel: 'critico_rojo';
  deficiencia: number;
}

export interface AlertaVencimiento {
  producto: Producto;
  motivo: string;
  nivel: 'advertencia_amarillo';
  dias_restantes: number;
}

export interface MetricasResponse {
  valorInvertidoTotal: number;
  valorVentaTotal: number;
  gananciaProyectada: number;
  cantidadProductos: number;
  unidadesTotales: number;
  alertasActivas: number;
  alertasCriticasStock: number;
  alertasVencimientoProximo: number;
}

export interface AgendaPedido {
  id: string;
  proveedor: string;
  fecha: string;
  hora: string;
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
  tipo: string;
  cantidad_anterior: number;
  cantidad_nueva: number;
  diferencia: number;
  fecha: string;
  motivo: string;
}
