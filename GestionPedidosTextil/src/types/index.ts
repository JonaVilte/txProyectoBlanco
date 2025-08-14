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
