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
import { useTheme } from '../context/ThemeContext';

export const BankAccountCard = ({ account, onSetPrimary, onDelete }) => {
  const { colors, isDark } = useTheme();
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
    <View
      style={[
        styles.card,
        {
          backgroundColor: isPrimary
            ? isDark
              ? '#1E1B4B'
              : '#F5F3FF'
            : colors.surface,
          borderColor: isPrimary ? colors.primary : colors.border,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isPrimary
                  ? colors.primary
                  : colors.surfaceSubtle,
              },
            ]}
          >
            <Ionicons
              name="card"
              size={18}
              color={isPrimary ? '#FFFFFF' : colors.textSecondary}
            />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.bankName, { color: colors.textPrimary }]}>
                {account.bankName}
              </Text>
              {isPrimary && (
                <View
                  style={[
                    styles.primaryBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.2)'
                        : '#FEF3C7',
                    },
                  ]}
                >
                  <Text style={styles.primaryBadgeText}>⭐ Preferida #1</Text>
                </View>
              )}
            </View>
            <Text style={[styles.accountType, { color: colors.textMuted }]}>
              {account.accountType}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.accountDetails,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : colors.surfaceSubtle,
          },
        ]}
      >
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
            N° Cuenta:
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {account.accountNumber}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
            Titular:
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {account.holderName}
          </Text>
        </View>
        {account.rutOrId ? (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              RUT / ID:
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {account.rutOrId}
            </Text>
          </View>
        ) : null}
        {account.aliasOrCvu ? (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              Alias / CVU:
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {account.aliasOrCvu}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        {!isPrimary ? (
          <TouchableOpacity
            style={styles.setPrimaryBtn}
            onPress={() => onSetPrimary(account)}
          >
            <Ionicons name="star-outline" size={14} color={colors.primary} />
            <Text style={[styles.setPrimaryText, { color: colors.primary }]}>
              Marcar Principal
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.activeLabel, { color: colors.textMuted }]}>
            Se envía automáticamente en WhatsApp
          </Text>
        )}

        <TouchableOpacity
          style={[styles.copyBtn, { backgroundColor: colors.primary }]}
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
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    padding: 10,
    borderRadius: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  accountType: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  accountDetails: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '700',
  },
  activeLabel: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
