export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Order {
  id: string;
  employeeName: string;
  issueDate: string;
  status:
    | "entregado"
    | "en_proceso"
    | "produccion"
    | "finalizada"
    | "cancelado";
  details: string;
}

export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  talla?: string;
  color?: string;
  imagen_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AddProductForm {
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
  categoria: string;
  talla: string;
  color: string;
}

export interface DatabaseProduct {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  talla?: string;
  color?: string;
  imagen_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: string;
  nombre: string;
  email: string;
  created_at: string;
}

export interface SupabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DatabaseError {
  type: string;
  message: string;
  details?: string;
}

export interface Pedido {
  id: string;
  usuario_id: string;
  fecha_emision: string;
  estado: "pendiente" | "en_proceso" | "completado" | "cancelado";
  total: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoDetalle {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
}

export interface CartItem {
  producto: Product;
  cantidad: number;
  subtotal: number;
}

export interface CreateOrderForm {
  observaciones: string;
}

export interface PedidoCompleto extends Pedido {
  usuario: any;
  detalles: (PedidoDetalle & { producto: Product })[];
}
