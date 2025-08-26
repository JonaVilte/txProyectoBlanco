"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

import { CustomInput } from "../components/CustomInput"
import  CustomButton  from "../components/CustomButton"
import { Colors } from "../constants/colors"
import type { RegisterForm } from "../types"
import { registerSchema } from "../utils/validation"
import { databaseService } from "../utils/database"

interface RegisterScreenProps {
  navigation: any
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)

    try {
      const result = await databaseService.registerUser(data)

      if (result.success) {
        Alert.alert("Registro exitoso", "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ])
      } else {
        Alert.alert("Error de registro", result.error?.message || "Ocurrió un error al registrar la cuenta")
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al registrar la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="person-add" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Completa todos los campos para registrarte</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Nombre Completo"
              placeholder="Ingresa tu nombre completo"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
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
              placeholder="Mínimo 6 caracteres con números"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              isPassword
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              isPassword
            />
          )}
        />

        <CustomButton
          title="Crear Cuenta"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.registerButton}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
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
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
})
