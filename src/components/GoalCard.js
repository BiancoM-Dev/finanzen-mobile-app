import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { ProgressBar } from './ProgressBar';
import { AddContributionModal } from './Modals/AddContributionModal';

export const GoalCard = ({ goal, onDeposit, onUpdatePhoto, onDelete }) => {
  const { colors, isDark } = useTheme();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const percent = Math.min(
    100,
    Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100)
  );

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isCompleted = percent >= 100;

  const getMotivationalPhrase = () => {
    if (isCompleted) return '¡Felicidades! 🎉 Has cumplido tu gran meta.';
    if (percent >= 75) return '¡Casi lo tienes! Estás a un último empujón.';
    if (percent >= 50) return '¡Vas por la mitad! Tu esfuerzo se nota día a día.';
    if (percent >= 25) return '¡Gran despegue! El hábito del ahorro ya es tuyo.';
    return 'El primer paso es el más importante. ¡Sigue así!';
  };

  const handlePickPhoto = async () => {
    try {
      Alert.alert(
        'Foto de tu meta',
        '¿Cómo deseas agregar la foto?',
        [
          {
            text: 'Cámara',
            onPress: async () => {
              const perm = await ImagePicker.requestCameraPermissionsAsync();
              if (perm.granted) {
                const res = await ImagePicker.launchCameraAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [16, 9],
                  quality: 0.85,
                });
                if (!res.canceled && res.assets && res.assets.length > 0) {
                  onUpdatePhoto(goal.id, res.assets[0].uri);
                }
              }
            },
          },
          {
            text: 'Galería de fotos',
            onPress: async () => {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (perm.granted) {
                const res = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [16, 9],
                  quality: 0.85,
                });
                if (!res.canceled && res.assets && res.assets.length > 0) {
                  onUpdatePhoto(goal.id, res.assets[0].uri);
                }
              }
            },
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } catch (e) {
      console.error('Error al cargar foto:', e);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar meta',
      `¿Deseas eliminar la meta "${goal.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(goal.id) },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      {/* Portada con foto real de la meta */}
      <View
        style={[
          styles.imageCoverContainer,
          { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' },
        ]}
      >
        {goal.photoUri ? (
          <>
            <Image source={{ uri: goal.photoUri }} style={styles.coverImage} />
            <TouchableOpacity
              style={styles.changePhotoBadge}
              onPress={handlePickPhoto}
            >
              <Ionicons name="camera" size={13} color="#FFFFFF" />
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[
              styles.placeholderCover,
              {
                borderColor: colors.primary,
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : '#EFF6FF',
              },
            ]}
            onPress={handlePickPhoto}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={32} color={colors.primary} />
            <Text style={[styles.placeholderCoverText, { color: colors.primary }]}>
              + Sube una foto de tu meta (ej. tu moto)
            </Text>
            <Text style={[styles.placeholderSub, { color: colors.textMuted }]}>
              Tenerla visible todos los días te mantendrá motivado
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleDelete} style={styles.deleteCoverBtn}>
          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Título y Porcentaje */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {goal.title}
            </Text>
            {goal.motivationNote ? (
              <Text style={[styles.motivationNote, { color: colors.textMuted }]}>
                "{goal.motivationNote}"
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.percentPill,
              {
                backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : '#ECFDF5',
                borderColor: isDark ? '#065F46' : '#A7F3D0',
              },
            ]}
          >
            <Text
              style={[
                styles.percentPillText,
                { color: isDark ? '#34D399' : '#047857' },
              ]}
            >
              {percent}%
            </Text>
          </View>
        </View>

        {/* Montos */}
        <View style={styles.amountsRow}>
          <View>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
              Ahorrado hasta hoy
            </Text>
            <Text style={[styles.currentAmount, { color: colors.success }]}>
              {formatCurrency(goal.currentAmount)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
              Monto Objetivo
            </Text>
            <Text style={[styles.targetAmount, { color: colors.textSecondary }]}>
              {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={percent}
            color={isCompleted ? colors.success : colors.primary}
            height={10}
          />
        </View>

        {/* Hitos e insignias */}
        <View style={styles.milestonesRow}>
          {[25, 50, 75, 100].map((step) => {
            const isReached = percent >= step;
            return (
              <View key={step} style={styles.milestoneBadge}>
                <Ionicons
                  name={isReached ? 'ribbon' : 'ribbon-outline'}
                  size={14}
                  color={isReached ? '#F59E0B' : colors.textMuted}
                />
                <Text
                  style={[
                    styles.milestoneText,
                    { color: isReached ? '#F59E0B' : colors.textMuted },
                    isReached && { fontWeight: '800' },
                  ]}
                >
                  {step}%
                </Text>
              </View>
            );
          })}
        </View>

        {/* Frase motivacional */}
        <View
          style={[
            styles.motivationalBox,
            {
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.12)' : '#F5F3FF',
              borderColor: isDark ? '#4C1D95' : '#DDD6FE',
            },
          ]}
        >
          <Ionicons name="sparkles" size={15} color={colors.accentPurple} />
          <Text style={[styles.motivationalText, { color: colors.accentPurple }]}>
            {getMotivationalPhrase()}
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsRow}>
          {goal.depositsHistory && goal.depositsHistory.length > 0 && (
            <TouchableOpacity
              style={[styles.historyBtn, { backgroundColor: colors.surfaceSubtle }]}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Ionicons
                name={showHistory ? 'chevron-up' : 'receipt-outline'}
                size={15}
                color={colors.textSecondary}
              />
              <Text style={[styles.historyBtnText, { color: colors.textSecondary }]}>
                Aportes
              </Text>
            </TouchableOpacity>
          )}

          {!isCompleted && (
            <TouchableOpacity
              style={[styles.depositBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowDepositModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.depositBtnText}>Abonar Dinero</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Historial de depósitos */}
        {showHistory && goal.depositsHistory && (
          <View
            style={[
              styles.historyList,
              {
                backgroundColor: colors.surfaceSubtle,
                borderTopColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.historyListTitle, { color: colors.textSecondary }]}>
              Historial de Ahorros:
            </Text>
            {goal.depositsHistory.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[styles.historyRow, { borderBottomColor: colors.border }]}
              >
                <View>
                  <Text style={[styles.historyDepositNote, { color: colors.textPrimary }]}>
                    {item.note || 'Aporte'}
                  </Text>
                  <Text style={[styles.historyDepositDate, { color: colors.textMuted }]}>
                    {item.date}
                  </Text>
                </View>
                <Text style={[styles.historyDepositAmount, { color: colors.success }]}>
                  +{formatCurrency(item.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <AddContributionModal
        visible={showDepositModal}
        goal={goal}
        onClose={() => setShowDepositModal(false)}
        onConfirmDeposit={(depData) => onDeposit(goal.id, depData)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageCoverContainer: {
    width: '100%',
    height: 170,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    margin: 8,
    borderRadius: 18,
  },
  placeholderCoverText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  placeholderSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteCoverBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 7,
    borderRadius: 20,
  },
  body: {
    padding: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  motivationNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 3,
  },
  percentPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  percentPillText: {
    fontWeight: '900',
    fontSize: 13,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  currentAmount: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  targetAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  progressContainer: {
    marginVertical: 10,
  },
  milestonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: '600',
  },
  motivationalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    marginVertical: 12,
  },
  motivationalText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  depositBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  historyList: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  historyListTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  historyDepositNote: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyDepositDate: {
    fontSize: 11,
    marginTop: 1,
  },
  historyDepositAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
});
