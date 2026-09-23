import AsyncStorage from '@react-native-async-storage/async-storage';
import { DebtCategory, BillCategory, SubscriptionCategory, SocialDebtType, AccountType } from '../models/types';

const STORAGE_KEYS = {
  DEBTS: '@finanzen_debts',
  BILLS: '@finanzen_bills',
  SUBSCRIPTIONS: '@finanzen_subscriptions',
  GOALS: '@finanzen_goals',
  SOCIAL_DEBTS: '@finanzen_social_debts',
  BANK_ACCOUNTS: '@finanzen_bank_accounts',
  USER_PROFILE: '@finanzen_user_profile',
  INCOMES: '@finanzen_incomes',
};

// Perfil inicial limpio para comenzar desde 0
const CLEAN_PROFILE = {
  name: 'Mi Perfil',
  email: '',
  avatarUri: null,
  preferredCurrency: '$',
  isGoogleLinked: false,
  monthlyIncome: 0,
};

class StorageService {
  async initData() {
    try {
      const dataVersion = await AsyncStorage.getItem('@finanzen_data_version');
      // Si la versión no es v2_clean, purgamos los datos de prueba anteriores
      if (dataVersion !== 'v2_clean') {
        await this.clearAllData();
      }
    } catch (e) {
      console.error('Error inicializando StorageService:', e);
    }
  }

  async clearAllData() {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(CLEAN_PROFILE));
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_DEBTS, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify([]));
    await AsyncStorage.setItem('@finanzen_initialized', 'true');
    await AsyncStorage.setItem('@finanzen_data_version', 'v2_clean');
  }

  async resetToSeedData() {
    await this.clearAllData();
  }

  // --- Perfil de Usuario ---
  async getUserProfile() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : CLEAN_PROFILE;
  }

  async saveUserProfile(profile) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return profile;
  }

  // --- Billetera de Cuentas Bancarias ---
  async getBankAccounts() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    const accounts = data ? JSON.parse(data) : [];
    // Ordenar por prioridad
    return accounts.sort((a, b) => (a.orderPriority || 99) - (b.orderPriority || 99));
  }

  async saveBankAccount(account) {
    const accounts = await this.getBankAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    let updated;
    if (index >= 0) {
      updated = [...accounts];
      updated[index] = account;
    } else {
      updated = [...accounts, account];
    }
    // Si se marcó como primaria, desmarcar las demás
    if (account.isPrimary) {
      updated = updated.map((acc) => ({
        ...acc,
        isPrimary: acc.id === account.id,
      }));
    }
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updated));
    return updated;
  }

  async deleteBankAccount(id) {
    const accounts = await this.getBankAccounts();
    const updated = accounts.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isPrimary)) {
      updated[0].isPrimary = true;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updated));
    return updated;
  }

  // --- Deudas Formales ---
  async getDebts() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DEBTS);
    return data ? JSON.parse(data) : [];
  }

  async saveDebt(debt) {
    const debts = await this.getDebts();
    const index = debts.findIndex((d) => d.id === debt.id);
    let updated;
    if (index >= 0) {
      updated = [...debts];
      updated[index] = debt;
    } else {
      updated = [debt, ...debts];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(updated));
    return updated;
  }

  async payDebtInstallment(debtId, { amount, notes, receiptUri }) {
    const debts = await this.getDebts();
    const updated = debts.map((debt) => {
      if (debt.id !== debtId) return debt;
      const newPaidInstallments = (debt.paidInstallments || 0) + 1;
      const newRemaining = Math.max(0, (debt.remainingAmount || 0) - amount);
      const newPayment = {
        id: `pay_${Date.now()}`,
        installmentNumber: newPaidInstallments,
        amount,
        date: new Date().toISOString().split('T')[0],
        receiptUri: receiptUri || null,
        notes: notes || '',
      };
      return {
        ...debt,
        paidInstallments: newPaidInstallments,
        remainingAmount: newRemaining,
        paymentsHistory: [newPayment, ...(debt.paymentsHistory || [])],
      };
    });
    await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(updated));
    return updated;
  }

  async deleteDebt(id) {
    const debts = await this.getDebts();
    const updated = debts.filter((d) => d.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(updated));
    return updated;
  }

  // --- Cuentas Obligatorias (Servicios) ---
  async getBills() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BILLS);
    return data ? JSON.parse(data) : [];
  }

  async saveBill(bill) {
    const bills = await this.getBills();
    const index = bills.findIndex((b) => b.id === bill.id);
    let updated;
    if (index >= 0) {
      updated = [...bills];
      updated[index] = bill;
    } else {
      updated = [bill, ...bills];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(updated));
    return updated;
  }

  async toggleBillPaid(billId, receiptUri = null) {
    const bills = await this.getBills();
    const updated = bills.map((b) => {
      if (b.id !== billId) return b;
      const newPaidState = !b.isPaid;
      return {
        ...b,
        isPaid: newPaidState,
        paidDate: newPaidState ? new Date().toISOString().split('T')[0] : null,
        receiptUri: newPaidState ? (receiptUri || b.receiptUri || null) : null,
      };
    });
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(updated));
    return updated;
  }

  async toggleSplitMemberPaid(billId, memberId, receiptUri = null) {
    const bills = await this.getBills();
    const updated = bills.map((b) => {
      if (b.id !== billId) return b;
      const updatedMembers = (b.splitMembers || []).map((m) => {
        if (m.id !== memberId) return m;
        const newPaid = !m.isPaid;
        return {
          ...m,
          isPaid: newPaid,
          paidDate: newPaid ? new Date().toISOString().split('T')[0] : null,
          receiptUri: newPaid ? (receiptUri || m.receiptUri || null) : null,
        };
      });
      // Si todos los miembros pagaron, marcar la cuenta general como pagada
      const allMembersPaid = updatedMembers.every((m) => m.isPaid);
      return {
        ...b,
        splitMembers: updatedMembers,
        isPaid: allMembersPaid,
      };
    });
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(updated));
    return updated;
  }

  async deleteBill(id) {
    const bills = await this.getBills();
    const updated = bills.filter((b) => b.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(updated));
    return updated;
  }

  // --- Gastos Personales / Suscripciones ---
  async getSubscriptions() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return data ? JSON.parse(data) : [];
  }

  async saveSubscription(subscription) {
    const subs = await this.getSubscriptions();
    const index = subs.findIndex((s) => s.id === subscription.id);
    let updated;
    if (index >= 0) {
      updated = [...subs];
      updated[index] = subscription;
    } else {
      updated = [subscription, ...subs];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));
    return updated;
  }

  async deleteSubscription(id) {
    const subs = await this.getSubscriptions();
    const updated = subs.filter((s) => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));
    return updated;
  }

  // --- Metas de Ahorro ---
  async getGoals() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  }

  async saveGoal(goal) {
    const goals = await this.getGoals();
    const index = goals.findIndex((g) => g.id === goal.id);
    let updated;
    if (index >= 0) {
      updated = [...goals];
      updated[index] = goal;
    } else {
      updated = [goal, ...goals];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
    return updated;
  }

  async depositToGoal(goalId, { amount, note }) {
    const goals = await this.getGoals();
    const updated = goals.map((goal) => {
      if (goal.id !== goalId) return goal;
      const newCurrent = (goal.currentAmount || 0) + amount;
      const newDeposit = {
        id: `dep_${Date.now()}`,
        amount,
        date: new Date().toISOString().split('T')[0],
        note: note || 'Aporte a la meta',
      };
      return {
        ...goal,
        currentAmount: newCurrent,
        depositsHistory: [newDeposit, ...(goal.depositsHistory || [])],
      };
    });
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
    return updated;
  }

  async deleteGoal(id) {
    const goals = await this.getGoals();
    const updated = goals.filter((g) => g.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
    return updated;
  }

  // --- Módulo Cuentas Claras (Préstamos a Amigos/Familiares) ---
  async getSocialDebts() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SOCIAL_DEBTS);
    return data ? JSON.parse(data) : [];
  }

  async saveSocialDebt(item) {
    const list = await this.getSocialDebts();
    const index = list.findIndex((i) => i.id === item.id);
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
    } else {
      updated = [item, ...list];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_DEBTS, JSON.stringify(updated));
    return updated;
  }

  async paySocialDebt(id, { amount, receiptUri }) {
    const list = await this.getSocialDebts();
    const updated = list.map((item) => {
      if (item.id !== id) return item;
      const newPaid = (item.paidAmount || 0) + amount;
      const isComplete = newPaid >= item.totalAmount;
      return {
        ...item,
        paidAmount: newPaid,
        status: isComplete ? 'paid' : 'partial',
        receiptUri: receiptUri || item.receiptUri || null,
      };
    });
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_DEBTS, JSON.stringify(updated));
    return updated;
  }

  async adjustSocialDebt(id, { type, amount, reason }) {
    const list = await this.getSocialDebts();
    const updated = list.map((item) => {
      if (item.id !== id) return item;
      const numAmount = Math.abs(Number(amount)) || 0;
      let newTotal = item.totalAmount;

      if (type === 'INCREASE') {
        newTotal += numAmount;
      } else if (type === 'DECREASE') {
        newTotal = Math.max(item.paidAmount || 0, item.totalAmount - numAmount);
      }

      const isComplete = (item.paidAmount || 0) >= newTotal;
      const adjustment = {
        id: `adj_${Date.now()}`,
        type, // 'INCREASE' | 'DECREASE'
        amount: numAmount,
        reason: reason || (type === 'INCREASE' ? 'Aumento de deuda / Préstamo adicional' : 'Rebaja / Descuento aplicado'),
        date: new Date().toISOString(),
      };

      return {
        ...item,
        totalAmount: newTotal,
        status: isComplete ? 'paid' : ((item.paidAmount || 0) > 0 ? 'partial' : 'pending'),
        adjustments: [adjustment, ...(item.adjustments || [])],
      };
    });
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_DEBTS, JSON.stringify(updated));
    return updated;
  }

  async deleteSocialDebt(id) {
    const list = await this.getSocialDebts();
    const updated = list.filter((i) => i.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_DEBTS, JSON.stringify(updated));
    return updated;
  }

  // --- Ingresos Manuales / Variables (Personas sin sueldo fijo, freelancers, ventas) ---
  async getIncomes() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.INCOMES);
    return data ? JSON.parse(data) : [];
  }

  async saveIncome(income) {
    const incomes = await this.getIncomes();
    const index = incomes.findIndex((inc) => inc.id === income.id);
    let updated;
    if (index >= 0) {
      updated = [...incomes];
      updated[index] = income;
    } else {
      updated = [income, ...incomes];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(updated));
    return updated;
  }

  async deleteIncome(id) {
    const incomes = await this.getIncomes();
    const updated = incomes.filter((inc) => inc.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(updated));
    return updated;
  }
}

export const storageService = new StorageService();
