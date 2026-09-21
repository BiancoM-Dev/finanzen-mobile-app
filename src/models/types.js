/**
 * Tipos y esquemas de datos para FinanZen
 * Diseñado con compatibilidad directa para Firebase Cloud Firestore
 */

export const DebtCategory = {
  PRESTAMO_BANCARIO: 'Préstamo Bancario',
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  CREDITO_CONSUMO: 'Crédito de Consumo',
  AUTOMOTRIZ: 'Crédito Automotriz',
  HIPOTECARIO: 'Hipotecario',
  OTRO: 'Otro',
};

export const BillCategory = {
  LUZ: 'Luz',
  AGUA: 'Agua',
  GAS: 'Gas',
  INTERNET: 'Internet / Telefonía',
  ARRIENDO: 'Arriendo / Gastos Comunes',
  OTRO: 'Otro Servicio',
};

export const SubscriptionCategory = {
  STREAMING: 'Streaming (Netflix, Spotify, etc.)',
  GIMNASIO: 'Gimnasio / Deportes',
  SOFTWARE: 'Software / Nube',
  SEGUROS: 'Seguros',
  OTRO: 'Otro',
};

export const SocialDebtType = {
  THEY_OWE_ME: 'THEY_OWE_ME', // Me deben dinero (Cuenta por cobrar)
  I_OWE_THEM: 'I_OWE_THEM',   // Le debo a alguien (Cuenta por pagar)
};

export const AccountType = {
  CORRIENTE: 'Cuenta Corriente',
  VISTA_RUT: 'Cuenta Vista / RUT',
  AHORRO: 'Cuenta de Ahorro',
  BILLETERA_DIGITAL: 'Billetera Digital (Mercado Pago, Mach, Tenpo, etc.)',
  OTRA: 'Otra',
};
