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
};

// Datos semilla de demostración para el primer arranque
const SEED_DATA = {
  profile: {
    name: 'Usuario FinanZen',
    email: 'mi.usuario@gmail.com',
    avatarUri: null,
    preferredCurrency: '$',
    isGoogleLinked: false,
    monthlyIncome: 1200000,
  },
  bankAccounts: [
    {
      id: 'bank_1',
      bankName: 'BancoEstado',
      accountType: AccountType.VISTA_RUT,
      accountNumber: '12345678',
      holderName: 'Mi Nombre Completo',
      rutOrId: '12.345.678-9',
      aliasOrCvu: '',
      isPrimary: true,
      orderPriority: 1,
    },
    {
      id: 'bank_2',
      bankName: 'Mercado Pago / Tenpo',
      accountType: AccountType.BILLETERA_DIGITAL,
      accountNumber: 'CVU 000012345678',
      holderName: 'Mi Nombre Completo',
      rutOrId: '12.345.678-9',
      aliasOrCvu: 'mi.alias.pago',
      isPrimary: false,
      orderPriority: 2,
    },
  ],
  debts: [
    {
      id: 'debt_1',
      name: 'Crédito Moto Yamaha',
      totalAmount: 2800000,
      remainingAmount: 1866666,
      totalInstallments: 24,
      paidInstallments: 8,
      monthlyDueDate: 5,
      monthlyAmount: 116666,
      category: DebtCategory.AUTOMOTRIZ,
      notes: 'Financiamiento directo concesionario',
      paymentsHistory: [
        {
          id: 'pay_1',
          installmentNumber: 8,
          amount: 116666,
          date: '2026-09-05',
          receiptUri: null,
          notes: 'Cuota pagada por transferencia',
        },
      ],
    },
    {
      id: 'debt_2',
      name: 'Tarjeta de Crédito (Electrónicos)',
      totalAmount: 360000,
      remainingAmount: 120000,
      totalInstallments: 6,
      paidInstallments: 4,
      monthlyDueDate: 18,
      monthlyAmount: 60000,
      category: DebtCategory.TARJETA_CREDITO,
      notes: 'Compra de computador en cuotas sin interés',
      paymentsHistory: [],
    },
  ],
  bills: [
    {
      id: 'bill_1',
      name: 'Luz (Enel / CGE)',
      category: BillCategory.LUZ,
      estimatedAmount: 48000,
      dueDay: 12,
      isPaid: false,
      isSplit: true,
      splitMembers: [
        { id: 'm_1', name: 'Yo', amount: 24000, isPaid: true, paidDate: '2026-09-10', receiptUri: null },
        { id: 'm_2', name: 'Hermano', amount: 24000, isPaid: false, paidDate: null, receiptUri: null },
      ],
    },
    {
      id: 'bill_2',
      name: 'Agua Potable',
      category: BillCategory.AGUA,
      estimatedAmount: 22500,
      dueDay: 20,
      isPaid: false,
      isSplit: false,
      splitMembers: [],
    },
    {
      id: 'bill_3',
      name: 'Internet Fibra Óptica',
      category: BillCategory.INTERNET,
      estimatedAmount: 26990,
      dueDay: 15,
      isPaid: true,
      isSplit: false,
      splitMembers: [],
    },
  ],
  subscriptions: [
    {
      id: 'sub_1',
      name: 'Netflix',
      amount: 9490,
      category: SubscriptionCategory.STREAMING,
      billingCycle: 'monthly',
      renewalDay: 8,
      isActive: true,
    },
    {
      id: 'sub_2',
      name: 'Spotify Premium',
      amount: 4550,
      category: SubscriptionCategory.STREAMING,
      billingCycle: 'monthly',
      renewalDay: 24,
      isActive: true,
    },
    {
      id: 'sub_3',
      name: 'Gimnasio SmartFit',
      amount: 23900,
      category: SubscriptionCategory.GIMNASIO,
      billingCycle: 'monthly',
      renewalDay: 1,
      isActive: true,
    },
  ],
  goals: [
    {
      id: 'goal_1',
      title: 'Comprar Moto Yamaha FZ 250',
      targetAmount: 3900000,
      currentAmount: 1650000,
      targetDate: '2026-12-30',
      photoUri: null, // El usuario podrá cargar una foto real desde la galería o cámara
      category: 'Vehículo',
      motivationNote: 'Para moverme libre y salir a rutear los fines de semana. ¡Cada ahorro me acerca más!',
      depositsHistory: [
        { id: 'dep_1', amount: 650000, date: '2026-07-15', note: 'Ahorro base' },
        { id: 'dep_2', amount: 500000, date: '2026-08-20', note: 'Ahorro del mes' },
        { id: 'dep_3', amount: 500000, date: '2026-09-10', note: 'Abono extra por horas extras' },
      ],
    },
  ],
  socialDebts: [
    {
      id: 'soc_1',
      personName: 'Hermano',
      type: SocialDebtType.THEY_OWE_ME,
      concept: 'Compra de carne para el asado y súper',
      totalAmount: 28500,
      paidAmount: 0,
      date: '2026-09-18',
      status: 'pending',
      phone: '',
      receiptUri: null,
    },
    {
      id: 'soc_2',
      personName: 'Carlos (Amigo)',
      type: SocialDebtType.THEY_OWE_ME,
      concept: 'Entrada para el concierto',
      totalAmount: 45000,
      paidAmount: 20000,
      date: '2026-09-12',
      status: 'partial',
      phone: '',
      receiptUri: null,
    },
  ],
};

class StorageService {
  async initData() {
    try {
      const initialized = await AsyncStorage.getItem('@finanzen_initialized');
      if (!initialized) {
        await this.resetToSeedData();
      }
    } catch (e) {
      console.error('Error inicializando StorageService:', e);
    }
  }

  async resetToSeedData() {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(SEED_DATA.profile));
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(SEED_DATA.bankAccounts));
    await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(SEED_DATA.debts));
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(SEED_DATA.bills));
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(SEED_DATA.subscriptions));
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(SEED_DATA.goals));
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_DEBTS, JSON.stringify(SEED_DATA.socialDebts));
    await AsyncStorage.setItem('@finanzen_initialized', 'true');
  }

  // --- Perfil de Usuario ---
  async getUserProfile() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : SEED_DATA.profile;
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

  async deleteSocialDebt(id) {
    const list = await this.getSocialDebts();
    const updated = list.filter((i) => i.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_DEBTS, JSON.stringify(updated));
    return updated;
  }
}

export const storageService = new StorageService();
