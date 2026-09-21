import { Linking, Alert } from 'react-native';
import { formatCurrency } from './currencyFormatter';

/**
 * Genera y envía un recordatorio de cobro amigable por WhatsApp
 * @param {Object} params
 * @param {string} params.personName - Nombre de la persona a cobrar
 * @param {string} params.concept - Motivo o favor realizado
 * @param {number} params.amount - Monto adeudado
 * @param {Object} [params.primaryBank] - Cuenta bancaria preferida del usuario
 * @param {string} [params.phoneNumber] - Número de teléfono (opcional)
 */
export const sendFriendlyWhatsAppReminder = async ({
  personName,
  concept,
  amount,
  primaryBank,
  phoneNumber = '',
}) => {
  const formattedAmount = formatCurrency(amount);
  
  let bankDetailsText = '';
  if (primaryBank) {
    bankDetailsText = `\n\n📌 *Mis datos de transferencia:*\n` +
      `• *Banco:* ${primaryBank.bankName}\n` +
      `• *Tipo de cuenta:* ${primaryBank.accountType}\n` +
      `• *N° de cuenta:* ${primaryBank.accountNumber}\n` +
      `• *Titular:* ${primaryBank.holderName || 'Yo'}\n` +
      (primaryBank.rutOrId ? `• *RUT/ID:* ${primaryBank.rutOrId}\n` : '') +
      (primaryBank.aliasOrCvu ? `• *Alias / CVU:* ${primaryBank.aliasOrCvu}\n` : '');
  }

  const message = `¡Hola ${personName}! Espero que estés muy bien 😊\n\n` +
    `Te escribo para recordarte con cariño que quedó pendiente lo de *${concept}* por *${formattedAmount}*.\n` +
    `Cuando puedas me transfieres por favor.${bankDetailsText}\n\n` +
    `¡Muchas gracias y que tengas excelente día!`;

  const encodedMessage = encodeURIComponent(message);
  
  // Limpiar número si viene formateado
  const cleanPhone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
  
  const url = cleanPhone
    ? `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`
    : `whatsapp://send?text=${encodedMessage}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Intentar fallback vía web de WhatsApp
      const webUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
        : `https://wa.me/?text=${encodedMessage}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    Alert.alert(
      'No se pudo abrir WhatsApp',
      'Verifica que tengas la aplicación de WhatsApp instalada en tu teléfono.'
    );
  }
};
