import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { FixedExpensesScreen } from '../screens/FixedExpensesScreen';
import { SocialDebtsScreen } from '../screens/SocialDebtsScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';

export const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { totalOwedToMe, upcomingAlerts } = useFinance();
  const { colors, isDark } = useTheme();

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardScreen onNavigateTab={setCurrentTab} />;
      case 'fixed_expenses':
        return <FixedExpensesScreen />;
      case 'social':
        return <SocialDebtsScreen />;
      case 'goals':
        return <GoalsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <DashboardScreen onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 8),
        },
      ]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Pantalla activa */}
        <View style={styles.screenContainer}>{renderScreen()}</View>

        {/* Barra de Navegación Inferior (Bottom Tabs) */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: colors.tabBarBg,
              borderTopColor: colors.tabBarBorder,
              shadowColor: colors.cardShadow,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          {/* Tab 1: Resumen */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('dashboard')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                currentTab === 'dashboard' && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <Ionicons
                name={currentTab === 'dashboard' ? 'grid' : 'grid-outline'}
                size={20}
                color={
                  currentTab === 'dashboard'
                    ? colors.primary
                    : colors.tabBarInactive
                }
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    currentTab === 'dashboard'
                      ? colors.textPrimary
                      : colors.tabBarInactive,
                },
                currentTab === 'dashboard' && styles.tabLabelActive,
              ]}
            >
              Resumen
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Gastos Fijos */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('fixed_expenses')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                currentTab === 'fixed_expenses' && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <Ionicons
                name={
                  currentTab === 'fixed_expenses' ? 'wallet' : 'wallet-outline'
                }
                size={20}
                color={
                  currentTab === 'fixed_expenses'
                    ? colors.primary
                    : colors.tabBarInactive
                }
              />
              {upcomingAlerts.length > 0 && (
                <View style={styles.badgeAlert}>
                  <Text style={styles.badgeAlertText}>
                    {upcomingAlerts.length}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    currentTab === 'fixed_expenses'
                      ? colors.textPrimary
                      : colors.tabBarInactive,
                },
                currentTab === 'fixed_expenses' && styles.tabLabelActive,
              ]}
            >
              Fijos
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Cuentas Claras */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('social')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                currentTab === 'social' && {
                  backgroundColor: colors.successLight,
                },
              ]}
            >
              <Ionicons
                name={currentTab === 'social' ? 'people' : 'people-outline'}
                size={20}
                color={
                  currentTab === 'social'
                    ? colors.success
                    : colors.tabBarInactive
                }
              />
              {totalOwedToMe > 0 && <View style={styles.badgeGreen} />}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    currentTab === 'social'
                      ? colors.textPrimary
                      : colors.tabBarInactive,
                },
                currentTab === 'social' && styles.tabLabelActive,
              ]}
            >
              Claras
            </Text>
          </TouchableOpacity>

          {/* Tab 4: Metas */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('goals')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                currentTab === 'goals' && {
                  backgroundColor: isDark
                    ? 'rgba(56, 189, 248, 0.18)'
                    : '#E0F2FE',
                },
              ]}
            >
              <Ionicons
                name={currentTab === 'goals' ? 'trophy' : 'trophy-outline'}
                size={20}
                color={
                  currentTab === 'goals' ? '#0EA5E9' : colors.tabBarInactive
                }
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    currentTab === 'goals'
                      ? colors.textPrimary
                      : colors.tabBarInactive,
                },
                currentTab === 'goals' && styles.tabLabelActive,
              ]}
            >
              Metas
            </Text>
          </TouchableOpacity>

          {/* Tab 5: Perfil */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('profile')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrap,
                currentTab === 'profile' && {
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
            >
              <Ionicons
                name={currentTab === 'profile' ? 'person' : 'person-outline'}
                size={20}
                color={
                  currentTab === 'profile'
                    ? colors.textPrimary
                    : colors.tabBarInactive
                }
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    currentTab === 'profile'
                      ? colors.textPrimary
                      : colors.tabBarInactive,
                },
                currentTab === 'profile' && styles.tabLabelActive,
              ]}
            >
              Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 6,
    elevation: 10,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 38,
    height: 30,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  badgeAlert: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 15,
    height: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeAlertText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  badgeGreen: {
    position: 'absolute',
    top: -1,
    right: 4,
    backgroundColor: '#10B981',
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
