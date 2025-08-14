import type React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import type { User } from "../types";
import { StorageService } from "../utils/storage";

interface DashboardScreenProps {
  user: User;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onLogout,
}) => {
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
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
          title="Cancelados"
          value="2"
          icon="close-circle-outline"
          color={Colors.error}
        />
      </View>

      <Animated.View
        entering={FadeInDown.delay(400)}
        style={styles.menuContainer}
      >
        <Text style={styles.sectionTitle}>Gestión de Pedidos</Text>

        <MenuOption
          title="Registrar Pedido"
          subtitle="Crear un nuevo pedido de cliente"
          icon="add-circle-outline"
          onPress={() => Alert.alert("Próximamente", "Función en desarrollo")}
        />

        <MenuOption
          title="Ver Pedidos"
          subtitle="Consultar todos los pedidos registrados"
          icon="list-outline"
          onPress={() => Alert.alert("Próximamente", "Función en desarrollo")}
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
  },
});
