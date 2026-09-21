import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BillCategory } from '../../models/types';
import { parseCurrencyInput } from '../../utils/currencyFormatter';
import { useTheme } from '../../context/ThemeContext';
import { useFinance } from '../../context/FinanceContext';

export const AddBillModal = ({ visible, onClose, onSave }) => {
  const { colors, isDark } = useTheme();
  const { household, currentUser } = useFinance();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(BillCategory.LUZ);
  const [amountText, setAmountText] = useState('');
  const [dueDayText, setDueDayText] = useState('15');
  const [isSplit, setIsSplit] = useState(false);
  const [isHouseholdBill, setIsHouseholdBill] = useState(false);
  const [membersText, setMembersText] = useState('Yo, Hermano');

  useEffect(() => {
    if (household) {
      setIsHouseholdBill(true);
      setIsSplit(true);
      const memberNames = (household.members || []).map((m) => m.name).join(', ');
      setMembersText(memberNames || 'Yo, Pareja');
    }
  }, [household, visible]);

  const handleSubmit = () => {
    const amount = parseCurrencyInput(amountText);
    const dueDay = parseInt(dueDayText, 10) || 1;

    if (!name.trim()) {
      Alert.alert('Falta información', 'Ingresa el nombre del servicio o cuenta.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa el monto estimado del mes.');
      return;
    }

    let splitMembers = [];
    if (isSplit || isHouseholdBill) {
      if (isHouseholdBill && household && household.members && household.members.length > 0) {
        const splitAmount = Math.round(amount / household.members.length);
        splitMembers = household.members.map((m) => {
          const isCurrentUser = m.uid === currentUser?.uid;
          return {
            id: `m_${m.uid || Date.now()}`,
            userId: m.uid,
            name: m.name,
            amount: splitAmount,
            isPaid: isCurrentUser, // El creador/pagador se marca pagado inicialmente
            paidDate: isCurrentUser ? new Date().toISOString().split('T')[0] : null,
            receiptUri: null,
          };
        });
      } else {
        const names = membersText
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean);

        if (names.length > 0) {
          const splitAmount = Math.round(amount / names.length);
          splitMembers = names.map((memberName, idx) => ({
            id: `m_${Date.now()}_${idx}`,
            name: memberName,
            amount: splitAmount,
            isPaid: memberName.toLowerCase() === 'yo',
            paidDate: memberName.toLowerCase() === 'yo' ? new Date().toISOString().split('T')[0] : null,
            receiptUri: null,
          }));
        }
      }
    }

    const newBill = {
      id: `bill_${Date.now()}`,
      name: name.trim(),
      category,
      estimatedAmount: amount,
      dueDay,
      isPaid: false,
      paidDate: null,
      receiptUri: null,
      isSplit: isSplit || isHouseholdBill,
      isHouseholdBill: isHouseholdBill && !!household,
      splitMembers,
    };

    onSave(newBill);

    // Reset
    setName('');
    setAmountText('');
    setDueDayText('15');
    setIsSplit(false);
    setIsHouseholdBill(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Nueva Cuenta Obligatoria
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Luz, agua, arriendo, gastos comunes
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Toggle para compartir con el Hogar si existe */}
            {household && (
              <View
                style={[
                  styles.householdBanner,
                  {
                    backgroundColor: isDark
                      ? 'rgba(59, 130, 246, 0.15)'
                      : '#EFF6FF',
                    borderColor: colors.primary,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.householdBannerTitle, { color: colors.primary }]}>
                    Compartir en "{household.name}" 🏡
                  </Text>
                  <Text style={[styles.householdBannerSub, { color: colors.textMuted }]}>
                    Sincroniza esta cuenta con tu pareja en tiempo real
                  </Text>
                </View>
                <Switch
                  value={isHouseholdBill}
                  onValueChange={(val) => {
                    setIsHouseholdBill(val);
                    if (val) setIsSplit(true);
                  }}
                  trackColor={{ false: '#CBD5E1', true: colors.primary }}
                  thumbColor={isHouseholdBill ? '#FFFFFF' : '#F8FAFC'}
                />
              </View>
            )}

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Nombre de la cuenta / Empresa
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
              placeholder="Ej. Luz Enel, Agua Andina, Arriendo"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Tipo de servicio
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {Object.values(BillCategory).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surfaceSubtle },
                    category === cat && { backgroundColor: '#F59E0B' },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.textSecondary },
                      category === cat && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Monto Estimado
                </Text>
                <View
                  style={[
                    styles.currencyWrap,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.prefix, { color: colors.textMuted }]}>$</Text>
                  <TextInput
                    style={[styles.currencyInput, { color: colors.textPrimary }]}
                    keyboardType="numeric"
                    placeholder="45000"
                    placeholderTextColor={colors.textMuted}
                    value={amountText}
                    onChangeText={setAmountText}
                  />
                </View>
              </View>

              <View style={{ width: 110 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Día Vencimiento
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.textPrimary,
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceSubtle,
                    },
                  ]}
                  keyboardType="numeric"
                  placeholder="Día (1-31)"
                  placeholderTextColor={colors.textMuted}
                  value={dueDayText}
                  onChangeText={setDueDayText}
                />
              </View>
            </View>

            {/* Opción de dividir de forma manual si no es de hogar */}
            {!isHouseholdBill && (
              <>
                <View
                  style={[
                    styles.splitToggleRow,
                    { borderTopColor: colors.borderSubtle },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.splitToggleTitle, { color: colors.textPrimary }]}>
                      Dividir con otras personas
                    </Text>
                    <Text style={[styles.splitToggleSub, { color: colors.textMuted }]}>
                      Calcula la cuota por persona y lleva registro de quién ya pagó.
                    </Text>
                  </View>
                  <Switch
                    value={isSplit}
                    onValueChange={setIsSplit}
                    trackColor={{ false: '#CBD5E1', true: colors.primary }}
                    thumbColor={isSplit ? '#FFFFFF' : '#F8FAFC'}
                  />
                </View>

                {isSplit && (
                  <View
                    style={[
                      styles.splitInputContainer,
                      {
                        backgroundColor: isDark
                          ? 'rgba(59, 130, 246, 0.1)'
                          : '#F0F9FF',
                        borderColor: isDark ? '#1E3A8A' : '#BAE6FD',
                      },
                    ]}
                  >
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Nombres de las personas (separados por coma)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.textPrimary,
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      placeholder="Ej. Yo, Hermano, Mamá"
                      placeholderTextColor={colors.textMuted}
                      value={membersText}
                      onChangeText={setMembersText}
                    />
                  </View>
                )}
              </>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Guardar Cuenta</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    maxHeight: '90%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  householdBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
    gap: 10,
  },
  householdBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  householdBannerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
  },
  splitToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  splitToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  splitToggleSub: {
    fontSize: 11,
    marginTop: 2,
    paddingRight: 8,
  },
  splitInputContainer: {
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  submitBtn: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
