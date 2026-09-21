import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, parseCurrencyInput } from '../utils/currencyFormatter';

export const HeaderBalance = ({ onOpenProfile }) => {
  const {
    profile,
    monthlyIncome,
    totalFixedMonthlyExpenses,
    availableMonthlyBalance,
    upcomingAlerts,
    updateMonthlyIncome,
  } = useFinance();

  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncomeText, setTempIncomeText] = useState(monthlyIncome.toString());

  const handleSaveIncome = () => {
    const parsed = parseCurrencyInput(tempIncomeText);
    updateMonthlyIncome(parsed);
    setIsEditingIncome(false);
  };

  return (
    <View style={styles.container}>
      {/* Barra superior con saludo y botón de perfil */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greetingText}>Hola, {profile?.name || 'Bienvenido'} 👋</Text>
          <Text style={styles.subGreetingText}>Tu control financiero del mes</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onOpenProfile}
          activeOpacity={0.8}
        >
          <Ionicons name="person-circle-outline" size={38} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Tarjeta de Balance Principal */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>SALDO DISPONIBLE DEL MES</Text>
          <TouchableOpacity
            style={styles.editIncomeBadge}
            onPress={() => {
              setTempIncomeText(monthlyIncome.toString());
              setIsEditingIncome(true);
            }}
          >
            <Ionicons name="pencil" size={12} color="#6366F1" />
            <Text style={styles.editIncomeText}>Ingreso</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.balanceAmount,
            { color: availableMonthlyBalance >= 0 ? '#10B981' : '#EF4444' },
          ]}
        >
          {formatCurrency(availableMonthlyBalance)}
        </Text>

        <View style={styles.divider} />

        {/* Fila de Ingresos vs Gastos Fijos */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <View style={styles.metricIconWrapIncome}>
              <Ionicons name="arrow-up-circle" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={styles.metricLabel}>Ingresos</Text>
              <Text style={styles.metricValue}>{formatCurrency(monthlyIncome)}</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricIconWrapExpense}>
              <Ionicons name="arrow-down-circle" size={18} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.metricLabel}>Gastos Fijos</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(totalFixedMonthlyExpenses)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Alertas de vencimientos cercanos */}
      {upcomingAlerts.length > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {upcomingAlerts.length} vencimiento(s) en los próximos 7 días:
            </Text>
            <Text style={styles.alertSub} numberOfLines={1}>
              {upcomingAlerts[0].title} ({formatCurrency(upcomingAlerts[0].amount)}) - en {upcomingAlerts[0].days} días
            </Text>
          </View>
        </View>
      )}

      {/* Modal para editar ingreso mensual */}
      <Modal visible={isEditingIncome} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Ingreso Mensual</Text>
            <Text style={styles.modalDescription}>
              Indica tu sueldo o ingresos fijos totales del mes para calcular tu saldo libre.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={tempIncomeText}
                onChangeText={setTempIncomeText}
                placeholder="1000000"
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsEditingIncome(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleSaveIncome}
              >
                <Text style={styles.modalConfirmText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subGreetingText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  profileButton: {
    padding: 2,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#94A3B8',
  },
  editIncomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312E81',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  editIncomeText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIconWrapIncome: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 4,
    borderRadius: 20,
  },
  metricIconWrapExpense: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 4,
    borderRadius: 20,
  },
  metricLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    gap: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  alertSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4B5563',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingVertical: 10,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
