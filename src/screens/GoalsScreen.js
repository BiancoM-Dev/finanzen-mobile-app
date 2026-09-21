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
import { GoalCard } from '../components/GoalCard';
import { AddGoalModal } from '../components/Modals/AddGoalModal';
import { ProgressBar } from '../components/ProgressBar';

export const GoalsScreen = () => {
  const {
    goals,
    totalSavedInGoals,
    totalTargetGoals,
    depositToGoal,
    saveGoal,
    deleteGoal,
  } = useFinance();

  const [showAddGoal, setShowAddGoal] = useState(false);

  const overallPercent = totalTargetGoals > 0
    ? Math.min(100, Math.round((totalSavedInGoals / totalTargetGoals) * 100))
    : 0;

  const handleUpdateGoalPhoto = (goalId, newPhotoUri) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      saveGoal({ ...goal, photoUri: newPhotoUri });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Metas de Ahorro 🚀</Text>
          <Text style={styles.headerSubtitle}>
            Tus sueños con fotos, hitos y motivación diaria
          </Text>
        </View>

        {/* Tarjeta de Progreso Global */}
        <View style={styles.globalCard}>
          <View style={styles.globalHeader}>
            <View>
              <Text style={styles.globalLabel}>PROGRESO TOTAL DE AHORRO</Text>
              <Text style={styles.globalAmount}>
                {formatCurrency(totalSavedInGoals)}
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{overallPercent}%</Text>
            </View>
          </View>

          <View style={styles.progressBarWrap}>
            <ProgressBar
              progress={overallPercent}
              color="#3B82F6"
              height={10}
              backgroundColor="#334155"
            />
          </View>

          <Text style={styles.globalTargetText}>
            Meta acumulada: {formatCurrency(totalTargetGoals)}
          </Text>
        </View>

        {/* Lista de Metas */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={54} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Aún no tienes metas de ahorro</Text>
              <Text style={styles.emptySub}>
                Crea una meta (ej. comprar una moto, viajar o renovar algo de tu hogar) y sube una foto real para motivarte.
              </Text>
            </View>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDeposit={depositToGoal}
                onUpdatePhoto={handleUpdateGoalPhoto}
                onDelete={deleteGoal}
              />
            ))
          )}
        </ScrollView>

        {/* Botón flotante para nueva meta */}
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => setShowAddGoal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.floatingBtnText}>Nueva Meta</Text>
        </TouchableOpacity>

        <AddGoalModal
          visible={showAddGoal}
          onClose={() => setShowAddGoal(false)}
          onSave={saveGoal}
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
  globalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  globalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  globalLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#94A3B8',
  },
  globalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#38BDF8',
    marginTop: 4,
  },
  percentBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarWrap: {
    marginVertical: 12,
  },
  globalTargetText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
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
    backgroundColor: '#3B82F6',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#3B82F6',
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
