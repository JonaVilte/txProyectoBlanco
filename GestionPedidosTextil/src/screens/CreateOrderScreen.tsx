"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { Colors } from "../constants/colors"
import type { Product, CartItem, DatabaseUser } from "../types"
import { databaseService } from "../utils/database"
import CustomButton from "../components/CustomButton"

const CreateOrderScreen = () => {
  const navigation = useNavigation()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [observaciones, setObservaciones] = useState("")

  const [users, setUsers] = useState<DatabaseUser[]>([])
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    loadProducts()
    loadUsers()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const result = await databaseService.getProducts()
      if (result.success && result.products) {
        setProducts(result.products)
      } else {
        Alert.alert("Error", "No se pudieron cargar los productos")
      }
    } catch (error) {
      Alert.alert("Error", "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const result = await databaseService.getAllUsers()
      if (result.success && result.users) {
        setUsers(result.users)
      } else {
        Alert.alert("Error", "No se pudieron cargar los usuarios")
      }
    } catch (error) {
      Alert.alert("Error", "Error al cargar usuarios")
    } finally {
      setLoadingUsers(false)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.producto.id === product.id)

    if (existingItem) {
      if (existingItem.cantidad >= product.stock) {
        Alert.alert("Stock insuficiente", `Solo hay ${product.stock} unidades disponibles`)
        return
      }

      setCart(
        cart.map((item) =>
          item.producto.id === product.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * product.precio,
              }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          producto: product,
          cantidad: 1,
          subtotal: product.precio,
        },
      ])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.producto.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product && newQuantity > product.stock) {
      Alert.alert("Stock insuficiente", `Solo hay ${product.stock} unidades disponibles`)
      return
    }

    setCart(
      cart.map((item) =>
        item.producto.id === productId
          ? {
              ...item,
              cantidad: newQuantity,
              subtotal: newQuantity * item.producto.precio,
            }
          : item,
      ),
    )
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0)
  }

  const createOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Carrito vacío", "Agrega productos al carrito antes de crear el pedido")
      return
    }

    if (!selectedUser) {
      Alert.alert("Usuario requerido", "Debes seleccionar para quién es el pedido")
      return
    }

    try {
      setCreating(true)

      const usuarioId = selectedUser.id

      const result = await databaseService.createOrder(usuarioId, cart, observaciones)

      if (result.success) {
        Alert.alert(
          "Pedido creado",
          `Pedido creado exitosamente para ${selectedUser.nombre} por un total de $${getTotalAmount().toFixed(2)}`,
          [
            {
              text: "OK",
              onPress: () => {
                setCart([])
                setObservaciones("")
                setSelectedUser(null)
                navigation.goBack()
              },
            },
          ],
        )
      } else {
        Alert.alert("Error", result.error?.message || "No se pudo crear el pedido")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el pedido")
    } finally {
      setCreating(false)
    }
  }

  const selectUser = (user: DatabaseUser) => {
    setSelectedUser(user)
    setShowUserModal(false)
  }

  const renderUserItem = ({ item }: { item: DatabaseUser }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => selectUser(item)}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nombre}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Para quién es el pedido?</Text>
          <TouchableOpacity style={styles.userSelector} onPress={() => setShowUserModal(true)}>
            <View style={styles.userSelectorContent}>
              {selectedUser ? (
                <View>
                  <Text style={styles.selectedUserName}>{selectedUser.nombre}</Text>
                  <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Seleccionar usuario</Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={Colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Lista de productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos Disponibles</Text>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.nombre}</Text>
                <Text style={styles.productDescription}>{product.descripcion}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>${product.precio.toFixed(2)}</Text>
                  <Text style={styles.productStock}>Stock: {product.stock}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.addButton, product.stock === 0 && styles.addButtonDisabled]}
                onPress={() => addToCart(product)}
                disabled={product.stock === 0}
              >
                <Ionicons name="add" size={20} color={product.stock === 0 ? Colors.muted : Colors.background} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Carrito */}
        {cart.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Carrito de Compras</Text>
            {cart.map((item) => (
              <View key={item.producto.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.producto.nombre}</Text>
                  <Text style={styles.cartItemPrice}>
                    ${item.producto.precio.toFixed(2)} x {item.cantidad} = ${item.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                  >
                    <Ionicons name="remove" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.cantidad}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                  >
                    <Ionicons name="add" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.producto.id)}>
                    <Ionicons name="trash" size={16} color={Colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: ${getTotalAmount().toFixed(2)}</Text>
            </View>

            {/* Observaciones */}
            <View style={styles.observationsContainer}>
              <Text style={styles.observationsLabel}>Observaciones (opcional)</Text>
              <TextInput
                style={styles.observationsInput}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Agregar observaciones al pedido..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botón crear pedido */}
      {cart.length > 0 && (
        <View style={styles.footer}>
          <CustomButton
            title={creating ? "Creando pedido..." : "Crear Pedido"}
            onPress={createOrder}
            disabled={creating}
            style={styles.createButton}
          />
        </View>
      )}

      <Modal visible={showUserModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Usuario</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowUserModal(false)}>
              <Ionicons name="close" size={24} color={Colors.foreground} />
            </TouchableOpacity>
          </View>

          {loadingUsers ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Cargando usuarios...</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              style={styles.usersList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.foreground,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 16,
  },
  userSelector: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userSelectorContent: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 2,
  },
  selectedUserEmail: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.mutedForeground,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.foreground,
  },
  closeButton: {
    padding: 8,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  usersList: {
    flex: 1,
    padding: 16,
  },
  userItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  productCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  productStock: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    marginLeft: 12,
  },
  addButtonDisabled: {
    backgroundColor: Colors.muted,
  },
  cartItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 6,
    padding: 6,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.foreground,
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    backgroundColor: Colors.destructive + "20",
    borderRadius: 6,
    padding: 6,
    marginLeft: 8,
  },
  totalContainer: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: "center",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  observationsContainer: {
    marginTop: 16,
  },
  observationsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 8,
  },
  observationsInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.foreground,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
  },
})

export default CreateOrderScreen
