"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { databaseService } from "../utils/database";

import { CustomInput } from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { Colors } from "../constants/colors";
import type { AddProductForm } from "../types";

const schema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre del producto es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: yup
    .string()
    .required("La descripción es obligatoria")
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  precio: yup
    .string()
    .required("El precio es obligatorio")
    .matches(/^\d+(\.\d{1,2})?$/, "Ingresa un precio válido (ej: 25.99)"),
  stock: yup
    .string()
    .required("El stock es obligatorio")
    .matches(/^\d+$/, "El stock debe ser un número entero"),
  categoria: yup.string().required("La categoría es obligatoria"),
  talla: yup.string().required("La talla es obligatoria"),
  color: yup.string().required("El color es obligatorio"),
});

interface AddProductScreenProps {
  navigation: any;
}

const AddProductScreen: React.FC<AddProductScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddProductForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: AddProductForm) => {
    setLoading(true);
    try {
      const result = await databaseService.addProduct(data);

      if (result.success) {
        Alert.alert(
          "Producto agregado",
          `${data.nombre} ha sido agregado exitosamente`,
          [
            {
              text: "Agregar otro",
              onPress: () => reset(),
            },
            {
              text: "Ver productos",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          result.error?.message || "No se pudo agregar el producto"
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo agregar el producto. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={styles.header}
        >
          <Ionicons name="add-circle" size={60} color={Colors.primary} />
          <Text style={styles.title}>Agregar Producto</Text>
          <Text style={styles.subtitle}>
            Completa la información del nuevo producto
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(1000).springify()}
          style={styles.form}
        >
          <Controller
            control={control}
            name="nombre"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Nombre del producto"
                placeholder="Nombre del producto"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.nombre?.message}
                icon="pricetag"
              />
            )}
          />

          <Controller
            control={control}
            name="descripcion"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Descripción"
                placeholder="Descripción del producto"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.descripcion?.message}
                icon="document-text"
                multiline
                numberOfLines={3}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="precio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Precio"
                    placeholder="Precio"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.precio?.message}
                    icon="cash"
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>

            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="stock"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Stock"
                    placeholder="Stock"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.stock?.message}
                    icon="cube"
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="categoria"
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label="Categoría"
                placeholder="Categoría (ej: Camisas, Pantalones, Vestidos)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.categoria?.message}
                icon="grid"
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="talla"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Talla"
                    placeholder="Talla (S, M, L, XL)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.talla?.message}
                    icon="resize"
                  />
                )}
              />
            </View>

            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="color"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Color"
                    placeholder="Color"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.color?.message}
                    icon="color-palette"
                  />
                )}
              />
            </View>
          </View>

          <CustomButton
            title="Agregar Producto"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitButton}
          />

          <CustomButton
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.cancelButton}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default AddProductScreen;
