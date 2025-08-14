import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../types";

const USER_KEY = "@user";
const USERS_KEY = "@users";

export const StorageService = {
  // Guardar usuario actual
  async saveCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
    }
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },

  // Guardar usuarios registrados
  async saveRegisteredUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users:", error);
    }
  },

  // Obtener usuarios registrados
  async getRegisteredUsers(): Promise<User[]> {
    try {
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  },
};
