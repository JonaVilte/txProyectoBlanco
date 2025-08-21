export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "employee"
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface Order {
  id: string
  employeeName: string
  issueDate: string
  status: "entregado" | "en_proceso" | "produccion" | "finalizada" | "cancelado"
  details: string
}

export interface DatabaseUser {
  id: string
  nombre: string
  email: string
  created_at: string
}

export interface SupabaseResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface DatabaseError {
  type: string
  message: string
  details?: string
}
