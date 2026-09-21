import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { HeaderBalance } from '../components/HeaderBalance';
import { AddDebtModal } from '../components/Modals/AddDebtModal';
import { AddBillModal } from '../components/Modals/AddBillModal';
import { AddGoalModal } from '../components/Modals/AddGoalModal';
import { AddSocialDebtModal } from '../components/Modals/AddSocialDebtModal';

export const DashboardScreen = ({ navigation, onNavigateTab }) => {
  const {
    monthlyDebtsTotal,
    monthlyBillsTotal,
    monthlySubscriptionsTotal,
    totalRemainingDebt,
    totalSavedInGoals,
    totalTargetGoals,
    totalOwedToMe,
    totalIOwe,
    saveDebt,
    saveBill,
    saveGoal,
    saveSocialDebt,
  } = useFinance();

  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddSocial, setShowAddSocial] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cabecera y Balance Principal */}
        <HeaderBalance onOpenProfile={() => onNavigateTab('profile')} />

        {/* Acciones Rápidas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setShowAddDebt(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="card" size={20} color="#6366F1" />
            </View>
            <Text style={styles.quickActionText}>+ Deuda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setShowAddBill(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flash" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionText}>+ Cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setShowAddGoal(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="trophy" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>+ Meta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setShowAddSocial(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="people" size={20} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>+ Favor</Text>
          </TouchableOpacity>
        </View>

        {/* Resumen de Módulos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Panorama Financiero</Text>
        </View>

        {/* Tarjeta: Deuda Total Pendiente */}
        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() => onNavigateTab('fixed_expenses')}
          activeOpacity={0.85}
        >
          <View style={styles.summaryCardLeft}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trending-down" size={22} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Deuda Total Acumulada</Text>
              <Text style={styles.summarySubtitle}>
                Cuotas del mes: {formatCurrency(monthlyDebtsTotal)}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
              {formatCurrency(totalRemainingDebt)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Tarjeta: Metas de Ahorro */}
        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() => onNavigateTab('goals')}
          activeOpacity={0.85}
        >
          <View style={styles.summaryCardLeft}>
            <View style={[styles.summaryIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="rocket" size={22} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Ahorro en Metas (Ej. Moto)</Text>
              <Text style={styles.summarySubtitle}>
                Objetivo total: {formatCurrency(totalTargetGoals)}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {formatCurrency(totalSavedInGoals)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Tarjeta: Cuentas Claras (Me deben vs Debo) */}
        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() => onNavigateTab('social')}
          activeOpacity={0.85}
        >
          <View style={styles.summaryCardLeft}>
            <View style={[styles.summaryIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="chatbubbles" size={22} color="#16A34A" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Cuentas Claras (Amigos/Familia)</Text>
              <Text style={styles.summarySubtitle}>
                Te deben: {formatCurrency(totalOwedToMe)}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.summaryValue, { color: '#2563EB' }]}>
              {totalIOwe > 0 ? `Debes ${formatCurrency(totalIOwe)}` : 'Al día'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Desglose de Gastos Fijos del Mes */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Distribución de Gastos Fijos Mensuales</Text>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: '#6366F1' }]} />
              <Text style={styles.breakdownLabel}>Deudas</Text>
              <Text style={styles.breakdownAmount}>{formatCurrency(monthlyDebtsTotal)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.breakdownLabel}>Servicios</Text>
              <Text style={styles.breakdownAmount}>{formatCurrency(monthlyBillsTotal)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: '#EC4899' }]} />
              <Text style={styles.breakdownLabel}>Suscripciones</Text>
              <Text style={styles.breakdownAmount}>{formatCurrency(monthlySubscriptionsTotal)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modales rápidos */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    color: '#1F2937',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  quickIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  summarySubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 12,
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
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  breakdownAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
});
