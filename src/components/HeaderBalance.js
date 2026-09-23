import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, parseCurrencyInput } from '../utils/currencyFormatter';
import { AddIncomeModal } from './Modals/AddIncomeModal';

export const HeaderBalance = ({ onOpenProfile }) => {
  const {
    profile,
    baseMonthlyIncome,
    currentMonthManualIncomes,
    monthlyIncome,
    totalFixedMonthlyExpenses,
    availableMonthlyBalance,
    upcomingAlerts,
    updateMonthlyIncome,
    saveIncome,
    currentUser,
    household,
    syncStatus,
  } = useFinance();

  const { colors, isDark, toggleTheme } = useTheme();

  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [tempIncomeText, setTempIncomeText] = useState((baseMonthlyIncome || 0).toString());
  const [hideBalance, setHideBalance] = useState(false);

  const handleSaveIncome = () => {
    const parsed = parseCurrencyInput(tempIncomeText);
    updateMonthlyIncome(parsed);
    setIsEditingIncome(false);
  };

  return (
    <View style={styles.container}>
      {/* Barra superior con saludo, selector de tema y perfil */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greetingText, { color: colors.textPrimary }]}>
            Hola, {currentUser?.displayName?.split(' ')[0] || profile?.name?.split(' ')[0] || 'Bienvenido'} 👋
          </Text>
          <TouchableOpacity
            style={styles.syncChipRow}
            onPress={onOpenProfile}
            activeOpacity={0.7}
          >
            {household ? (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(59, 130, 246, 0.2)'
                      : '#DBEAFE',
                  },
                ]}
              >
                <Ionicons name="home" size={11} color="#3B82F6" />
                <Text style={[styles.statusBadgeText, { color: '#3B82F6' }]}>
                  {household.name}
                </Text>
              </View>
            ) : currentUser ? (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      syncStatus === 'synced'
                        ? isDark
                          ? 'rgba(52, 211, 153, 0.2)'
                          : '#D1FAE5'
                        : isDark
                        ? 'rgba(245, 158, 11, 0.2)'
                        : '#FEF3C7',
                  },
                ]}
              >
                <Ionicons
                  name={syncStatus === 'synced' ? 'cloud-done' : 'sync'}
                  size={11}
                  color={syncStatus === 'synced' ? '#10B981' : '#F59E0B'}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: syncStatus === 'synced' ? '#10B981' : '#F59E0B',
                    },
                  ]}
                >
                  {syncStatus === 'synced' ? 'Cloud Sync' : 'Sincronizando...'}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons name="cloud-offline-outline" size={11} color={colors.textMuted} />
                <Text style={[styles.statusBadgeText, { color: colors.textMuted }]}>
                  Modo Local
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.topActions}>
          {/* Botón de cambio de tema Claro / Oscuro */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#FBBF24' : '#6366F1'}
            />
          </TouchableOpacity>

          {/* Botón de perfil */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={onOpenProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tarjeta de Balance Principal estilo Neo-Bank */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#141E33' : '#0F172A',
            borderColor: isDark ? '#273553' : '#1E293B',
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.cardLabel}>SALDO DISPONIBLE</Text>
            <TouchableOpacity
              onPress={() => setHideBalance(!hideBalance)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={hideBalance ? 'eye-off-outline' : 'eye-outline'}
                size={16}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardHeaderButtons}>
            <TouchableOpacity
              style={styles.addIncomeBadge}
              onPress={() => setShowAddIncomeModal(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="add-circle" size={12} color="#34D399" />
              <Text style={styles.addIncomeText}>+ Ingreso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editIncomeBadge}
              onPress={() => {
                setTempIncomeText((baseMonthlyIncome || 0).toString());
                setIsEditingIncome(true);
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="pencil" size={11} color="#A5B4FC" />
              <Text style={styles.editIncomeText}>Sueldo Base</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={[
            styles.balanceAmount,
            { color: availableMonthlyBalance >= 0 ? '#34D399' : '#FB7185' },
          ]}
        >
          {hideBalance ? '$ • • • • • •' : formatCurrency(availableMonthlyBalance)}
        </Text>

        <View style={styles.divider} />

        {/* Fila de Ingresos vs Gastos Fijos */}
        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={styles.metricItem}
            onPress={() => setShowAddIncomeModal(true)}
            activeOpacity={0.75}
          >
            <View style={styles.metricIconWrapIncome}>
              <Ionicons name="arrow-up" size={14} color="#34D399" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={styles.metricLabel}>Ingresos</Text>
                <Ionicons name="add-circle-outline" size={10} color="#34D399" />
              </View>
              <Text style={styles.metricValue}>
                {hideBalance ? '$ • • •' : formatCurrency(monthlyIncome)}
              </Text>
              {currentMonthManualIncomes > 0 && !hideBalance && (
                <Text style={styles.metricExtraSub}>
                  +{formatCurrency(currentMonthManualIncomes)} extras
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.metricItem}>
            <View style={styles.metricIconWrapExpense}>
              <Ionicons name="arrow-down" size={14} color="#FB7185" />
            </View>
            <View>
              <Text style={styles.metricLabel}>Gastos Fijos</Text>
              <Text style={styles.metricValue}>
                {hideBalance ? '$ • • •' : formatCurrency(totalFixedMonthlyExpenses)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Banner de alerta de vencimientos próximos */}
      {upcomingAlerts.length > 0 && (
        <View
          style={[
            styles.alertBanner,
            {
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
              borderColor: isDark ? '#78350F' : '#FDE68A',
            },
          ]}
        >
          <Ionicons name="notifications" size={18} color="#F59E0B" />
          <View style={styles.alertContent}>
            <Text
              style={[
                styles.alertTitle,
                { color: isDark ? '#FDE68A' : '#92400E' },
              ]}
            >
              {upcomingAlerts.length} vencimiento(s) en los próximos 7 días:
            </Text>
            <Text
              style={[
                styles.alertSub,
                { color: isDark ? '#FCD34D' : '#B45309' },
              ]}
              numberOfLines={1}
            >
              {upcomingAlerts[0].title} ({formatCurrency(upcomingAlerts[0].amount)}) - en {upcomingAlerts[0].days} días
            </Text>
          </View>
        </View>
      )}

      {/* Modal para configurar sueldo fijo mensual */}
      <Modal visible={isEditingIncome} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Sueldo Base Mensual
            </Text>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Indica tu sueldo fijo o ingreso contractual mensual. Si eres independiente o no tienes sueldo fijo, déjalo en $0 y usa el botón "+ Ingreso" cada vez que recibas dinero.
            </Text>

            <View
              style={[
                styles.inputContainer,
                { borderColor: colors.border, backgroundColor: colors.surfaceSubtle },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                value={tempIncomeText}
                onChangeText={setTempIncomeText}
                placeholder="1000000"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsEditingIncome(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveIncome}
              >
                <Text style={styles.modalConfirmText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para registrar ingreso manual o variable */}
      <AddIncomeModal
        visible={showAddIncomeModal}
        onClose={() => setShowAddIncomeModal(false)}
        onSave={saveIncome}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  syncChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '800',
    color: '#94A3B8',
  },
  eyeBtn: {
    padding: 2,
  },
  cardHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addIncomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.45)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  addIncomeText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '700',
  },
  editIncomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(165, 180, 252, 0.4)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  editIncomeText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIconWrapIncome: {
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricIconWrapExpense: {
    backgroundColor: 'rgba(251, 113, 133, 0.18)',
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 1,
  },
  metricExtraSub: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '700',
    marginTop: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    gap: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  alertSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    paddingVertical: 12,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
