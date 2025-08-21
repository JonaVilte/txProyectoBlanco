import { supabase } from "./supabase"
import type { DatabaseUser, RegisterForm, LoginForm } from "../types"

export enum DatabaseErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface DatabaseError {
  type: DatabaseErrorType
  message: string
  details?: string
}

const handleDatabaseError = (error: any, context: string): DatabaseError => {
  console.log(`[v0] Database error in ${context}:`, error)

  // Error de red o conexión
  if (error.message?.includes("fetch") || error.message?.includes("network")) {
    return {
      type: DatabaseErrorType.NETWORK_ERROR,
      message: "Error de conexión. Verifica tu conexión a internet.",
      details: error.message,
    }
  }

  // Error de email duplicado
  if (error.message?.includes("duplicate") || error.code === "23505") {
    return {
      type: DatabaseErrorType.DUPLICATE_EMAIL,
      message: "El correo electrónico ya está registrado",
      details: error.message,
    }
  }

  // Error de validación
  if (error.message?.includes("violates") || error.code?.startsWith("23")) {
    return {
      type: DatabaseErrorType.VALIDATION_ERROR,
      message: "Los datos proporcionados no son válidos",
      details: error.message,
    }
  }

  return {
    type: DatabaseErrorType.UNKNOWN_ERROR,
    message: "Ocurrió un error inesperado. Intenta nuevamente.",
    details: error.message,
  }
}

const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from("usuarios").select("id").limit(1)
    return !error
  } catch {
    return false
  }
}

export const databaseService = {
  async testConnection(): Promise<{ success: boolean; error?: DatabaseError }> {
    try {
      const isConnected = await checkConnection()
      if (!isConnected) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.NETWORK_ERROR,
            message: "No se puede conectar a la base de datos",
          },
        }
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "testConnection"),
      }
    }
  },

  // Registrar nuevo usuario
  async registerUser(
    userData: RegisterForm,
  ): Promise<{ success: boolean; user?: DatabaseUser; error?: DatabaseError }> {
    try {
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error }
      }

      if (!userData.email || !userData.name || !userData.password) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "Todos los campos son obligatorios",
          },
        }
      }

      // Verificar si el email ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from("usuarios")
        .select("email")
        .eq("email", userData.email)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows found
        return {
          success: false,
          error: handleDatabaseError(checkError, "registerUser - email check"),
        }
      }

      if (existingUser) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.DUPLICATE_EMAIL,
            message: "El correo electrónico ya está registrado",
          },
        }
      }

      // Insertar nuevo usuario
      const { data, error } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre: userData.name,
            email: userData.email,
            password: userData.password, // En producción, hashear la contraseña
          },
        ])
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "registerUser - insert"),
        }
      }

      return {
        success: true,
        user: {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          created_at: data.created_at,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "registerUser"),
      }
    }
  },

  // Iniciar sesión
  async loginUser(credentials: LoginForm): Promise<{ success: boolean; user?: DatabaseUser; error?: DatabaseError }> {
    try {
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error }
      }

      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "Email y contraseña son obligatorios",
          },
        }
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", credentials.email)
        .eq("password", credentials.password) // En producción, verificar hash
        .single()

      if (error || !data) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.INVALID_CREDENTIALS,
            message: "Credenciales incorrectas",
          },
        }
      }

      return {
        success: true,
        user: {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          created_at: data.created_at,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "loginUser"),
      }
    }
  },

  // Obtener usuario por ID
  async getUserById(id: string): Promise<{ success: boolean; user?: DatabaseUser; error?: DatabaseError }> {
    try {
      if (!id) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "ID de usuario es requerido",
          },
        }
      }

      const { data, error } = await supabase.from("usuarios").select("*").eq("id", id).single()

      if (error || !data) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.USER_NOT_FOUND,
            message: "Usuario no encontrado",
          },
        }
      }

      return {
        success: true,
        user: {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          created_at: data.created_at,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "getUserById"),
      }
    }
  },
}
