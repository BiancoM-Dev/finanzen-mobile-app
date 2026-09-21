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
import { ProgressBar } from './ProgressBar';
import { PayDebtModal } from './Modals/PayDebtModal';
import { ReceiptViewerModal } from './Modals/ReceiptViewerModal';

export const DebtCard = ({ debt, onPay, onDelete }) => {
  const { colors, isDark } = useTheme();
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
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="card" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {debt.name}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.category, { color: colors.textSecondary }]}>
                  {debt.category || 'Deuda'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Montos */}
      <View style={styles.amountsRow}>
        <View>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            Saldo pendiente
          </Text>
          <Text
            style={[
              styles.remainingAmount,
              { color: isFullyPaid ? colors.success : colors.danger },
            ]}
          >
            {isFullyPaid ? '¡Deuda Saldada! 🎉' : formatCurrency(debt.remainingAmount)}
          </Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            Monto total
          </Text>
          <Text style={[styles.totalAmount, { color: colors.textSecondary }]}>
            {formatCurrency(debt.totalAmount)}
          </Text>
        </View>
      </View>

      {/* Progreso de Cuotas */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={[styles.installmentText, { color: colors.textSecondary }]}>
            Cuota {paidInstallments} de {totalInstallments} pagadas
          </Text>
          <Text style={[styles.percentText, { color: colors.primary }]}>
            {progressPercent}%
          </Text>
        </View>
        <ProgressBar
          progress={progressPercent}
          color={isFullyPaid ? colors.success : colors.primary}
          height={8}
        />
      </View>

      {/* Pie con vencimiento y botón de acción */}
      <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.dueBadge}>
          <Ionicons name="calendar-outline" size={14} color={dueStatus.color} />
          <Text style={[styles.dueText, { color: dueStatus.color }]}>
            {dueStatus.text}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {debt.paymentsHistory && debt.paymentsHistory.length > 0 && (
            <TouchableOpacity
              style={[styles.historyBtn, { backgroundColor: colors.surfaceSubtle }]}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Ionicons
                name={showHistory ? 'chevron-up' : 'time-outline'}
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.historyBtnText, { color: colors.textSecondary }]}>
                Historial
              </Text>
            </TouchableOpacity>
          )}

          {!isFullyPaid && (
            <TouchableOpacity
              style={[styles.payBtn, { backgroundColor: colors.success }]}
              onPress={() => setShowPayModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="cash-outline" size={15} color="#FFFFFF" />
              <Text style={styles.payBtnText}>Pagar Cuota</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Historial desplegable de pagos y comprobantes */}
      {showHistory && debt.paymentsHistory && (
        <View
          style={[
            styles.historyContainer,
            { backgroundColor: colors.surfaceSubtle, borderTopColor: colors.borderSubtle },
          ]}
        >
          <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>
            Últimos Pagos Registrados:
          </Text>
          {debt.paymentsHistory.map((item, idx) => (
            <View
              key={item.id || idx}
              style={[styles.historyItem, { borderBottomColor: colors.border }]}
            >
              <View style={styles.historyItemLeft}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <View>
                  <Text style={[styles.historyItemTitle, { color: colors.textPrimary }]}>
                    Cuota #{item.installmentNumber} - {formatCurrency(item.amount)}
                  </Text>
                  <Text style={[styles.historyItemDate, { color: colors.textMuted }]}>
                    {item.date}
                  </Text>
                  {item.notes ? (
                    <Text style={[styles.historyItemNote, { color: colors.textSecondary }]}>
                      {item.notes}
                    </Text>
                  ) : null}
                </View>
              </View>

              {item.receiptUri && (
                <TouchableOpacity
                  style={[
                    styles.receiptBadge,
                    {
                      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#DBEAFE',
                    },
                  ]}
                  onPress={() => setViewingReceipt(item.receiptUri)}
                >
                  <Ionicons name="image-outline" size={13} color={colors.primary} />
                  <Text style={[styles.receiptBadgeText, { color: colors.primary }]}>
                    Comprobante
                  </Text>
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
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  remainingAmount: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
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
    fontWeight: '600',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  historyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  historyContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    padding: 12,
    borderRadius: 14,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  historyItemLeft: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyItemDate: {
    fontSize: 11,
    marginTop: 1,
  },
  historyItemNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  receiptBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
