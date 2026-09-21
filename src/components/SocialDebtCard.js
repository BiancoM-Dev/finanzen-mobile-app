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
import { formatCurrency, parseCurrencyInput } from '../utils/currencyFormatter';
import { sendFriendlyWhatsAppReminder } from '../utils/whatsappHelper';
import { useFinance } from '../context/FinanceContext';
import { SocialDebtType } from '../models/types';
import { ReceiptViewerModal } from './Modals/ReceiptViewerModal';

export const SocialDebtCard = ({ item, onPay, onDelete }) => {
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
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.personWrap}>
          <View
            style={[
              styles.avatarWrap,
              { backgroundColor: isTheyOweMe ? '#ECFDF5' : '#FEF2F2' },
            ]}
          >
            <Ionicons
              name={isTheyOweMe ? 'arrow-down-outline' : 'arrow-up-outline'}
              size={18}
              color={isTheyOweMe ? '#10B981' : '#EF4444'}
            />
          </View>
          <View>
            <Text style={styles.personName}>{item.personName}</Text>
            <Text style={styles.typeLabel}>
              {isTheyOweMe ? 'Me debe' : 'Le debo'} • {item.date}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.conceptText}>{item.concept}</Text>

      <View style={styles.amountBox}>
        <View>
          <Text style={styles.amountLabel}>Saldo pendiente</Text>
          <Text
            style={[
              styles.remainingAmount,
              { color: isPaid ? '#10B981' : isTheyOweMe ? '#059669' : '#DC2626' },
            ]}
          >
            {isPaid ? '¡Saldado!' : formatCurrency(remaining)}
          </Text>
        </View>

        {item.paidAmount > 0 && !isPaid && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amountLabel}>Abonado</Text>
            <Text style={styles.paidSub}>
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
            style={styles.payBtn}
            onPress={() => {
              setPayAmountText(remaining.toString());
              setShowPayModal(true);
            }}
          >
            <Ionicons name="checkmark-done" size={16} color="#3B82F6" />
            <Text style={styles.payBtnText}>
              {isTheyOweMe ? 'Registrar Abono' : 'Pagar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal para registrar abono/pago */}
      <Modal visible={showPayModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isTheyOweMe ? '¿Cuánto te transfirieron?' : '¿Cuánto vas a pagar?'}
            </Text>
            <Text style={styles.modalSub}>
              {item.personName} - {item.concept}
            </Text>

            <View style={styles.modalInputWrap}>
              <Text style={styles.modalPrefix}>$</Text>
              <TextInput
                style={styles.modalInput}
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
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  personWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  typeLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  deleteBtn: {
    padding: 4,
  },
  conceptText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  paidSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
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
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  whatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  payBtnText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 14,
  },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4B5563',
    marginRight: 6,
  },
  modalInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    paddingVertical: 8,
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
    color: '#6B7280',
    fontWeight: '600',
  },
  modalConfirm: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
