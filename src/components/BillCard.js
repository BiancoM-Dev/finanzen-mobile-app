import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { getDueAlertStatus } from '../utils/dateUtils';
import { sendFriendlyWhatsAppReminder } from '../utils/whatsappHelper';
import { useFinance } from '../context/FinanceContext';
import { ReceiptViewerModal } from './Modals/ReceiptViewerModal';

export const BillCard = ({ bill, onTogglePaid, onToggleSplitMember, onDelete }) => {
  const { colors, isDark } = useTheme();
  const { primaryBankAccount } = useFinance();
  const [showSplitDetails, setShowSplitDetails] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const dueStatus = getDueAlertStatus(bill.dueDay, bill.isPaid);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar cuenta',
      `¿Deseas eliminar la cuenta de ${bill.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(bill.id) },
      ]
    );
  };

  const handleRemindMember = (member) => {
    sendFriendlyWhatsAppReminder({
      personName: member.name,
      concept: `tu parte de la cuenta de ${bill.name}`,
      amount: member.amount,
      primaryBank: primaryBankAccount,
    });
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
      {/* Cabecera */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7' },
            ]}
          >
            <Ionicons name="flash-outline" size={20} color="#F59E0B" />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {bill.name}
            </Text>
            <Text style={[styles.category, { color: colors.textMuted }]}>
              {bill.category}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Monto y Estado */}
      <View style={styles.bodyRow}>
        <View>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Monto del mes
          </Text>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>
            {formatCurrency(bill.estimatedAmount)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.statusBadge,
            bill.isPaid
              ? {
                  backgroundColor: colors.successLight,
                  borderColor: colors.successBorder,
                }
              : {
                  backgroundColor: colors.warningLight,
                  borderColor: colors.warningBorder,
                },
          ]}
          onPress={() => onTogglePaid(bill.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={bill.isPaid ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={bill.isPaid ? colors.success : colors.warning}
          />
          <Text
            style={[
              styles.statusText,
              { color: bill.isPaid ? colors.successText : colors.warningText },
            ]}
          >
            {bill.isPaid ? 'Pagado' : 'Marcar Pagado'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Alerta de vencimiento y Split Toggle */}
      <View style={[styles.footerRow, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.dueBadge}>
          <Ionicons name="calendar-outline" size={14} color={dueStatus.color} />
          <Text style={[styles.dueText, { color: dueStatus.color }]}>
            {dueStatus.text}
          </Text>
        </View>

        {bill.isSplit && bill.splitMembers && bill.splitMembers.length > 0 && (
          <TouchableOpacity
            style={[
              styles.splitToggleBtn,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}
            onPress={() => setShowSplitDetails(!showSplitDetails)}
          >
            <Ionicons name="people-outline" size={14} color={colors.primary} />
            <Text style={[styles.splitToggleText, { color: colors.primary }]}>
              Dividida ({bill.splitMembers.filter((m) => m.isPaid).length}/
              {bill.splitMembers.length})
            </Text>
            <Ionicons
              name={showSplitDetails ? 'chevron-up' : 'chevron-down'}
              size={13}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Desglose de División del Hogar (Split) */}
      {bill.isSplit && showSplitDetails && bill.splitMembers && (
        <View
          style={[
            styles.splitBox,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.splitBoxTitle, { color: colors.textSecondary }]}>
            Miembros del hogar que aportan:
          </Text>
          {bill.splitMembers.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <Ionicons
                  name={member.isPaid ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={member.isPaid ? colors.success : colors.textMuted}
                />
                <View>
                  <Text style={[styles.memberName, { color: colors.textPrimary }]}>
                    {member.name}
                  </Text>
                  <Text style={[styles.memberAmount, { color: colors.textMuted }]}>
                    {formatCurrency(member.amount)}
                  </Text>
                </View>
              </View>

              <View style={styles.memberActions}>
                {!member.isPaid && (
                  <TouchableOpacity
                    style={styles.remindBtn}
                    onPress={() => handleRemindMember(member)}
                  >
                    <Ionicons name="logo-whatsapp" size={13} color="#059669" />
                    <Text style={styles.remindBtnText}>Cobrar</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.toggleMemberPaidBtn,
                    {
                      backgroundColor: member.isPaid
                        ? colors.success
                        : colors.surfaceElevated,
                      borderColor: colors.border,
                      borderWidth: member.isPaid ? 0 : 1,
                    },
                  ]}
                  onPress={() => onToggleSplitMember(bill.id, member.id)}
                >
                  <Text
                    style={[
                      styles.toggleMemberPaidText,
                      { color: member.isPaid ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {member.isPaid ? 'Depositó' : 'Pendiente'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Comprobante general si existe */}
      {bill.receiptUri && (
        <TouchableOpacity
          style={[styles.receiptRow, { borderTopColor: colors.borderSubtle }]}
          onPress={() => setViewingReceipt(bill.receiptUri)}
        >
          <Ionicons name="receipt-outline" size={15} color={colors.primary} />
          <Text style={[styles.receiptText, { color: colors.primary }]}>
            Ver comprobante de pago adjunto
          </Text>
        </TouchableOpacity>
      )}

      <ReceiptViewerModal
        visible={!!viewingReceipt}
        imageUri={viewingReceipt}
        title={`Comprobante - ${bill.name}`}
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  },
  iconWrap: {
    padding: 10,
    borderRadius: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  category: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  bodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  amount: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dueText: {
    fontSize: 12,
    fontWeight: '700',
  },
  splitToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  splitToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  splitBox: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  splitBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
  },
  memberAmount: {
    fontSize: 12,
    marginTop: 1,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  remindBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  toggleMemberPaidBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleMemberPaidText: {
    fontSize: 11,
    fontWeight: '700',
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  receiptText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
