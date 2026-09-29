# FinanZen - Gestor de Gastos Personales, Deudas y Metas de Ahorro

**FinanZen** es una aplicación móvil nativa diseñada principalmente para **Android** (desarrollada con **React Native + Expo**). Ayuda a llevar un control financiero estricto y sin estrés en el hogar, gestionando gastos fijos clasificados, deudas formales, préstamos y favores informales con recordatorios automáticos por WhatsApp, y metas de ahorro con fotos motivacionales e interactividad.

---

## Características Principales

### 1. Dashboard & Balance Financiero General
- **Saldo Disponible Real:** Ingreso mensual menos la suma de todas las deudas, servicios obligatorios y suscripciones.
- **Alertas de Vencimientos Próximos:** Detección automática de cuentas y cuotas que vencen en los próximos 7 días con códigos de color de advertencia.
- **Acciones Rápidas:** Botones directos para agregar deudas, cuentas, metas o favores.
- **Distribución Gráfica:** Resumen visual de cuánto dinero se destina a cada categoría fija.

### 2. Gastos Fijos Categorizados
- **Deudas Formales (Préstamos, Tarjetas de Crédito, Créditos de Consumo/Automotriz):**
  - Monto total, saldo pendiente y valor de cuota mensual.
  - Barra de progreso interactiva (ej. `Cuota 8 de 24 pagadas`).
  - **Abono de Cuotas con Comprobante Opcional:** Al registrar un pago, puedes adjuntar una captura o foto del comprobante de transferencia desde tu galería o cámara.
  - Historial de pagos y visualizador a pantalla completa de comprobantes adjuntos.
- **Cuentas Obligatorias del Hogar (Luz, Agua, Gas, Internet, Arriendo):**
  - Fecha de corte/vencimiento mensual.
  - Toggle rápido: `Pagado` / `Pendiente`.
  - **División de Cuentas del Hogar ("Split"):** Si una persona centraliza el pago de las cuentas y los demás miembros transfieren su parte, permite dividir la cuenta (ej. Luz dividida entre 2 o más personas), haciendo seguimiento individual de quién ya depositó y quién tiene el pago pendiente.
- **Gastos Personales Recurrentes (Suscripciones y Membresías):**
  - Streaming (Netflix, Spotify), gimnasio (SmartFit), seguros, etc.
  - Switch para pausar o activar suscripciones y ver su impacto en el presupuesto.

### 3. Módulo "Cuentas Claras" (Préstamos a Amigos y Familiares)
- **Me Deben (Cuentas por cobrar):** Registro de favores cotidianos (*"Compra de carne para el asado"*, *"Entrada de concierto"*, *"Favor de farmacia"*).
- **Le Debo a Alguien:** Registro de favores recibidos para no olvidar devolver el dinero.
- **📲 Recordatorio Amigable por WhatsApp en 1 Clic:**
  - Envía un mensaje educado predefinido por WhatsApp.
  - **Incluye automáticamente los datos de tu cuenta bancaria preferida**, eliminando excusas de *"pásame tus datos"*.

### 4. Metas de Ahorro con Gamificación Visual (ej. Comprar una Moto)
- **Foto Real de tu Meta:** Carga una foto de tu meta (desde tu galería o tomándola con la cámara) para mantenerla visible todos los días.
- **Barra de Progreso y Porcentajes:** Muestra el avance del ahorro en tiempo real.
- **Aportes Progresivos:** Registra depósitos con fecha y notas motivacionales.
- **Hitos e Insignias:** Desbloqueo visual de medallas al 25%, 50%, 75% y 100%.
- **Frases Motivacionales Dinámicas:** Mensajes que cambian según tu porcentaje de avance.

### 5. Perfil de Usuario y Billetera de Cuentas Bancarias
- **Billetera Multicuentas con Orden de Preferencia:**
  - Registra cuentas bancarias (BancoEstado, Santander, Mercado Pago, Billeteras digitales, etc.).
  - Marca tu cuenta **Preferida #1** para recordatorios.
  - **Copiar Datos en 1 Clic:** Botón directo para copiar todos los datos de transferencia al portapapeles.
- **Preparación para Firebase (Fase 2):**
  - Arquitectura desacoplada en `src/services/storageService.js`.
  - Botón de vinculación con Google preparado para conectar con Firebase Authentication y Cloud Firestore para sincronización multiusuario y gastos compartidos en pareja.

---

## Tecnologías Utilizadas

- **Framework:** [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 57)
- **Lenguaje:** JavaScript moderno / React 19
- **Iconografía:** `@expo/vector-icons` (Ionicons)
- **Persistencia Local:** `@react-native-async-storage/async-storage` (Local-first)
- **Cámara y Galería:** `expo-image-picker`
- **Portapapeles:** `expo-clipboard`

---

## Cómo Probar la Aplicación en tu Celular Android

1. **Instala Expo Go en tu celular Android:**
   - Descarga la app gratuita **Expo Go** desde Google Play Store.
2. **Asegúrate de que tu celular y tu PC estén en la misma red Wi-Fi.**
3. **Inicia el servidor de desarrollo:**
   Abre una terminal en la carpeta del proyecto y ejecuta:
   ```bash
   cd d:\proyectos\finanzen-app
   npx expo start
   ```
4. **Escanea el código QR:**
   - Abre la app **Expo Go** en tu celular y pulsa *"Scan QR code"*.
   - Escanea el código QR que aparecerá en tu terminal o en el navegador.
   - ¡Listo! La app se compilará y abrirá directamente en tu celular Android en tiempo real.

---

## Cómo Subir este Proyecto a GitHub (Guía Paso a Paso)

Sigue estos sencillos pasos desde la terminal de tu computadora:

### Paso 1: Crea el repositorio en GitHub
1. Ingresa a tu cuenta en [github.com/new](https://github.com/new).
2. Asigna un nombre al repositorio, por ejemplo: `finanzen-app`.
3. Selecciona si deseas que sea **Público** o **Privado**.
4. **IMPORTANTE:** Deja desmarcadas las casillas *"Add a README file"*, *"Add .gitignore"* y *"Choose a license"* (ya están creados en tu proyecto local).
5. Haz clic en **Create repository**.

### Paso 2: Inicializa Git y sube el código desde PowerShell
Abre PowerShell en tu computadora y ejecuta:

```powershell
# 1. Ve a la carpeta del proyecto
cd d:\proyectos\finanzen-app

# 2. Inicializa Git localmente
git init

# 3. Establece la rama principal como main
git branch -M main

# 4. Agrega todos los archivos del proyecto
git add .

# 5. Guarda tu primer commit
git commit -m "feat: initial commit - FinanZen mobile app for debts, household bills and goals"

# 6. Conecta tu repositorio local con tu repositorio remoto de GitHub
# (Reemplaza TU_USUARIO y TU_REPOSITORIO con tus datos reales de GitHub)
git remote add origin https://github.com/TU_USUARIO/finanzen-app.git

# 7. Sube tu código a GitHub
git push -u origin main
```

*(Si usas autenticación por token personal o SSH, introduce tus credenciales de GitHub cuando la consola te lo solicite).*

---

## Fase 2: Conexión con Firebase (Próximo Paso)

Cuando desees activar el uso compartido en tiempo real con tu pareja o familia:
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Habilita **Authentication** (Google Sign-In) y **Cloud Firestore**.
3. Reemplaza las claves en [firebaseConfig.js](src/services/firebaseConfig.js).
4. Todas las funciones de datos en `storageService.js` están listas para cambiar el backend local por los documentos de Firestore sin alterar las pantallas ni componentes.
