"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import type { User, DatabaseProduct } from "../types";
import { StorageService } from "../utils/storage";
import { databaseService } from "../utils/database";

interface DashboardScreenProps {
  user: User;
  onLogout: () => void;
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onLogout,
  navigation,
}) => {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await databaseService.getProducts();
      if (result.success && result.products) {
        setProducts(result.products);
      } else {
        Alert.alert(
          "Error",
          result.error?.message || "No se pudieron cargar los productos"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await StorageService.logout();
            onLogout();
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Animated.View
      entering={FadeInDown.delay(200)}
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      </View>
    </Animated.View>
  );

  const MenuOption = ({ title, subtitle, icon, onPress }: any) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={24} color={Colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
    </TouchableOpacity>
  );

  const ProductCard = ({ item }: { item: DatabaseProduct }) => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.nombre}</Text>
        <Text style={styles.productPrice}>${item.precio.toFixed(2)}</Text>
      </View>

      {item.descripcion && (
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
      )}

      <View style={styles.productDetails}>
        <View style={styles.productTag}>
          <Ionicons name="pricetag" size={14} color={Colors.primary} />
          <Text style={styles.productTagText}>
            {item.categoria || "Sin categoría"}
          </Text>
        </View>

        <View style={styles.productTag}>
          <Ionicons name="cube" size={14} color={Colors.warning} />
          <Text style={styles.productTagText}>Stock: {item.stock}</Text>
        </View>
      </View>

      {(item.talla || item.color) && (
        <View style={styles.productAttributes}>
          {item.talla && (
            <View style={styles.attributeTag}>
              <Text style={styles.attributeText}>Talla: {item.talla}</Text>
            </View>
          )}
          {item.color && (
            <View style={styles.attributeTag}>
              <Text style={styles.attributeText}>Color: {item.color}</Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
    >
      <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Bienvenido,</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>
              {user.role === "admin" ? "Administrador" : "Empleado"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Pedidos Hoy"
          value="12"
          icon="receipt-outline"
          color={Colors.primary}
        />
        <StatCard
          title="En Proceso"
          value="8"
          icon="time-outline"
          color={Colors.warning}
        />
        <StatCard
          title="Completados"
          value="45"
          icon="checkmark-circle-outline"
          color={Colors.success}
        />
        <StatCard
          title="Productos"
          value={products.length.toString()}
          icon="cube-outline"
          color={Colors.secondary}
        />
      </View>

      <Animated.View
        entering={FadeInDown.delay(400)}
        style={styles.menuContainer}
      >
        <Text style={styles.sectionTitle}>Gestión de Pedidos</Text>

        <MenuOption
          title="Crear Pedido"
          subtitle="Crear un nuevo pedido de cliente"
          icon="add-circle-outline"
          onPress={() => navigation.navigate("CreateOrder")}
        />

        <MenuOption
          title="Ver Pedidos"
          subtitle="Consultar todos los pedidos registrados"
          icon="list-outline"
          onPress={() => navigation.navigate("Orders")}
        />

        <MenuOption
          title="Asignar Empleado"
          subtitle="Asignar pedidos a empleados"
          icon="person-outline"
          onPress={() => Alert.alert("Próximamente", "Función en desarrollo")}
        />

        <MenuOption
          title="Reportes"
          subtitle="Ver estadísticas y reportes de ventas"
          icon="bar-chart-outline"
          onPress={() => Alert.alert("Próximamente", "Función en desarrollo")}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(600)}
        style={styles.productsContainer}
      >
        <View style={styles.productsHeader}>
          <Text style={styles.sectionTitle}>Productos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddProduct")}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {loading && products.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="cube-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>No hay productos registrados</Text>
            <Text style={styles.emptySubtext}>
              Agrega tu primer producto para comenzar
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  userRole: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  statTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  productsContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  productDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  productTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productTagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  productAttributes: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  attributeTag: {
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attributeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
});

export default DashboardScreen;
