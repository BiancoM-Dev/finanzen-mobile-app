import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { HeaderBalance } from '../components/HeaderBalance';
import { AddDebtModal } from '../components/Modals/AddDebtModal';
import { AddBillModal } from '../components/Modals/AddBillModal';
import { AddGoalModal } from '../components/Modals/AddGoalModal';
import { AddSocialDebtModal } from '../components/Modals/AddSocialDebtModal';
import { AddIncomeModal } from '../components/Modals/AddIncomeModal';

export const DashboardScreen = ({ onNavigateTab }) => {
  const {
    monthlyDebtsTotal,
    monthlyBillsTotal,
    monthlySubscriptionsTotal,
    totalRemainingDebt,
    totalSavedInGoals,
    totalTargetGoals,
    totalOwedToMe,
    totalIOwe,
    incomes,
    baseMonthlyIncome,
    currentMonthManualIncomes,
    monthlyIncome,
    saveDebt,
    saveBill,
    saveGoal,
    saveSocialDebt,
    saveIncome,
    deleteIncome,
  } = useFinance();

  const { colors, isDark } = useTheme();

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddSocial, setShowAddSocial] = useState(false);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cabecera y Balance Principal */}
        <HeaderBalance onOpenProfile={() => onNavigateTab('profile')} />

        {/* Acciones Rápidas */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Acciones Rápidas
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScroll}
        >
          {/* + Ingreso */}
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
            onPress={() => setShowAddIncome(true)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.quickIconWrap,
                {
                  backgroundColor: isDark
                    ? 'rgba(52, 211, 153, 0.2)'
                    : '#D1FAE5',
                },
              ]}
            >
              <Ionicons name="arrow-down-circle" size={20} color={colors.success} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
              + Ingreso
            </Text>
          </TouchableOpacity>

          {/* + Deuda */}
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
            onPress={() => setShowAddDebt(true)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.quickIconWrap,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons name="card" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
              + Deuda
            </Text>
          </TouchableOpacity>

          {/* + Cuenta */}
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
            onPress={() => setShowAddBill(true)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.quickIconWrap,
                {
                  backgroundColor: isDark
                    ? 'rgba(245, 158, 11, 0.2)'
                    : '#FEF3C7',
                },
              ]}
            >
              <Ionicons name="flash" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
              + Cuenta
            </Text>
          </TouchableOpacity>

          {/* + Meta */}
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
            onPress={() => setShowAddGoal(true)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.quickIconWrap,
                {
                  backgroundColor: isDark
                    ? 'rgba(56, 189, 248, 0.2)'
                    : '#E0F2FE',
                },
              ]}
            >
              <Ionicons name="trophy" size={20} color="#0EA5E9" />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
              + Meta
            </Text>
          </TouchableOpacity>

          {/* + Favor */}
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
            onPress={() => setShowAddSocial(true)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.quickIconWrap,
                { backgroundColor: colors.successLight },
              ]}
            >
              <Ionicons name="people" size={20} color={colors.success} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
              + Favor
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Panorama Financiero */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Panorama Financiero
          </Text>
        </View>

        {/* Tarjeta: Ingresos Totales del Mes */}
        <TouchableOpacity
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.cardShadow,
            },
          ]}
          onPress={() => setShowAddIncome(true)}
          activeOpacity={0.85}
        >
          <View style={styles.summaryCardLeft}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.2)' : '#D1FAE5' },
              ]}
            >
              <Ionicons name="wallet-outline" size={22} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                Ingresos del Mes
              </Text>
              <Text style={[styles.summarySubtitle, { color: colors.textMuted }]}>
                {baseMonthlyIncome > 0 ? `Base: ${formatCurrency(baseMonthlyIncome)}` : 'Sin sueldo fijo'}
                {currentMonthManualIncomes > 0 ? ` • Extras: +${formatCurrency(currentMonthManualIncomes)}` : ''}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatCurrency(monthlyIncome)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
              <Ionicons name="add-circle" size={13} color={colors.success} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>
                Añadir
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Tarjeta: Deuda Total Pendiente */}
        <TouchableOpacity
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.cardShadow,
            },
          ]}
          onPress={() => onNavigateTab('fixed_expenses')}
          activeOpacity={0.85}
        >
          <View style={styles.summaryCardLeft}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: colors.dangerLight },
              ]}
            >
              <Ionicons name="trending-down" size={22} color={colors.danger} />
            </View>
            <View>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                Deuda Total Acumulada
              </Text>
              <Text style={[styles.summarySubtitle, { color: colors.textMuted }]}>
                Cuotas del mes: {formatCurrency(monthlyDebtsTotal)}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              {formatCurrency(totalRemainingDebt)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Tarjeta: Metas de Ahorro */}
        <TouchableOpacity
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.cardShadow,
            },
          ]}
          onPress={() => onNavigateTab('goals')}
          activeOpacity={0.85}
        >
          <View style={styles.summaryCardLeft}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: colors.successLight },
              ]}
            >
              <Ionicons name="rocket" size={22} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                Ahorro en Metas (ej. Moto)
              </Text>
              <Text style={[styles.summarySubtitle, { color: colors.textMuted }]}>
                Objetivo total: {formatCurrency(totalTargetGoals)}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatCurrency(totalSavedInGoals)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Tarjeta: Cuentas Claras */}
        <TouchableOpacity
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.cardShadow,
            },
          ]}
          onPress={() => onNavigateTab('social')}
          activeOpacity={0.85}
        >
          <View style={styles.summaryCardLeft}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons name="chatbubbles" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                Cuentas Claras (Amigos/Familia)
              </Text>
              <Text style={[styles.summarySubtitle, { color: colors.textMuted }]}>
                Te deben: {formatCurrency(totalOwedToMe)}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {totalIOwe > 0 ? `Debes ${formatCurrency(totalIOwe)}` : 'Al día'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Desglose de Gastos Fijos Mensuales */}
        <View
          style={[
            styles.breakdownCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.breakdownTitle, { color: colors.textSecondary }]}>
            Distribución de Gastos Fijos Mensuales
          </Text>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>
                Deudas
              </Text>
              <Text
                style={[styles.breakdownAmount, { color: colors.textPrimary }]}
              >
                {formatCurrency(monthlyDebtsTotal)}
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>
                Servicios
              </Text>
              <Text
                style={[styles.breakdownAmount, { color: colors.textPrimary }]}
              >
                {formatCurrency(monthlyBillsTotal)}
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: '#EC4899' }]} />
              <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>
                Suscripciones
              </Text>
              <Text
                style={[styles.breakdownAmount, { color: colors.textPrimary }]}
              >
                {formatCurrency(monthlySubscriptionsTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Registro de Ingresos Variables Recientes */}
        {incomes.length > 0 && (
          <View style={{ marginTop: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 10,
              }}
            >
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Ingresos Recientes ({incomes.length})
              </Text>
              <TouchableOpacity onPress={() => setShowAddIncome(true)}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>
                  + Añadir Ingreso
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {incomes.slice(0, 4).map((inc) => (
                <View
                  key={inc.id}
                  style={[
                    styles.incomeRowItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: colors.cardShadow,
                    },
                  ]}
                >
                  <View style={styles.incomeRowLeft}>
                    <View
                      style={[
                        styles.incomeIconWrap,
                        {
                          backgroundColor: isDark
                            ? 'rgba(52, 211, 153, 0.15)'
                            : '#D1FAE5',
                        },
                      ]}
                    >
                      <Ionicons name="arrow-down" size={14} color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.incomeTitle, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {inc.title}
                      </Text>
                      <Text style={[styles.incomeSub, { color: colors.textMuted }]}>
                        {inc.category || 'Ingreso'} • {inc.date}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.incomeRowRight}>
                    <Text style={[styles.incomeAmount, { color: colors.success }]}>
                      +{formatCurrency(inc.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Eliminar ingreso',
                          `¿Deseas eliminar el ingreso "${inc.title}"?`,
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Eliminar',
                              style: 'destructive',
                              onPress: () => deleteIncome(inc.id),
                            },
                          ]
                        );
                      }}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modales rápidos */}
      <AddIncomeModal
        visible={showAddIncome}
        onClose={() => setShowAddIncome(false)}
        onSave={saveIncome}
      />
      <AddDebtModal
        visible={showAddDebt}
        onClose={() => setShowAddDebt(false)}
        onSave={saveDebt}
      />
      <AddBillModal
        visible={showAddBill}
        onClose={() => setShowAddBill(false)}
        onSave={saveBill}
      />
      <AddGoalModal
        visible={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onSave={saveGoal}
      />
      <AddSocialDebtModal
        visible={showAddSocial}
        onClose={() => setShowAddSocial(false)}
        onSave={saveSocialDebt}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  quickActionCard: {
    width: 78,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  summarySubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  breakdownCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  incomeRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  incomeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  incomeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  incomeSub: {
    fontSize: 11,
    marginTop: 1,
  },
  incomeRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incomeAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
});
