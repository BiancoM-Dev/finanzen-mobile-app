import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { FixedExpensesScreen } from '../screens/FixedExpensesScreen';
import { SocialDebtsScreen } from '../screens/SocialDebtsScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useFinance } from '../context/FinanceContext';

export const AppNavigator = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { totalOwedToMe, upcomingAlerts } = useFinance();

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Pantalla activa */}
        <View style={styles.screenContainer}>{renderScreen()}</View>

        {/* Barra de Navegación Inferior (Bottom Tabs) */}
        <View style={styles.tabBar}>
          {/* Tab 1: Resumen */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('dashboard')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={currentTab === 'dashboard' ? 'grid' : 'grid-outline'}
              size={22}
              color={currentTab === 'dashboard' ? '#3B82F6' : '#94A3B8'}
            />
            <Text
              style={[
                styles.tabLabel,
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
            <View>
              <Ionicons
                name={currentTab === 'fixed_expenses' ? 'wallet' : 'wallet-outline'}
                size={22}
                color={currentTab === 'fixed_expenses' ? '#6366F1' : '#94A3B8'}
              />
              {upcomingAlerts.length > 0 && (
                <View style={styles.badgeAlert}>
                  <Text style={styles.badgeAlertText}>{upcomingAlerts.length}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
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
            <View>
              <Ionicons
                name={currentTab === 'social' ? 'people' : 'people-outline'}
                size={22}
                color={currentTab === 'social' ? '#10B981' : '#94A3B8'}
              />
              {totalOwedToMe > 0 && (
                <View style={styles.badgeGreen} />
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
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
            <Ionicons
              name={currentTab === 'goals' ? 'trophy' : 'trophy-outline'}
              size={22}
              color={currentTab === 'goals' ? '#F59E0B' : '#94A3B8'}
            />
            <Text
              style={[
                styles.tabLabel,
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
            <Ionicons
              name={currentTab === 'profile' ? 'person' : 'person-outline'}
              size={22}
              color={currentTab === 'profile' ? '#0F172A' : '#94A3B8'}
            />
            <Text
              style={[
                styles.tabLabel,
                currentTab === 'profile' && styles.tabLabelActive,
              ]}
            >
              Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  badgeAlert: {
    position: 'absolute',
    top: -3,
    right: -6,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeAlertText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  badgeGreen: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#10B981',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
