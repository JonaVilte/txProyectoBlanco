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
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { Colors } from "../constants/colors"
import type { PedidoCompleto } from "../types"
import { databaseService } from "../utils/database"

const OrdersScreen = () => {
  const navigation = useNavigation()
  const [orders, setOrders] = useState<PedidoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("todos")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const statusOptions = [
    { key: "todos", label: "Todos", color: Colors.foreground },
    { key: "pendiente", label: "Pendiente", color: Colors.secondary },
    { key: "en_proceso", label: "En Proceso", color: Colors.primary },
    { key: "completado", label: "Completado", color: Colors.accent },
    { key: "cancelado", label: "Cancelado", color: Colors.destructive },
  ]

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const result = await databaseService.getOrders()
      if (result.success && result.pedidos) {
        setOrders(result.pedidos)
      } else {
        Alert.alert("Error", result.error?.message || "No se pudieron cargar los pedidos")
      }
    } catch (error) {
      Alert.alert("Error", "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "pendiente" | "en_proceso" | "completado" | "cancelado",
  ) => {
    try {
      const result = await databaseService.updateOrderStatus(orderId, newStatus)
      if (result.success) {
        // Actualizar el estado local
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, estado: newStatus } : order)))
        Alert.alert("Éxito", "Estado del pedido actualizado")
      } else {
        Alert.alert("Error", result.error?.message || "No se pudo actualizar el estado")
      }
    } catch (error) {
      Alert.alert("Error", "Error al actualizar estado del pedido")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find((option) => option.key === status)
    return statusOption?.color || Colors.foreground
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente":
        return "time-outline"
      case "en_proceso":
        return "sync-outline"
      case "completado":
        return "checkmark-circle-outline"
      case "cancelado":
        return "close-circle-outline"
      default:
        return "help-circle-outline"
    }
  }

  const filteredOrders = orders.filter((order) => (selectedStatus === "todos" ? true : order.estado === selectedStatus))

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const showStatusChangeOptions = (order: PedidoCompleto) => {
    const options = statusOptions
      .filter((option) => option.key !== "todos" && option.key !== order.estado)
      .map((option) => ({
        text: option.label,
        onPress: () => updateOrderStatus(order.id, option.key as any),
      }))

    options.push({ text: "Cancelar", onPress: async () => {} })

    Alert.alert("Cambiar Estado", "Selecciona el nuevo estado del pedido:", options)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Filtros de estado */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterButton, selectedStatus === option.key && styles.filterButtonActive]}
            onPress={() => setSelectedStatus(option.key)}
          >
            <Text style={[styles.filterButtonText, selectedStatus === option.key && styles.filterButtonTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de pedidos */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={Colors.mutedForeground} />
            <Text style={styles.emptyText}>No hay pedidos</Text>
            <Text style={styles.emptySubtext}>
              {selectedStatus === "todos"
                ? "Aún no se han creado pedidos"
                : `No hay pedidos con estado "${statusOptions.find((s) => s.key === selectedStatus)?.label}"`}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Header del pedido */}
              <TouchableOpacity style={styles.orderHeader} onPress={() => toggleOrderExpansion(order.id)}>
                <View style={styles.orderHeaderLeft}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderUser}>Para: {order.usuario?.nombre || "Usuario no encontrado"}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.fecha_emision)}</Text>
                    <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.estado) + "20" }]}>
                    <Ionicons
                      name={getStatusIcon(order.estado) as any}
                      size={16}
                      color={getStatusColor(order.estado)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(order.estado) }]}>
                      {statusOptions.find((s) => s.key === order.estado)?.label || order.estado}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderHeaderRight}>
                  <TouchableOpacity style={styles.statusChangeButton} onPress={() => showStatusChangeOptions(order)}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <Ionicons
                    name={expandedOrder === order.id ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={Colors.mutedForeground}
                  />
                </View>
              </TouchableOpacity>

              {/* Detalles del pedido (expandible) */}
              {expandedOrder === order.id && (
                <View style={styles.orderDetails}>
                  {order.observaciones && (
                    <View style={styles.observationsContainer}>
                      <Text style={styles.observationsLabel}>Observaciones:</Text>
                      <Text style={styles.observationsText}>{order.observaciones}</Text>
                    </View>
                  )}

                  <Text style={styles.productsLabel}>Productos:</Text>
                  {order.detalles.map((detalle) => (
                    <View key={detalle.id} style={styles.productItem}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{detalle.producto.nombre}</Text>
                        <Text style={styles.productDescription}>
                          {detalle.producto.categoria} • {detalle.producto.talla} • {detalle.producto.color}
                        </Text>
                      </View>
                      <View style={styles.productQuantityPrice}>
                        <Text style={styles.productQuantity}>x{detalle.cantidad}</Text>
                        <Text style={styles.productPrice}>${detalle.subtotal.toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Botón flotante para crear nuevo pedido */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("CreateOrder" as never)}>
        <Ionicons name="add" size={24} color={Colors.background} />
      </TouchableOpacity>
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
  filtersContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    height: 50,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.foreground,
  },
  filterButtonTextActive: {
    color: Colors.background,
  },
  content: {
    flex: 1,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.foreground,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.mutedForeground,
    textAlign: "center",
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderInfo: {
    marginBottom: 8,
  },
  orderUser: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.mutedForeground,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  orderHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusChangeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + "20",
  },
  orderDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  observationsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.secondary + "20",
    borderRadius: 8,
  },
  observationsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 4,
  },
  observationsText: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  productsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.foreground,
    marginBottom: 12,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + "50",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.foreground,
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  productQuantityPrice: {
    alignItems: "flex-end",
  },
  productQuantity: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})

export default OrdersScreen
