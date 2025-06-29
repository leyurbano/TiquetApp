// src/types/index.ts

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Common UI Props
export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
}

// Navigation types (can be extended as needed)
export interface NavigationProps {
  navigation: any;
  route: any;
}

// Database Types

// User info
export interface UserInfo {
  id: string;
  full_name: string;
  phone?: string;
  role: 'proveedor' | 'vendedor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  description?: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  requiere_refrigeracion: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Movimiento de inventario
export interface MovimientoInventario {
  id: string;
  product_id: string;
  tipo_movimiento: 'venta' | 'devolucion' | 'ajuste' | 'merma';
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo?: string;
  creado_por?: string;
  created_at: string;
}

// Pedido
export interface Pedido {
  id: string;
  numero_pedido: string;
  fecha_pedido: string;
  subtotal: number;
  total: number;
  estado: 'pendiente' | 'entregado' | 'cancelado';
  vendedor_id?: string;
  tendero_id?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

// Pedido Item
export interface PedidoItem {
  id: string;
  pedido_id: string;
  product_id: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
}

// Pago
export interface Pago {
  id: string;
  pedido_id: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: 'efectivo' | 'transferencia';
  notas?: string;
}

// Crédito Tendero
export interface CreditoTendero {
  id: string;
  tendero_id: string;
  limite_credito: number;
  saldo_actual: number;
  dias_credito: number;
  updated_at: string;
}

// Extended Product with relationships
export interface ProductWithDetails extends Product {
  created_by_info?: UserInfo;
  stock_movements?: MovimientoInventario[];
}

// Extended Pedido with relationships
export interface PedidoWithDetails extends Pedido {
  items?: (PedidoItem & { product?: Product })[];
  pagos?: Pago[];
  vendedor?: UserInfo;
  tendero?: UserInfo;
}
