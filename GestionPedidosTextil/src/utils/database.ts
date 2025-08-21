import { supabase } from "./supabase";
import type {
  DatabaseUser,
  RegisterForm,
  LoginForm,
  DatabaseProduct,
  AddProductForm,
  Pedido,
  CartItem,
  PedidoCompleto,
} from "../types";

export enum DatabaseErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  PRODUCT_ERROR = "PRODUCT_ERROR",
  ORDER_ERROR = "ORDER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface DatabaseError {
  type: DatabaseErrorType;
  message: string;
  details?: string;
}

const handleDatabaseError = (error: any, context: string): DatabaseError => {
  console.log(`[v0] Database error in ${context}:`, error);

  // Error de red o conexión
  if (error.message?.includes("fetch") || error.message?.includes("network")) {
    return {
      type: DatabaseErrorType.NETWORK_ERROR,
      message: "Error de conexión. Verifica tu conexión a internet.",
      details: error.message,
    };
  }

  // Error de email duplicado
  if (error.message?.includes("duplicate") || error.code === "23505") {
    return {
      type: DatabaseErrorType.DUPLICATE_EMAIL,
      message: "El correo electrónico ya está registrado",
      details: error.message,
    };
  }

  // Error de validación
  if (error.message?.includes("violates") || error.code?.startsWith("23")) {
    return {
      type: DatabaseErrorType.VALIDATION_ERROR,
      message: "Los datos proporcionados no son válidos",
      details: error.message,
    };
  }

  return {
    type: DatabaseErrorType.UNKNOWN_ERROR,
    message: "Ocurrió un error inesperado. Intenta nuevamente.",
    details: error.message,
  };
};

const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from("usuarios").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
};

export const databaseService = {
  async testConnection(): Promise<{ success: boolean; error?: DatabaseError }> {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.NETWORK_ERROR,
            message: "No se puede conectar a la base de datos",
          },
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "testConnection"),
      };
    }
  },

  // Registrar nuevo usuario
  async registerUser(
    userData: RegisterForm
  ): Promise<{ success: boolean; user?: DatabaseUser; error?: DatabaseError }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      if (!userData.email || !userData.name || !userData.password) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "Todos los campos son obligatorios",
          },
        };
      }

      // Verificar si el email ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from("usuarios")
        .select("email")
        .eq("email", userData.email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows found
        return {
          success: false,
          error: handleDatabaseError(checkError, "registerUser - email check"),
        };
      }

      if (existingUser) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.DUPLICATE_EMAIL,
            message: "El correo electrónico ya está registrado",
          },
        };
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
        .single();

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "registerUser - insert"),
        };
      }

      return {
        success: true,
        user: {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          created_at: data.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "registerUser"),
      };
    }
  },

  // Iniciar sesión
  async loginUser(
    credentials: LoginForm
  ): Promise<{ success: boolean; user?: DatabaseUser; error?: DatabaseError }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "Email y contraseña son obligatorios",
          },
        };
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", credentials.email)
        .eq("password", credentials.password) // En producción, verificar hash
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.INVALID_CREDENTIALS,
            message: "Credenciales incorrectas",
          },
        };
      }

      return {
        success: true,
        user: {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          created_at: data.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "loginUser"),
      };
    }
  },

  // Obtener usuario por ID
  async getUserById(
    id: string
  ): Promise<{ success: boolean; user?: DatabaseUser; error?: DatabaseError }> {
    try {
      if (!id) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "ID de usuario es requerido",
          },
        };
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.USER_NOT_FOUND,
            message: "Usuario no encontrado",
          },
        };
      }

      return {
        success: true,
        user: {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          created_at: data.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "getUserById"),
      };
    }
  },

  // Agregar nuevo producto
  async addProduct(
    productData: AddProductForm
  ): Promise<{
    success: boolean;
    product?: DatabaseProduct;
    error?: DatabaseError;
  }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      if (!productData.nombre || !productData.precio || !productData.stock) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "Nombre, precio y stock son obligatorios",
          },
        };
      }

      // Convertir precio y stock a números
      const precio = Number.parseFloat(productData.precio);
      const stock = Number.parseInt(productData.stock, 10);

      if (isNaN(precio) || precio <= 0) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "El precio debe ser un número válido mayor a 0",
          },
        };
      }

      if (isNaN(stock) || stock < 0) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "El stock debe ser un número válido mayor o igual a 0",
          },
        };
      }

      // Insertar nuevo producto
      const { data, error } = await supabase
        .from("productos")
        .insert([
          {
            nombre: productData.nombre,
            descripcion: productData.descripcion || null,
            precio: precio,
            stock: stock,
            categoria: productData.categoria || null,
            talla: productData.talla || null,
            color: productData.color || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "addProduct - insert"),
        };
      }

      return {
        success: true,
        product: data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "addProduct"),
      };
    }
  },

  // Obtener todos los productos
  async getProducts(): Promise<{
    success: boolean;
    products?: DatabaseProduct[];
    error?: DatabaseError;
  }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "getProducts"),
        };
      }

      return {
        success: true,
        products: data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "getProducts"),
      };
    }
  },

  // Obtener productos por categoría
  async getProductsByCategory(
    categoria: string
  ): Promise<{
    success: boolean;
    products?: DatabaseProduct[];
    error?: DatabaseError;
  }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("categoria", categoria)
        .order("created_at", { ascending: false });

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "getProductsByCategory"),
        };
      }

      return {
        success: true,
        products: data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "getProductsByCategory"),
      };
    }
  },

  // Actualizar stock de producto
  async updateProductStock(
    productId: string,
    newStock: number
  ): Promise<{
    success: boolean;
    product?: DatabaseProduct;
    error?: DatabaseError;
  }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      if (!productId || newStock < 0) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "ID del producto y stock válido son requeridos",
          },
        };
      }

      const { data, error } = await supabase
        .from("productos")
        .update({ stock: newStock })
        .eq("id", productId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "updateProductStock"),
        };
      }

      return {
        success: true,
        product: data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "updateProductStock"),
      };
    }
  },

  // Crear nuevo pedido
  async createOrder(
    usuarioId: string,
    cartItems: CartItem[],
    observaciones?: string
  ): Promise<{ success: boolean; pedido?: Pedido; error?: DatabaseError }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      if (!usuarioId || !cartItems || cartItems.length === 0) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "Usuario y productos son requeridos para crear un pedido",
          },
        };
      }

      // Calcular total
      const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

      // Crear el pedido principal
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            usuario_id: usuarioId,
            total: total,
            observaciones: observaciones || null,
          },
        ])
        .select()
        .single();

      if (pedidoError) {
        return {
          success: false,
          error: handleDatabaseError(
            pedidoError,
            "createOrder - pedido insert"
          ),
        };
      }

      // Crear los detalles del pedido
      const detallesData = cartItems.map((item) => ({
        pedido_id: pedidoData.id,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        subtotal: item.subtotal,
      }));

      const { error: detallesError } = await supabase
        .from("pedido_detalles")
        .insert(detallesData);

      if (detallesError) {
        // Si falla la inserción de detalles, eliminar el pedido creado
        await supabase.from("pedidos").delete().eq("id", pedidoData.id);
        return {
          success: false,
          error: handleDatabaseError(
            detallesError,
            "createOrder - detalles insert"
          ),
        };
      }

      // Actualizar stock de productos
      for (const item of cartItems) {
        const newStock = item.producto.stock - item.cantidad;
        await this.updateProductStock(item.producto.id, newStock);
      }

      return {
        success: true,
        pedido: pedidoData,
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "createOrder"),
      };
    }
  },

  // Obtener todos los pedidos
  async getOrders(): Promise<{
    success: boolean;
    pedidos?: PedidoCompleto[];
    error?: DatabaseError;
  }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      // Obtener pedidos con sus detalles y productos
      const { data, error } = await supabase
        .from("pedidos")
        .select(
          `
          *,
          detalles:pedido_detalles(
            *,
            producto:productos(*)
          )
        `
        )
        .order("fecha_emision", { ascending: false });

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "getOrders"),
        };
      }

      return {
        success: true,
        pedidos: data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "getOrders"),
      };
    }
  },

  // Obtener pedido por ID
  async getOrderById(
    pedidoId: string
  ): Promise<{
    success: boolean;
    pedido?: PedidoCompleto;
    error?: DatabaseError;
  }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      if (!pedidoId) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "ID del pedido es requerido",
          },
        };
      }

      const { data, error } = await supabase
        .from("pedidos")
        .select(
          `
          *,
          detalles:pedido_detalles(
            *,
            producto:productos(*)
          )
        `
        )
        .eq("id", pedidoId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.ORDER_ERROR,
            message: "Pedido no encontrado",
          },
        };
      }

      return {
        success: true,
        pedido: data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "getOrderById"),
      };
    }
  },

  // Actualizar estado del pedido
  async updateOrderStatus(
    pedidoId: string,
    nuevoEstado: "pendiente" | "en_proceso" | "completado" | "cancelado"
  ): Promise<{ success: boolean; pedido?: Pedido; error?: DatabaseError }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      if (!pedidoId || !nuevoEstado) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "ID del pedido y estado son requeridos",
          },
        };
      }

      const { data, error } = await supabase
        .from("pedidos")
        .update({ estado: nuevoEstado })
        .eq("id", pedidoId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "updateOrderStatus"),
        };
      }

      return {
        success: true,
        pedido: data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "updateOrderStatus"),
      };
    }
  },

  // Obtener pedidos por usuario
  async getOrdersByUser(
    usuarioId: string
  ): Promise<{
    success: boolean;
    pedidos?: PedidoCompleto[];
    error?: DatabaseError;
  }> {
    try {
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      if (!usuarioId) {
        return {
          success: false,
          error: {
            type: DatabaseErrorType.VALIDATION_ERROR,
            message: "ID del usuario es requerido",
          },
        };
      }

      const { data, error } = await supabase
        .from("pedidos")
        .select(
          `
          *,
          detalles:pedido_detalles(
            *,
            producto:productos(*)
          )
        `
        )
        .eq("usuario_id", usuarioId)
        .order("fecha_emision", { ascending: false });

      if (error) {
        return {
          success: false,
          error: handleDatabaseError(error, "getOrdersByUser"),
        };
      }

      return {
        success: true,
        pedidos: data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: handleDatabaseError(error, "getOrdersByUser"),
      };
    }
  },
};
