import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { formatCurrency, parseCurrencyInput } from '../../utils/currencyFormatter';

export const PayDebtModal = ({ visible, debt, onClose, onConfirmPayment }) => {
  if (!debt) return null;

  const nextInstallmentNum = (debt.paidInstallments || 0) + 1;
  const suggestedAmount = debt.monthlyAmount || 0;

  const [amountText, setAmountText] = useState(suggestedAmount.toString());
  const [notes, setNotes] = useState('');
  const [receiptUri, setReceiptUri] = useState(null);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Se requiere permiso de acceso a fotos para adjuntar el comprobante.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error seleccionando imagen:', err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Se requiere permiso de cámara para fotografiar el comprobante.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error tomando foto:', err);
    }
  };

  const handleSubmit = () => {
    const parsedAmount = parseCurrencyInput(amountText);
    if (parsedAmount <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto válido a pagar.');
      return;
    }

    onConfirmPayment({
      amount: parsedAmount,
      notes,
      receiptUri,
    });

    // Limpiar estado
    setNotes('');
    setReceiptUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Registrar Pago de Cuota</Text>
              <Text style={styles.subtitle}>{debt.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Resumen de cuota */}
            <View style={styles.infoBox}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Cuota a pagar</Text>
                <Text style={styles.infoValue}>
                  #{nextInstallmentNum} de {debt.totalInstallments}
                </Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Saldo restante</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(debt.remainingAmount)}
                </Text>
              </View>
            </View>

            {/* Input de monto */}
            <Text style={styles.inputLabel}>Monto a pagar</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={amountText}
                onChangeText={setAmountText}
              />
            </View>

            {/* Nota opcional */}
            <Text style={styles.inputLabel}>Nota o referencia (opcional)</Text>
            <TextInput
              style={[styles.textInputFull, { height: 44 }]}
              placeholder="Ej. Transferencia BancoEstado #9842"
              value={notes}
              onChangeText={setNotes}
            />

            {/* Adjuntar comprobante opcional */}
            <Text style={styles.inputLabel}>Comprobante de pago (Opcional)</Text>
            {receiptUri ? (
              <View style={styles.receiptPreviewContainer}>
                <Image source={{ uri: receiptUri }} style={styles.receiptThumb} />
                <View style={styles.receiptActions}>
                  <Text style={styles.receiptSuccessText}>
                    ✓ Captura adjunta correctamente
                  </Text>
                  <TouchableOpacity
                    style={styles.removeReceiptBtn}
                    onPress={() => setReceiptUri(null)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={styles.removeReceiptText}>Quitar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.receiptButtonsRow}>
                <TouchableOpacity
                  style={styles.attachBtn}
                  onPress={handlePickImage}
                >
                  <Ionicons name="images-outline" size={18} color="#3B82F6" />
                  <Text style={styles.attachBtnText}>Elegir de Galería</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attachBtn}
                  onPress={handleTakePhoto}
                >
                  <Ionicons name="camera-outline" size={18} color="#3B82F6" />
                  <Text style={styles.attachBtnText}>Tomar Foto</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Botón confirmar */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Confirmar Pago de Cuota</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  infoCol: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4B5563',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    paddingVertical: 10,
  },
  textInputFull: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  receiptButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  attachBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 12,
  },
  attachBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  receiptPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    gap: 12,
    marginBottom: 16,
  },
  receiptThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  receiptActions: {
    flex: 1,
  },
  receiptSuccessText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  removeReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeReceiptText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
