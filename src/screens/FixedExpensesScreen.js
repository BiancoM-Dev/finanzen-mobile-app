import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, parseCurrencyInput } from '../utils/currencyFormatter';
import { DebtCard } from '../components/DebtCard';
import { BillCard } from '../components/BillCard';
import { AddDebtModal } from '../components/Modals/AddDebtModal';
import { AddBillModal } from '../components/Modals/AddBillModal';
import { SubscriptionCategory } from '../models/types';

export const FixedExpensesScreen = () => {
  const {
    debts,
    bills,
    subscriptions,
    monthlyDebtsTotal,
    monthlyBillsTotal,
    monthlySubscriptionsTotal,
    payDebtInstallment,
    deleteDebt,
    saveDebt,
    toggleBillPaid,
    toggleSplitMemberPaid,
    deleteBill,
    saveBill,
    saveSubscription,
    deleteSubscription,
  } = useFinance();

  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('debts'); // 'debts' | 'bills' | 'subscriptions'
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);

  // Estados modal nueva suscripción
  const [subName, setSubName] = useState('');
  const [subAmountText, setSubAmountText] = useState('');
  const [subCategory, setSubCategory] = useState(SubscriptionCategory.STREAMING);
  const [subRenewalDay, setSubRenewalDay] = useState('10');

  const handleCreateSubscription = () => {
    const amount = parseCurrencyInput(subAmountText);
    const renewalDay = parseInt(subRenewalDay, 10) || 1;

    if (!subName.trim()) {
      Alert.alert('Falta información', 'Ingresa el nombre de la suscripción (ej. Netflix).');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa el valor mensual.');
      return;
    }

    const newSub = {
      id: `sub_${Date.now()}`,
      name: subName.trim(),
      amount,
      category: subCategory,
      billingCycle: 'monthly',
      renewalDay,
      isActive: true,
    };

    saveSubscription(newSub);
    setSubName('');
    setSubAmountText('');
    setSubRenewalDay('10');
    setShowAddSub(false);
  };

  const handleDeleteSub = (sub) => {
    Alert.alert(
      'Eliminar suscripción',
      `¿Deseas eliminar ${sub.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteSubscription(sub.id) },
      ]
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Gastos Fijos
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Deudas, cuentas obligatorias y suscripciones del hogar
          </Text>
        </View>

        {/* Selector de sub-pestañas */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: colors.surfaceSubtle },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'debts' && {
                backgroundColor: colors.surface,
                shadowColor: colors.cardShadow,
                elevation: 2,
              },
            ]}
            onPress={() => setActiveTab('debts')}
          >
            <Ionicons
              name="card"
              size={15}
              color={activeTab === 'debts' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'debts' ? colors.textPrimary : colors.textMuted },
                activeTab === 'debts' && { fontWeight: '800' },
              ]}
            >
              Deudas ({debts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'bills' && {
                backgroundColor: colors.surface,
                shadowColor: colors.cardShadow,
                elevation: 2,
              },
            ]}
            onPress={() => setActiveTab('bills')}
          >
            <Ionicons
              name="flash"
              size={15}
              color={activeTab === 'bills' ? '#F59E0B' : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'bills' ? colors.textPrimary : colors.textMuted },
                activeTab === 'bills' && { fontWeight: '800' },
              ]}
            >
              Cuentas ({bills.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'subscriptions' && {
                backgroundColor: colors.surface,
                shadowColor: colors.cardShadow,
                elevation: 2,
              },
            ]}
            onPress={() => setActiveTab('subscriptions')}
          >
            <Ionicons
              name="play-circle"
              size={15}
              color={activeTab === 'subscriptions' ? '#EC4899' : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'subscriptions'
                    ? colors.textPrimary
                    : colors.textMuted,
                },
                activeTab === 'subscriptions' && { fontWeight: '800' },
              ]}
            >
              Suscripciones ({subscriptions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Resumen de gasto mensual de la categoría activa */}
        <View
          style={[
            styles.categorySummary,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.categorySummaryLabel, { color: colors.textSecondary }]}>
            {activeTab === 'debts' && 'Total cuotas de deudas este mes:'}
            {activeTab === 'bills' && 'Total cuentas obligatorias este mes:'}
            {activeTab === 'subscriptions' && 'Total suscripciones este mes:'}
          </Text>
          <Text style={[styles.categorySummaryAmount, { color: colors.textPrimary }]}>
            {activeTab === 'debts' && formatCurrency(monthlyDebtsTotal)}
            {activeTab === 'bills' && formatCurrency(monthlyBillsTotal)}
            {activeTab === 'subscriptions' && formatCurrency(monthlySubscriptionsTotal)}
          </Text>
        </View>

        {/* Contenido según pestaña */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {activeTab === 'debts' && (
            <>
              {debts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="card-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>
                    No tienes deudas registradas
                  </Text>
                  <Text style={[styles.emptyStateSub, { color: colors.textMuted }]}>
                    Agrega préstamos o tarjetas para llevar el control de tus cuotas.
                  </Text>
                </View>
              ) : (
                debts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onPay={payDebtInstallment}
                    onDelete={deleteDebt}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'bills' && (
            <>
              {bills.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="flash-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>
                    No hay cuentas registradas
                  </Text>
                  <Text style={[styles.emptyStateSub, { color: colors.textMuted }]}>
                    Agrega la luz, agua, gas o arriendo con opción de dividir en el hogar.
                  </Text>
                </View>
              ) : (
                bills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onTogglePaid={toggleBillPaid}
                    onToggleSplitMember={toggleSplitMemberPaid}
                    onDelete={deleteBill}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'subscriptions' && (
            <>
              {subscriptions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="tv-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>
                    Sin suscripciones
                  </Text>
                  <Text style={[styles.emptyStateSub, { color: colors.textMuted }]}>
                    Controla Netflix, Spotify, gym o cualquier pago recurrente.
                  </Text>
                </View>
              ) : (
                subscriptions.map((sub) => (
                  <View
                    key={sub.id}
                    style={[
                      styles.subCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.subLeft}>
                      <View
                        style={[
                          styles.subIcon,
                          {
                            backgroundColor: isDark
                              ? 'rgba(236, 72, 153, 0.18)'
                              : '#FCE7F3',
                          },
                        ]}
                      >
                        <Ionicons name="play" size={18} color="#EC4899" />
                      </View>
                      <View>
                        <Text style={[styles.subName, { color: colors.textPrimary }]}>
                          {sub.name}
                        </Text>
                        <Text style={[styles.subDetails, { color: colors.textMuted }]}>
                          Día {sub.renewalDay} de cada mes • {sub.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.subRight}>
                      <Text style={[styles.subAmount, { color: colors.textPrimary }]}>
                        {formatCurrency(sub.amount)}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Switch
                          value={sub.isActive}
                          onValueChange={() =>
                            saveSubscription({ ...sub, isActive: !sub.isActive })
                          }
                          trackColor={{ false: '#64748B', true: '#F472B6' }}
                          thumbColor={sub.isActive ? '#DB2777' : '#94A3B8'}
                        />
                        <TouchableOpacity
                          onPress={() => handleDeleteSub(sub)}
                          style={{ padding: 4 }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={colors.textMuted}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>

        {/* Botón flotante para agregar */}
        <TouchableOpacity
          style={[
            styles.floatingBtn,
            activeTab === 'debts' && { backgroundColor: colors.primary },
            activeTab === 'bills' && { backgroundColor: '#F59E0B' },
            activeTab === 'subscriptions' && { backgroundColor: '#EC4899' },
          ]}
          onPress={() => {
            if (activeTab === 'debts') setShowAddDebt(true);
            if (activeTab === 'bills') setShowAddBill(true);
            if (activeTab === 'subscriptions') setShowAddSub(true);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
          <Text style={styles.floatingBtnText}>
            {activeTab === 'debts' && 'Nueva Deuda'}
            {activeTab === 'bills' && 'Nueva Cuenta'}
            {activeTab === 'subscriptions' && 'Nueva Suscripción'}
          </Text>
        </TouchableOpacity>

        {/* Modales */}
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

        {/* Modal para crear suscripción */}
        <Modal visible={showAddSub} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Nueva Suscripción o Membresía
                </Text>
                <TouchableOpacity onPress={() => setShowAddSub(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Nombre del servicio
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSubtle,
                  },
                ]}
                placeholder="Ej. Netflix, Spotify, Gimnasio"
                placeholderTextColor={colors.textMuted}
                value={subName}
                onChangeText={setSubName}
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Monto Mensual
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.textPrimary,
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceSubtle,
                      },
                    ]}
                    keyboardType="numeric"
                    placeholder="9990"
                    placeholderTextColor={colors.textMuted}
                    value={subAmountText}
                    onChangeText={setSubAmountText}
                  />
                </View>

                <View style={{ width: 110 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Día de Cobro
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.textPrimary,
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceSubtle,
                      },
                    ]}
                    keyboardType="numeric"
                    placeholder="Día (1-31)"
                    placeholderTextColor={colors.textMuted}
                    value={subRenewalDay}
                    onChangeText={setSubRenewalDay}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveSubBtn}
                onPress={handleCreateSubscription}
              >
                <Text style={styles.saveSubBtnText}>Guardar Suscripción</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
    marginVertical: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categorySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  categorySummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  categorySummaryAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
  subCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  subLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  subIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subName: {
    fontSize: 15,
    fontWeight: '700',
  },
  subDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  subRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  subAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveSubBtn: {
    backgroundColor: '#EC4899',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveSubBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
