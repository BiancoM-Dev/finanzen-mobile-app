/**
 * Formateador de moneda configurable
 * Por defecto adapta formato monetario latinoamericano / chileno ($ 1.250.000)
 */

export const formatCurrency = (amount, currencySymbol = '$') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currencySymbol} 0`;
  }

  // Redondear a enteros si no hay decimales relevantes
  const rounded = Math.round(Number(amount));
  
  // Formato con separadores de miles
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${currencySymbol} ${formatted}`;
};

export const parseCurrencyInput = (text) => {
  // Limpia cualquier carácter que no sea número
  const cleaned = text.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
};
