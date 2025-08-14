"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { CustomInput } from "../components/CustomInput";
import { CustomButton } from "../components/CustomButton";
import { Colors } from "../constants/colors";
import type { LoginForm } from "../types";
import { loginSchema } from "../utils/validation";
import { StorageService } from "../utils/storage";

interface LoginScreenProps {
  navigation: any;
  onLogin: (user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
  onLogin,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    try {
      // Simular validación de credenciales
      if (data.email === "admin@textil.com" && data.password === "123456") {
        const user = {
          id: "1",
          name: "Administrador",
          email: data.email,
          role: "admin" as const,
        };

        await StorageService.saveCurrentUser(user);
        onLogin(user);
      } else {
        // Verificar usuarios registrados
        const users = await StorageService.getRegisteredUsers();
        const foundUser = users.find((user) => user.email === data.email);

        if (foundUser) {
          await StorageService.saveCurrentUser(foundUser);
          onLogin(foundUser);
        } else {
          Alert.alert(
            "Error de inicio de sesión",
            "Las credenciales ingresadas son incorrectas. Verifica tu correo y contraseña."
          );
        }
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="shirt" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Gestión Textil</Text>
        <Text style={styles.subtitle}>
          Inicia sesión para gestionar pedidos
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Correo Electrónico"
              placeholder="admin@textil.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              isPassword
            />
          )}
        />

        <CustomButton
          title="Iniciar Sesión"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.loginButton}
        />

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
});
