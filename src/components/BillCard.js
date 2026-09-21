import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/currencyFormatter';
import { getDueAlertStatus } from '../utils/dateUtils';
import { sendFriendlyWhatsAppReminder } from '../utils/whatsappHelper';
import { useFinance } from '../context/FinanceContext';
import { ReceiptViewerModal } from './Modals/ReceiptViewerModal';

export const BillCard = ({ bill, onTogglePaid, onToggleSplitMember, onDelete }) => {
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
    <View style={styles.card}>
      {/* Cabecera */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <Ionicons name="flash-outline" size={20} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.title}>{bill.name}</Text>
            <Text style={styles.category}>{bill.category}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Monto y Estado */}
      <View style={styles.bodyRow}>
        <View>
          <Text style={styles.label}>Monto del mes</Text>
          <Text style={styles.amount}>{formatCurrency(bill.estimatedAmount)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.statusBadge, bill.isPaid ? styles.paidBadge : styles.pendingBadge]}
          onPress={() => onTogglePaid(bill.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={bill.isPaid ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={bill.isPaid ? '#047857' : '#B45309'}
          />
          <Text style={[styles.statusText, bill.isPaid ? styles.paidText : styles.pendingText]}>
            {bill.isPaid ? 'Pagado' : 'Marcar Pagado'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Alerta de vencimiento y Split Toggle */}
      <View style={styles.footerRow}>
        <View style={styles.dueBadge}>
          <Ionicons name="calendar-outline" size={14} color={dueStatus.color} />
          <Text style={[styles.dueText, { color: dueStatus.color }]}>
            {dueStatus.text}
          </Text>
        </View>

        {bill.isSplit && bill.splitMembers && bill.splitMembers.length > 0 && (
          <TouchableOpacity
            style={styles.splitToggleBtn}
            onPress={() => setShowSplitDetails(!showSplitDetails)}
          >
            <Ionicons name="people-outline" size={15} color="#4F46E5" />
            <Text style={styles.splitToggleText}>
              Dividida ({bill.splitMembers.filter((m) => m.isPaid).length}/
              {bill.splitMembers.length})
            </Text>
            <Ionicons
              name={showSplitDetails ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#4F46E5"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Desglose de División del Hogar (Split) */}
      {bill.isSplit && showSplitDetails && bill.splitMembers && (
        <View style={styles.splitBox}>
          <Text style={styles.splitBoxTitle}>Miembros del hogar que aportan:</Text>
          {bill.splitMembers.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <Ionicons
                  name={member.isPaid ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={member.isPaid ? '#10B981' : '#9CA3AF'}
                />
                <View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberAmount}>{formatCurrency(member.amount)}</Text>
                </View>
              </View>

              <View style={styles.memberActions}>
                {!member.isPaid && (
                  <TouchableOpacity
                    style={styles.remindBtn}
                    onPress={() => handleRemindMember(member)}
                  >
                    <Ionicons name="logo-whatsapp" size={14} color="#059669" />
                    <Text style={styles.remindBtnText}>Cobrar</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.toggleMemberPaidBtn,
                    member.isPaid && styles.toggleMemberPaidActive,
                  ]}
                  onPress={() => onToggleSplitMember(bill.id, member.id)}
                >
                  <Text
                    style={[
                      styles.toggleMemberPaidText,
                      member.isPaid && styles.toggleMemberPaidTextActive,
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
          style={styles.receiptRow}
          onPress={() => setViewingReceipt(bill.receiptUri)}
        >
          <Ionicons name="receipt-outline" size={15} color="#2563EB" />
          <Text style={styles.receiptText}>Ver comprobante de pago adjunto</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  bodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 6,
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  paidText: {
    color: '#047857',
  },
  pendingText: {
    color: '#B45309',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  splitToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  splitToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  splitBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  splitBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
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
    fontWeight: '600',
    color: '#1E293B',
  },
  memberAmount: {
    fontSize: 12,
    color: '#64748B',
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
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  remindBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  toggleMemberPaidBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  toggleMemberPaidActive: {
    backgroundColor: '#10B981',
  },
  toggleMemberPaidText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleMemberPaidTextActive: {
    color: '#FFFFFF',
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  receiptText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
});
