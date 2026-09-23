import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
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
    adjustSocialDebt,
    deleteSocialDebt,
  } = useFinance();

  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState(SocialDebtType.THEY_OWE_ME);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredItems = socialDebts.filter((item) => item.type === activeTab);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Cuentas Claras 🤝
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Favores y préstamos entre amigos y familiares sin olvidos
          </Text>
        </View>

        {/* Tarjeta de Resumen Balance de Favores */}
        <View
          style={[
            styles.balanceCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.cardShadow,
            },
          ]}
        >
          <View style={styles.balanceCol}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>
              Me deben dinero
            </Text>
            <Text style={[styles.balanceAmount, { color: colors.success }]}>
              {formatCurrency(totalOwedToMe)}
            </Text>
          </View>

          <View style={[styles.balanceDivider, { backgroundColor: colors.border }]} />

          <View style={styles.balanceCol}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>
              Debo a alguien
            </Text>
            <Text style={[styles.balanceAmount, { color: colors.danger }]}>
              {formatCurrency(totalIOwe)}
            </Text>
          </View>
        </View>

        {/* Pestañas: Me Deben vs Debo */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: colors.surfaceSubtle },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === SocialDebtType.THEY_OWE_ME && {
                backgroundColor: colors.surface,
                shadowColor: colors.cardShadow,
                elevation: 2,
              },
            ]}
            onPress={() => setActiveTab(SocialDebtType.THEY_OWE_ME)}
          >
            <Ionicons
              name="arrow-down"
              size={15}
              color={
                activeTab === SocialDebtType.THEY_OWE_ME
                  ? colors.success
                  : colors.textMuted
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === SocialDebtType.THEY_OWE_ME
                      ? colors.textPrimary
                      : colors.textMuted,
                },
                activeTab === SocialDebtType.THEY_OWE_ME && { fontWeight: '800' },
              ]}
            >
              Me Deben (
              {socialDebts.filter((s) => s.type === SocialDebtType.THEY_OWE_ME).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === SocialDebtType.I_OWE_THEM && {
                backgroundColor: colors.surface,
                shadowColor: colors.cardShadow,
                elevation: 2,
              },
            ]}
            onPress={() => setActiveTab(SocialDebtType.I_OWE_THEM)}
          >
            <Ionicons
              name="arrow-up"
              size={15}
              color={
                activeTab === SocialDebtType.I_OWE_THEM
                  ? colors.danger
                  : colors.textMuted
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === SocialDebtType.I_OWE_THEM
                      ? colors.textPrimary
                      : colors.textMuted,
                },
                activeTab === SocialDebtType.I_OWE_THEM && { fontWeight: '800' },
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
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                {activeTab === SocialDebtType.THEY_OWE_ME
                  ? 'Nadie te debe dinero'
                  : '¡No le debes nada a nadie!'}
              </Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>
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
                onAdjust={adjustSocialDebt}
                onDelete={deleteSocialDebt}
              />
            ))
          )}
        </ScrollView>

        {/* Botón flotante para registrar favor */}
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: colors.success }]}
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
  balanceCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 16,
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
    borderRadius: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
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
    fontWeight: '800',
  },
});
