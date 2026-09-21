/**
 * Configuración y Adaptador de Firebase para FinanZen (Fase 2)
 * 
 * Para activar la sincronización en la nube y compartir gastos en pareja:
 * 1. Crea un proyecto en Firebase Console (https://console.firebase.google.com).
 * 2. Habilita 'Authentication' (con Proveedor Google y Correo/Contraseña).
 * 3. Habilita 'Cloud Firestore' (en modo producción o prueba).
 * 4. Pega tus credenciales en el objeto firebaseConfig de abajo.
 * 
 * Toda la estructura de datos en 'storageService.js' fue diseñada para mapearse
 * 1:1 con las colecciones de Firestore:
 * - /users/{userId} -> Perfil y cuentas bancarias
 * - /users/{userId}/debts -> Deudas formales
 * - /users/{userId}/goals -> Metas de ahorro
 * - /shared_groups/{groupId}/bills -> Cuentas del hogar compartidas entre parejas
 */

export const firebaseConfig = {
  apiKey: "TU_API_KEY_DE_FIREBASE",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:android:abcdef"
};

export const FIREBASE_READY = false; // Cambiar a true cuando se instale firebase
