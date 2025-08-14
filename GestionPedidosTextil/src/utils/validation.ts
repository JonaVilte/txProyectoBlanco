import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  email: yup
    .string()
    .required("El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .matches(/(?=.*[0-9])/, "La contraseña debe contener al menos un número"),
  confirmPassword: yup
    .string()
    .required("Confirma tu contraseña")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
});
