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
import { SocialDebtCard } from '../components/SocialDebtCard';
import { AddSocialDebtModal } from '../components/Modals/AddSocialDebtModal';
import { SocialDebtType } from '../models/types';

export const SocialDebtsScreen = () => {
  const {
    socialDebts,
    totalOwedToMe,
    totalIOwe,
    saveSocialDebt,
    paySocialDebt,
    deleteSocialDebt,
  } = useFinance();

  const [activeTab, setActiveTab] = useState(SocialDebtType.THEY_OWE_ME);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredItems = socialDebts.filter((item) => item.type === activeTab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cuentas Claras 🤝</Text>
          <Text style={styles.headerSubtitle}>
            Favores y préstamos entre amigos y familiares sin olvidos
          </Text>
        </View>

        {/* Tarjeta de Resumen Balance de Favores */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>Me deben dinero</Text>
            <Text style={[styles.balanceAmount, { color: '#10B981' }]}>
              {formatCurrency(totalOwedToMe)}
            </Text>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>Debo a alguien</Text>
            <Text style={[styles.balanceAmount, { color: '#EF4444' }]}>
              {formatCurrency(totalIOwe)}
            </Text>
          </View>
        </View>

        {/* Pestañas: Me Deben vs Debo */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === SocialDebtType.THEY_OWE_ME && styles.tabBtnActiveGreen,
            ]}
            onPress={() => setActiveTab(SocialDebtType.THEY_OWE_ME)}
          >
            <Ionicons
              name="arrow-down-circle"
              size={16}
              color={activeTab === SocialDebtType.THEY_OWE_ME ? '#FFFFFF' : '#10B981'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === SocialDebtType.THEY_OWE_ME && styles.tabTextActive,
              ]}
            >
              Me Deben (
              {socialDebts.filter((s) => s.type === SocialDebtType.THEY_OWE_ME).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === SocialDebtType.I_OWE_THEM && styles.tabBtnActiveRed,
            ]}
            onPress={() => setActiveTab(SocialDebtType.I_OWE_THEM)}
          >
            <Ionicons
              name="arrow-up-circle"
              size={16}
              color={activeTab === SocialDebtType.I_OWE_THEM ? '#FFFFFF' : '#EF4444'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === SocialDebtType.I_OWE_THEM && styles.tabTextActive,
              ]}
            >
              Yo Debo (
              {socialDebts.filter((s) => s.type === SocialDebtType.I_OWE_THEM).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name={
                  activeTab === SocialDebtType.THEY_OWE_ME
                    ? 'happy-outline'
                    : 'thumbs-up-outline'
                }
                size={48}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>
                {activeTab === SocialDebtType.THEY_OWE_ME
                  ? 'Nadie te debe dinero'
                  : '¡No le debes nada a nadie!'}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === SocialDebtType.THEY_OWE_ME
                  ? 'Registra cuando hagas una compra en el súper, almuerzo o favor para no olvidarlo.'
                  : 'Tus cuentas con tus cercanos están completamente al día.'}
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <SocialDebtCard
                key={item.id}
                item={item}
                onPay={paySocialDebt}
                onDelete={deleteSocialDebt}
              />
            ))
          )}
        </ScrollView>

        {/* Botón flotante para registrar favor */}
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.floatingBtnText}>Registrar Favor</Text>
        </TouchableOpacity>

        <AddSocialDebtModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={saveSocialDebt}
        />
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
  balanceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 10,
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
  balanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 10,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActiveGreen: {
    backgroundColor: '#10B981',
  },
  tabBtnActiveRed: {
    backgroundColor: '#EF4444',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
