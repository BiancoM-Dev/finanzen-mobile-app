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
import { ProgressBar } from './ProgressBar';
import { PayDebtModal } from './Modals/PayDebtModal';
import { ReceiptViewerModal } from './Modals/ReceiptViewerModal';

export const DebtCard = ({ debt, onPay, onDelete }) => {
  const [showPayModal, setShowPayModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const totalInstallments = debt.totalInstallments || 1;
  const paidInstallments = debt.paidInstallments || 0;
  const progressPercent = Math.round((paidInstallments / totalInstallments) * 100);
  const isFullyPaid = debt.remainingAmount <= 0 || paidInstallments >= totalInstallments;

  const dueStatus = getDueAlertStatus(debt.monthlyDueDate, isFullyPaid);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar deuda',
      `¿Estás seguro de eliminar "${debt.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(debt.id) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Cabecera */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <Ionicons name="card" size={20} color="#6366F1" />
          </View>
          <View>
            <Text style={styles.title}>{debt.name}</Text>
            <Text style={styles.category}>{debt.category || 'Deuda'}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Montos */}
      <View style={styles.amountsRow}>
        <View>
          <Text style={styles.amountLabel}>Saldo pendiente</Text>
          <Text style={[styles.remainingAmount, isFullyPaid && styles.paidText]}>
            {isFullyPaid ? '¡Deuda Saldada! 🎉' : formatCurrency(debt.remainingAmount)}
          </Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={styles.amountLabel}>Monto total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(debt.totalAmount)}</Text>
        </View>
      </View>

      {/* Progreso de Cuotas */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.installmentText}>
            Cuota {paidInstallments} de {totalInstallments} pagadas
          </Text>
          <Text style={styles.percentText}>{progressPercent}%</Text>
        </View>
        <ProgressBar
          progress={progressPercent}
          color={isFullyPaid ? '#10B981' : '#6366F1'}
          height={8}
        />
      </View>

      {/* Pie con vencimiento y botón de acción */}
      <View style={styles.footer}>
        <View style={styles.dueBadge}>
          <Ionicons name="calendar-outline" size={14} color={dueStatus.color} />
          <Text style={[styles.dueText, { color: dueStatus.color }]}>
            {dueStatus.text}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {debt.paymentsHistory && debt.paymentsHistory.length > 0 && (
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Ionicons
                name={showHistory ? 'chevron-up' : 'time-outline'}
                size={16}
                color="#6B7280"
              />
              <Text style={styles.historyBtnText}>Historial</Text>
            </TouchableOpacity>
          )}

          {!isFullyPaid && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => setShowPayModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="cash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.payBtnText}>Pagar Cuota</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Historial desplegable de pagos y comprobantes */}
      {showHistory && debt.paymentsHistory && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Últimos Pagos Registrados:</Text>
          {debt.paymentsHistory.map((item, idx) => (
            <View key={item.id || idx} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <View>
                  <Text style={styles.historyItemTitle}>
                    Cuota #{item.installmentNumber} - {formatCurrency(item.amount)}
                  </Text>
                  <Text style={styles.historyItemDate}>{item.date}</Text>
                  {item.notes ? (
                    <Text style={styles.historyItemNote}>{item.notes}</Text>
                  ) : null}
                </View>
              </View>

              {item.receiptUri && (
                <TouchableOpacity
                  style={styles.receiptBadge}
                  onPress={() => setViewingReceipt(item.receiptUri)}
                >
                  <Ionicons name="image-outline" size={14} color="#2563EB" />
                  <Text style={styles.receiptBadgeText}>Ver Comprobante</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Modal de Pagar Cuota */}
      <PayDebtModal
        visible={showPayModal}
        debt={debt}
        onClose={() => setShowPayModal(false)}
        onConfirmPayment={(paymentData) => onPay(debt.id, paymentData)}
      />

      {/* Visor de comprobante */}
      <ReceiptViewerModal
        visible={!!viewingReceipt}
        imageUri={viewingReceipt}
        title={`Comprobante - ${debt.name}`}
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
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    backgroundColor: '#EEF2FF',
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
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  remainingAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
  },
  paidText: {
    color: '#10B981',
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  installmentText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  historyBtnText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  historyContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyItemLeft: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  historyItemDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  historyItemNote: {
    fontSize: 11,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  receiptBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
});
