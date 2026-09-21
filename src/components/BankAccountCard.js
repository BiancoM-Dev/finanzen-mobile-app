import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export const BankAccountCard = ({ account, onSetPrimary, onDelete }) => {
  const isPrimary = account.isPrimary;

  const copyToClipboard = async () => {
    const textToCopy = `*Datos de Transferencia*\n` +
      `Banco: ${account.bankName}\n` +
      `Tipo de Cuenta: ${account.accountType}\n` +
      `N° de Cuenta: ${account.accountNumber}\n` +
      `Titular: ${account.holderName}\n` +
      (account.rutOrId ? `RUT/ID: ${account.rutOrId}\n` : '') +
      (account.aliasOrCvu ? `Alias/CVU: ${account.aliasOrCvu}\n` : '');

    await Clipboard.setStringAsync(textToCopy);
    Alert.alert('¡Copiado!', 'Datos bancarios copiados al portapapeles listos para enviar.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar cuenta bancaria',
      `¿Deseas eliminar la cuenta de ${account.bankName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(account.id) },
      ]
    );
  };

  return (
    <View style={[styles.card, isPrimary && styles.cardPrimary]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: isPrimary ? '#EEF2FF' : '#F3F4F6' },
            ]}
          >
            <Ionicons
              name="business-outline"
              size={20}
              color={isPrimary ? '#4F46E5' : '#4B5563'}
            />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.bankName}>{account.bankName}</Text>
              {isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>⭐ Preferida #1</Text>
                </View>
              )}
            </View>
            <Text style={styles.accountType}>{account.accountType}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.accountDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>N° Cuenta:</Text>
          <Text style={styles.detailValue}>{account.accountNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Titular:</Text>
          <Text style={styles.detailValue}>{account.holderName}</Text>
        </View>
        {account.rutOrId ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>RUT / ID:</Text>
            <Text style={styles.detailValue}>{account.rutOrId}</Text>
          </View>
        ) : null}
        {account.aliasOrCvu ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Alias / CVU:</Text>
            <Text style={styles.detailValue}>{account.aliasOrCvu}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        {!isPrimary ? (
          <TouchableOpacity
            style={styles.setPrimaryBtn}
            onPress={() => onSetPrimary(account)}
          >
            <Ionicons name="star-outline" size={14} color="#4F46E5" />
            <Text style={styles.setPrimaryText}>Marcar como Principal</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.activeLabel}>Se usa para recordatorios de WhatsApp</Text>
        )}

        <TouchableOpacity
          style={styles.copyBtn}
          onPress={copyToClipboard}
          activeOpacity={0.8}
        >
          <Ionicons name="copy-outline" size={14} color="#FFFFFF" />
          <Text style={styles.copyBtnText}>Copiar Datos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardPrimary: {
    borderColor: '#C7D2FE',
    backgroundColor: '#FAFAFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    padding: 8,
    borderRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  primaryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  accountType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  accountDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setPrimaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  activeLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
