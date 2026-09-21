import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { SocialDebtType } from '../models/types';
import { getDaysRemainingInMonth } from '../utils/dateUtils';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [debts, setDebts] = useState([]);
  const [bills, setBills] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [socialDebts, setSocialDebts] = useState([]);

  // Carga inicial de datos
  const loadAllData = async () => {
    try {
      setLoading(true);
      await storageService.initData();

      const [p, banks, d, b, s, g, soc] = await Promise.all([
        storageService.getUserProfile(),
        storageService.getBankAccounts(),
        storageService.getDebts(),
        storageService.getBills(),
        storageService.getSubscriptions(),
        storageService.getGoals(),
        storageService.getSocialDebts(),
      ]);

      setProfile(p);
      setBankAccounts(banks);
      setDebts(d);
      setBills(b);
      setSubscriptions(s);
      setGoals(g);
      setSocialDebts(soc);
    } catch (error) {
      console.error('Error cargando datos de FinanZen:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Cálculos y Métricas Financieras ---
  const monthlyIncome = profile?.monthlyIncome || 0;

  // Total cuotas mensuales de deudas formales
  const monthlyDebtsTotal = debts.reduce(
    (sum, d) => sum + (d.remainingAmount > 0 ? (d.monthlyAmount || 0) : 0),
    0
  );

  // Total cuentas de servicios mensuales obligatorias
  const monthlyBillsTotal = bills.reduce(
    (sum, b) => sum + (b.estimatedAmount || 0),
    0
  );

  // Total suscripciones personales activas
  const monthlySubscriptionsTotal = subscriptions.reduce(
    (sum, s) => sum + (s.isActive ? (s.amount || 0) : 0),
    0
  );

  // Total compromisos fijos del mes
  const totalFixedMonthlyExpenses =
    monthlyDebtsTotal + monthlyBillsTotal + monthlySubscriptionsTotal;

  // Saldo disponible proyectado
  const availableMonthlyBalance = monthlyIncome - totalFixedMonthlyExpenses;

  // Deuda total acumulada remanente
  const totalRemainingDebt = debts.reduce(
    (sum, d) => sum + (d.remainingAmount || 0),
    0
  );

  // Total ahorrado en metas
  const totalSavedInGoals = goals.reduce(
    (sum, g) => sum + (g.currentAmount || 0),
    0
  );

  // Metas objetivo total
  const totalTargetGoals = goals.reduce(
    (sum, g) => sum + (g.targetAmount || 0),
    0
  );

  // Módulo Cuentas Claras: Me deben vs Debo
  const totalOwedToMe = socialDebts
    .filter((s) => s.type === SocialDebtType.THEY_OWE_ME && s.status !== 'paid')
    .reduce((sum, s) => sum + (s.totalAmount - (s.paidAmount || 0)), 0);

  const totalIOwe = socialDebts
    .filter((s) => s.type === SocialDebtType.I_OWE_THEM && s.status !== 'paid')
    .reduce((sum, s) => sum + (s.totalAmount - (s.paidAmount || 0)), 0);

  // Alertas de vencimientos en los próximos 7 días
  const upcomingAlerts = [
    ...debts
      .filter((d) => d.remainingAmount > 0 && getDaysRemainingInMonth(d.monthlyDueDate) <= 7)
      .map((d) => ({
        type: 'debt',
        title: d.name,
        amount: d.monthlyAmount,
        dueDay: d.monthlyDueDate,
        days: getDaysRemainingInMonth(d.monthlyDueDate),
      })),
    ...bills
      .filter((b) => !b.isPaid && getDaysRemainingInMonth(b.dueDay) <= 7)
      .map((b) => ({
        type: 'bill',
        title: b.name,
        amount: b.estimatedAmount,
        dueDay: b.dueDay,
        days: getDaysRemainingInMonth(b.dueDay),
      })),
  ].sort((a, b) => a.days - b.days);

  // Cuenta bancaria principal preferida
  const primaryBankAccount = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0] || null;

  // --- Métodos de Acción ---

  // Perfil e Ingresos
  const updateProfile = async (newProfileData) => {
    const updated = await storageService.saveUserProfile({ ...profile, ...newProfileData });
    setProfile(updated);
  };

  const updateMonthlyIncome = async (newIncome) => {
    const updated = await storageService.saveUserProfile({ ...profile, monthlyIncome: newIncome });
    setProfile(updated);
  };

  // Cuentas Bancarias
  const saveBankAccount = async (account) => {
    const updated = await storageService.saveBankAccount(account);
    setBankAccounts(updated);
  };

  const deleteBankAccount = async (id) => {
    const updated = await storageService.deleteBankAccount(id);
    setBankAccounts(updated);
  };

  // Deudas
  const saveDebt = async (debt) => {
    const updated = await storageService.saveDebt(debt);
    setDebts(updated);
  };

  const payDebtInstallment = async (debtId, paymentData) => {
    const updated = await storageService.payDebtInstallment(debtId, paymentData);
    setDebts(updated);
  };

  const deleteDebt = async (id) => {
    const updated = await storageService.deleteDebt(id);
    setDebts(updated);
  };

  // Cuentas de Servicios
  const saveBill = async (bill) => {
    const updated = await storageService.saveBill(bill);
    setBills(updated);
  };

  const toggleBillPaid = async (billId, receiptUri) => {
    const updated = await storageService.toggleBillPaid(billId, receiptUri);
    setBills(updated);
  };

  const toggleSplitMemberPaid = async (billId, memberId, receiptUri) => {
    const updated = await storageService.toggleSplitMemberPaid(billId, memberId, receiptUri);
    setBills(updated);
  };

  const deleteBill = async (id) => {
    const updated = await storageService.deleteBill(id);
    setBills(updated);
  };

  // Suscripciones
  const saveSubscription = async (sub) => {
    const updated = await storageService.saveSubscription(sub);
    setSubscriptions(updated);
  };

  const deleteSubscription = async (id) => {
    const updated = await storageService.deleteSubscription(id);
    setSubscriptions(updated);
  };

  // Metas de Ahorro
  const saveGoal = async (goal) => {
    const updated = await storageService.saveGoal(goal);
    setGoals(updated);
  };

  const depositToGoal = async (goalId, depositData) => {
    const updated = await storageService.depositToGoal(goalId, depositData);
    setGoals(updated);
  };

  const deleteGoal = async (id) => {
    const updated = await storageService.deleteGoal(id);
    setGoals(updated);
  };

  // Préstamos Informales (Cuentas Claras)
  const saveSocialDebt = async (socialDebt) => {
    const updated = await storageService.saveSocialDebt(socialDebt);
    setSocialDebts(updated);
  };

  const paySocialDebt = async (id, paymentData) => {
    const updated = await storageService.paySocialDebt(id, paymentData);
    setSocialDebts(updated);
  };

  const deleteSocialDebt = async (id) => {
    const updated = await storageService.deleteSocialDebt(id);
    setSocialDebts(updated);
  };

  // Reset de fábrica para demostración
  const resetData = async () => {
    await storageService.resetToSeedData();
    await loadAllData();
  };

  return (
    <FinanceContext.Provider
      value={{
        loading,
        profile,
        bankAccounts,
        primaryBankAccount,
        debts,
        bills,
        subscriptions,
        goals,
        socialDebts,
        // Métricas
        monthlyIncome,
        monthlyDebtsTotal,
        monthlyBillsTotal,
        monthlySubscriptionsTotal,
        totalFixedMonthlyExpenses,
        availableMonthlyBalance,
        totalRemainingDebt,
        totalSavedInGoals,
        totalTargetGoals,
        totalOwedToMe,
        totalIOwe,
        upcomingAlerts,
        // Funciones
        loadAllData,
        updateProfile,
        updateMonthlyIncome,
        saveBankAccount,
        deleteBankAccount,
        saveDebt,
        payDebtInstallment,
        deleteDebt,
        saveBill,
        toggleBillPaid,
        toggleSplitMemberPaid,
        deleteBill,
        saveSubscription,
        deleteSubscription,
        saveGoal,
        depositToGoal,
        deleteGoal,
        saveSocialDebt,
        paySocialDebt,
        deleteSocialDebt,
        resetData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance debe ser utilizado dentro de un FinanceProvider');
  }
  return context;
};
