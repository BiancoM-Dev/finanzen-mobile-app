import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gastos Fijos</Text>
          <Text style={styles.headerSubtitle}>
            Deudas, cuentas obligatorias y suscripciones del hogar
          </Text>
        </View>

        {/* Selector de sub-pestañas */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'debts' && styles.tabBtnActive]}
            onPress={() => setActiveTab('debts')}
          >
            <Ionicons
              name="card"
              size={16}
              color={activeTab === 'debts' ? '#FFFFFF' : '#4B5563'}
            />
            <Text style={[styles.tabText, activeTab === 'debts' && styles.tabTextActive]}>
              Deudas ({debts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'bills' && styles.tabBtnActive]}
            onPress={() => setActiveTab('bills')}
          >
            <Ionicons
              name="flash"
              size={16}
              color={activeTab === 'bills' ? '#FFFFFF' : '#4B5563'}
            />
            <Text style={[styles.tabText, activeTab === 'bills' && styles.tabTextActive]}>
              Cuentas ({bills.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'subscriptions' && styles.tabBtnActive]}
            onPress={() => setActiveTab('subscriptions')}
          >
            <Ionicons
              name="play-circle"
              size={16}
              color={activeTab === 'subscriptions' ? '#FFFFFF' : '#4B5563'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'subscriptions' && styles.tabTextActive,
              ]}
            >
              Suscripciones ({subscriptions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Resumen de gasto mensual de la categoría activa */}
        <View style={styles.categorySummary}>
          <Text style={styles.categorySummaryLabel}>
            {activeTab === 'debts' && 'Total cuotas de deudas este mes:'}
            {activeTab === 'bills' && 'Total cuentas obligatorias este mes:'}
            {activeTab === 'subscriptions' && 'Total suscripciones este mes:'}
          </Text>
          <Text style={styles.categorySummaryAmount}>
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
                  <Ionicons name="card-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>No tienes deudas registradas</Text>
                  <Text style={styles.emptyStateSub}>
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
                  <Ionicons name="flash-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>No hay cuentas registradas</Text>
                  <Text style={styles.emptyStateSub}>
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
                  <Ionicons name="tv-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>Sin suscripciones</Text>
                  <Text style={styles.emptyStateSub}>
                    Controla Netflix, Spotify, gym o cualquier pago recurrente.
                  </Text>
                </View>
              ) : (
                subscriptions.map((sub) => (
                  <View key={sub.id} style={styles.subCard}>
                    <View style={styles.subLeft}>
                      <View style={styles.subIcon}>
                        <Ionicons name="play" size={18} color="#EC4899" />
                      </View>
                      <View>
                        <Text style={styles.subName}>{sub.name}</Text>
                        <Text style={styles.subDetails}>
                          Día {sub.renewalDay} de cada mes • {sub.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.subRight}>
                      <Text style={styles.subAmount}>{formatCurrency(sub.amount)}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Switch
                          value={sub.isActive}
                          onValueChange={() =>
                            saveSubscription({ ...sub, isActive: !sub.isActive })
                          }
                          trackColor={{ false: '#D1D5DB', true: '#F472B6' }}
                          thumbColor={sub.isActive ? '#DB2777' : '#F3F4F6'}
                        />
                        <TouchableOpacity
                          onPress={() => handleDeleteSub(sub)}
                          style={{ padding: 4 }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
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
            activeTab === 'debts' && { backgroundColor: '#6366F1' },
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
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva Suscripción o Membresía</Text>
                <TouchableOpacity onPress={() => setShowAddSub(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nombre del servicio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Netflix, Spotify, Gimnasio"
                value={subName}
                onChangeText={setSubName}
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Monto Mensual</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="9990"
                    value={subAmountText}
                    onChangeText={setSubAmountText}
                  />
                </View>

                <View style={{ width: 110 }}>
                  <Text style={styles.inputLabel}>Día de Cobro</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Día (1-31)"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginVertical: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#1E293B',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  categorySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categorySummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categorySummaryAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
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
    color: '#4B5563',
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
  subCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  subLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  subIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  subDetails: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  subRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  subAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
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
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
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
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
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
    fontWeight: '700',
  },
});
