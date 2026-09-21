import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccountType } from '../../models/types';

export const AddBankAccountModal = ({ visible, onClose, onSave }) => {
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState(AccountType.VISTA_RUT);
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [rutOrId, setRutOrId] = useState('');
  const [aliasOrCvu, setAliasOrCvu] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const handleSubmit = () => {
    if (!bankName.trim()) {
      Alert.alert('Falta información', 'Ingresa el nombre del banco o billetera.');
      return;
    }
    if (!accountNumber.trim()) {
      Alert.alert('Falta información', 'Ingresa el número de cuenta.');
      return;
    }
    if (!holderName.trim()) {
      Alert.alert('Falta información', 'Ingresa el nombre del titular.');
      return;
    }

    const newAccount = {
      id: `bank_${Date.now()}`,
      bankName: bankName.trim(),
      accountType,
      accountNumber: accountNumber.trim(),
      holderName: holderName.trim(),
      rutOrId: rutOrId.trim(),
      aliasOrCvu: aliasOrCvu.trim(),
      isPrimary,
      orderPriority: isPrimary ? 1 : 99,
    };

    onSave(newAccount);

    // Reset
    setBankName('');
    setAccountNumber('');
    setHolderName('');
    setRutOrId('');
    setAliasOrCvu('');
    setIsPrimary(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva Cuenta Bancaria 💳</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Banco o Institución</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. BancoEstado, Banco Santander, Mercado Pago"
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={styles.label}>Tipo de Cuenta</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {Object.values(AccountType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, accountType === type && styles.chipActive]}
                  onPress={() => setAccountType(type)}
                >
                  <Text style={[styles.chipText, accountType === type && styles.chipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>N° de Cuenta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 12345678"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={styles.label}>Nombre del Titular</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre y Apellido"
              value={holderName}
              onChangeText={setHolderName}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>RUT / DNI</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 12.345.678-9"
                  value={rutOrId}
                  onChangeText={setRutOrId}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Alias / CVU (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="mi.alias.pago"
                  value={aliasOrCvu}
                  onChangeText={setAliasOrCvu}
                />
              </View>
            </View>

            {/* Toggle Principal */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>⭐ Marcar como Cuenta Preferida #1</Text>
                <Text style={styles.switchSub}>
                  Se utilizará automáticamente en los mensajes de cobro de WhatsApp.
                </Text>
              </View>
              <Switch
                value={isPrimary}
                onValueChange={setIsPrimary}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={isPrimary ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Ionicons name="card" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Guardar Cuenta</Text>
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
  card: {
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
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#4F46E5',
  },
  chipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  switchSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    paddingRight: 8,
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
