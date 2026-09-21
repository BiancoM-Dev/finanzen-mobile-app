import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { SocialDebtType } from '../models/types';
import { getDaysRemainingInMonth } from '../utils/dateUtils';
import { authService } from '../services/authService';
import { firestoreSyncService } from '../services/firestoreSyncService';
import { householdService } from '../services/householdService';

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

  // Estados de Firebase y Hogar Compartido (Fase 2)
  const [currentUser, setCurrentUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local' | 'syncing' | 'synced' | 'offline'

  const userListenerUnsubRef = useRef(null);
  const householdListenerUnsubRef = useRef(null);

  // Carga inicial de datos locales
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

  // Listener de autenticación y sincronización con Firebase
  useEffect(() => {
    loadAllData();

    const unsubscribeAuth = authService.onAuthStateChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        setSyncStatus('syncing');

        try {
          // Migrar o recuperar datos de Firestore
          const cloudData = await firestoreSyncService.migrateLocalDataToCloud(user.uid);
          if (cloudData) {
            if (cloudData.profile) setProfile(cloudData.profile);
            if (cloudData.bankAccounts) setBankAccounts(cloudData.bankAccounts);
            if (cloudData.debts) setDebts(cloudData.debts);
            if (cloudData.bills) setBills(cloudData.bills);
            if (cloudData.subscriptions) setSubscriptions(cloudData.subscriptions);
            if (cloudData.goals) setGoals(cloudData.goals);
            if (cloudData.socialDebts) setSocialDebts(cloudData.socialDebts);

            // Si el usuario pertenece a un Hogar Compartido
            const hid = cloudData.householdId || cloudData.profile?.householdId;
            if (hid) {
              attachHouseholdListener(hid);
            }
          }
          setSyncStatus('synced');

          // Escuchar cambios del documento de usuario en tiempo real
          if (userListenerUnsubRef.current) userListenerUnsubRef.current();
          userListenerUnsubRef.current = firestoreSyncService.listenToUserData(
            user.uid,
            (cloudSnap) => {
              if (!cloudSnap) return;
              if (cloudSnap.householdId && (!household || household.id !== cloudSnap.householdId)) {
                attachHouseholdListener(cloudSnap.householdId);
              }
            }
          );
        } catch (err) {
          console.warn('Advertencia en sincronización inicial de Firestore:', err);
          setSyncStatus('offline');
        }
      } else {
        setCurrentUser(null);
        setHousehold(null);
        setSyncStatus('local');

        if (userListenerUnsubRef.current) {
          userListenerUnsubRef.current();
          userListenerUnsubRef.current = null;
        }
        if (householdListenerUnsubRef.current) {
          householdListenerUnsubRef.current();
          householdListenerUnsubRef.current = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (userListenerUnsubRef.current) userListenerUnsubRef.current();
      if (householdListenerUnsubRef.current) householdListenerUnsubRef.current();
    };
  }, []);

  // Escuchar cambios en tiempo real del hogar compartido
  const attachHouseholdListener = (householdId) => {
    if (householdListenerUnsubRef.current) {
      householdListenerUnsubRef.current();
      householdListenerUnsubRef.current = null;
    }
    if (!householdId) {
      setHousehold(null);
      return;
    }

    householdListenerUnsubRef.current = householdService.listenToHousehold(
      householdId,
      (houseData) => {
        setHousehold(houseData);
        // Si el hogar tiene cuentas compartidas, integrarlas en la lista de cuentas
        if (houseData?.bills && houseData.bills.length > 0) {
          setBills((prevBills) => {
            const merged = [...prevBills];
            houseData.bills.forEach((hBill) => {
              const idx = merged.findIndex((b) => b.id === hBill.id);
              if (idx >= 0) {
                merged[idx] = { ...hBill, isHouseholdBill: true };
              } else {
                merged.unshift({ ...hBill, isHouseholdBill: true });
              }
            });
            return merged;
          });
        }
      },
      (error) => {
        console.warn('Error en listener de hogar:', error);
      }
    );
  };

  // Desconectar / Cerrar Sesión
  const signOutUser = async () => {
    if (userListenerUnsubRef.current) {
      userListenerUnsubRef.current();
      userListenerUnsubRef.current = null;
    }
    if (householdListenerUnsubRef.current) {
      householdListenerUnsubRef.current();
      householdListenerUnsubRef.current = null;
    }
    await authService.signOutUser();
    setCurrentUser(null);
    setHousehold(null);
    setSyncStatus('local');
    await loadAllData();
  };

  // Configurar hogar manualmente (después de crear o unirse)
  const setHouseholdData = (houseData) => {
    setHousehold(houseData);
    if (houseData?.id) {
      attachHouseholdListener(houseData.id);
    } else {
      if (householdListenerUnsubRef.current) {
        householdListenerUnsubRef.current();
        householdListenerUnsubRef.current = null;
      }
    }
  };

  // Helper para sincronizar un campo a Firestore de manera no bloqueante
  const syncFieldToCloud = (fieldName, data) => {
    if (currentUser?.uid) {
      firestoreSyncService.syncUserData(currentUser.uid, fieldName, data).catch((e) => {
        console.warn(`No se pudo sincronizar ${fieldName}:`, e);
      });
    }
  };

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

  // --- Métodos de Acción con Local-First + Cloud Sync ---

  // Perfil e Ingresos
  const updateProfile = async (newProfileData) => {
    const updated = await storageService.saveUserProfile({ ...profile, ...newProfileData });
    setProfile(updated);
    syncFieldToCloud('profile', updated);
  };

  const updateMonthlyIncome = async (newIncome) => {
    const updated = await storageService.saveUserProfile({ ...profile, monthlyIncome: newIncome });
    setProfile(updated);
    syncFieldToCloud('profile', updated);
  };

  // Cuentas Bancarias
  const saveBankAccount = async (account) => {
    const updated = await storageService.saveBankAccount(account);
    setBankAccounts(updated);
    syncFieldToCloud('bankAccounts', updated);
  };

  const deleteBankAccount = async (id) => {
    const updated = await storageService.deleteBankAccount(id);
    setBankAccounts(updated);
    syncFieldToCloud('bankAccounts', updated);
  };

  // Deudas
  const saveDebt = async (debt) => {
    const updated = await storageService.saveDebt(debt);
    setDebts(updated);
    syncFieldToCloud('debts', updated);
  };

  const payDebtInstallment = async (debtId, paymentData) => {
    const updated = await storageService.payDebtInstallment(debtId, paymentData);
    setDebts(updated);
    syncFieldToCloud('debts', updated);
  };

  const deleteDebt = async (id) => {
    const updated = await storageService.deleteDebt(id);
    setDebts(updated);
    syncFieldToCloud('debts', updated);
  };

  // Cuentas de Servicios
  const saveBill = async (bill) => {
    const updated = await storageService.saveBill(bill);
    setBills(updated);
    syncFieldToCloud('bills', updated);

    // Si es una cuenta compartida del hogar, sincronizar con el documento de hogar
    if (household?.id && (bill.isHouseholdBill || bill.isSplit)) {
      await householdService.saveHouseholdBill(household.id, bill);
    }
  };

  const toggleBillPaid = async (billId, receiptUri) => {
    const updated = await storageService.toggleBillPaid(billId, receiptUri);
    setBills(updated);
    syncFieldToCloud('bills', updated);

    // Sincronizar en hogar si existe
    if (household?.id) {
      const targetBill = updated.find((b) => b.id === billId);
      if (targetBill) {
        await householdService.saveHouseholdBill(household.id, targetBill);
      }
    }
  };

  const toggleSplitMemberPaid = async (billId, memberId, receiptUri) => {
    const updated = await storageService.toggleSplitMemberPaid(billId, memberId, receiptUri);
    setBills(updated);
    syncFieldToCloud('bills', updated);

    // Sincronizar estado en Firestore del Hogar
    if (household?.id) {
      await householdService.toggleSplitPayment(household.id, billId, memberId, receiptUri);
    }
  };

  const deleteBill = async (id) => {
    const updated = await storageService.deleteBill(id);
    setBills(updated);
    syncFieldToCloud('bills', updated);
  };

  // Suscripciones
  const saveSubscription = async (sub) => {
    const updated = await storageService.saveSubscription(sub);
    setSubscriptions(updated);
    syncFieldToCloud('subscriptions', updated);
  };

  const deleteSubscription = async (id) => {
    const updated = await storageService.deleteSubscription(id);
    setSubscriptions(updated);
    syncFieldToCloud('subscriptions', updated);
  };

  // Metas de Ahorro
  const saveGoal = async (goal) => {
    const updated = await storageService.saveGoal(goal);
    setGoals(updated);
    syncFieldToCloud('goals', updated);
  };

  const depositToGoal = async (goalId, depositData) => {
    const updated = await storageService.depositToGoal(goalId, depositData);
    setGoals(updated);
    syncFieldToCloud('goals', updated);
  };

  const deleteGoal = async (id) => {
    const updated = await storageService.deleteGoal(id);
    setGoals(updated);
    syncFieldToCloud('goals', updated);
  };

  // Préstamos Informales (Cuentas Claras)
  const saveSocialDebt = async (socialDebt) => {
    const updated = await storageService.saveSocialDebt(socialDebt);
    setSocialDebts(updated);
    syncFieldToCloud('socialDebts', updated);
  };

  const paySocialDebt = async (id, paymentData) => {
    const updated = await storageService.paySocialDebt(id, paymentData);
    setSocialDebts(updated);
    syncFieldToCloud('socialDebts', updated);
  };

  const deleteSocialDebt = async (id) => {
    const updated = await storageService.deleteSocialDebt(id);
    setSocialDebts(updated);
    syncFieldToCloud('socialDebts', updated);
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
        // Firebase & Hogar Compartido (Fase 2)
        currentUser,
        household,
        syncStatus,
        signOutUser,
        setHouseholdData,
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
