import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, parseCurrencyInput } from '../utils/currencyFormatter';
import { sendFriendlyWhatsAppReminder } from '../utils/whatsappHelper';
import { useFinance } from '../context/FinanceContext';
import { SocialDebtType } from '../models/types';
import { ReceiptViewerModal } from './Modals/ReceiptViewerModal';

export const SocialDebtCard = ({ item, onPay, onDelete }) => {
  const { colors, isDark } = useTheme();
  const { primaryBankAccount } = useFinance();
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmountText, setPayAmountText] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const isTheyOweMe = item.type === SocialDebtType.THEY_OWE_ME;
  const remaining = Math.max(0, item.totalAmount - (item.paidAmount || 0));
  const isPaid = item.status === 'paid' || remaining <= 0;

  const handleRemindWhatsApp = () => {
    sendFriendlyWhatsAppReminder({
      personName: item.personName,
      concept: item.concept,
      amount: remaining,
      primaryBank: primaryBankAccount,
      phoneNumber: item.phone || '',
    });
  };

  const handleConfirmPay = () => {
    const parsed = parseCurrencyInput(payAmountText);
    if (parsed <= 0) {
      Alert.alert('Monto inválido', 'Ingresa el monto recibido o pagado.');
      return;
    }
    onPay(item.id, { amount: parsed });
    setShowPayModal(false);
    setPayAmountText('');
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar registro',
      `¿Deseas eliminar este registro de "${item.personName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.personWrap}>
          <View
            style={[
              styles.avatarWrap,
              {
                backgroundColor: isTheyOweMe ? colors.successLight : colors.dangerLight,
              },
            ]}
          >
            <Ionicons
              name={isTheyOweMe ? 'arrow-down' : 'arrow-up'}
              size={18}
              color={isTheyOweMe ? colors.success : colors.danger}
            />
          </View>
          <View>
            <Text style={[styles.personName, { color: colors.textPrimary }]}>
              {item.personName}
            </Text>
            <Text style={[styles.typeLabel, { color: colors.textMuted }]}>
              {isTheyOweMe ? 'Me debe' : 'Le debo'} • {item.date}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.conceptText,
          { backgroundColor: colors.surfaceSubtle, color: colors.textSecondary },
        ]}
      >
        {item.concept}
      </Text>

      <View style={styles.amountBox}>
        <View>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            Saldo pendiente
          </Text>
          <Text
            style={[
              styles.remainingAmount,
              {
                color: isPaid
                  ? colors.success
                  : isTheyOweMe
                  ? colors.success
                  : colors.danger,
              },
            ]}
          >
            {isPaid ? '¡Saldado!' : formatCurrency(remaining)}
          </Text>
        </View>

        {item.paidAmount > 0 && !isPaid && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
              Abonado
            </Text>
            <Text style={[styles.paidSub, { color: colors.textSecondary }]}>
              {formatCurrency(item.paidAmount)} de {formatCurrency(item.totalAmount)}
            </Text>
          </View>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsRow}>
        {isTheyOweMe && !isPaid && (
          <TouchableOpacity
            style={styles.whatsAppBtn}
            onPress={handleRemindWhatsApp}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
            <Text style={styles.whatsAppBtnText}>Recordar por WhatsApp</Text>
          </TouchableOpacity>
        )}

        {!isPaid && (
          <TouchableOpacity
            style={[
              styles.payBtn,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              setPayAmountText(remaining.toString());
              setShowPayModal(true);
            }}
          >
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
            <Text style={[styles.payBtnText, { color: colors.primary }]}>
              {isTheyOweMe ? 'Registrar Abono' : 'Pagar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal para registrar abono/pago */}
      <Modal visible={showPayModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {isTheyOweMe ? '¿Cuánto te transfirieron?' : '¿Cuánto vas a pagar?'}
            </Text>
            <Text style={[styles.modalSub, { color: colors.textMuted }]}>
              {item.personName} - {item.concept}
            </Text>

            <View
              style={[
                styles.modalInputWrap,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
            >
              <Text style={[styles.modalPrefix, { color: colors.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                value={payAmountText}
                onChangeText={setPayAmountText}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowPayModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: colors.primary }]}
                onPress={handleConfirmPay}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ReceiptViewerModal
        visible={!!viewingReceipt}
        imageUri={viewingReceipt}
        title={`Comprobante - ${item.personName}`}
        onClose={() => setViewingReceipt(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  personWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personName: {
    fontSize: 16,
    fontWeight: '800',
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  conceptText: {
    fontSize: 13,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    fontWeight: '500',
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  remainingAmount: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  paidSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  whatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  payBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalPrefix: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6,
  },
  modalInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    fontWeight: '600',
  },
  modalConfirm: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
