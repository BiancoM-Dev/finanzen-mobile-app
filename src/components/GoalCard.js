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
import { formatCurrency } from '../utils/currencyFormatter';
import { ProgressBar } from './ProgressBar';
import { AddContributionModal } from './Modals/AddContributionModal';

export const GoalCard = ({ goal, onDeposit, onUpdatePhoto, onDelete }) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const percent = Math.min(
    100,
    Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100)
  );

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isCompleted = percent >= 100;

  // Frase motivacional según avance
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
    <View style={styles.card}>
      {/* Portada con foto real de la meta */}
      <View style={styles.imageCoverContainer}>
        {goal.photoUri ? (
          <>
            <Image source={{ uri: goal.photoUri }} style={styles.coverImage} />
            <TouchableOpacity
              style={styles.changePhotoBadge}
              onPress={handlePickPhoto}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.placeholderCover}
            onPress={handlePickPhoto}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={32} color="#3B82F6" />
            <Text style={styles.placeholderCoverText}>
              + Sube una foto de tu meta (ej. tu moto)
            </Text>
            <Text style={styles.placeholderSub}>
              Tenerla visible todos los días te mantendrá motivado
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleDelete} style={styles.deleteCoverBtn}>
          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Título y Categoría */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{goal.title}</Text>
            {goal.motivationNote ? (
              <Text style={styles.motivationNote}>"{goal.motivationNote}"</Text>
            ) : null}
          </View>
          <View style={styles.percentPill}>
            <Text style={styles.percentPillText}>{percent}%</Text>
          </View>
        </View>

        {/* Montos */}
        <View style={styles.amountsRow}>
          <View>
            <Text style={styles.amountLabel}>Ahorrado hasta hoy</Text>
            <Text style={styles.currentAmount}>
              {formatCurrency(goal.currentAmount)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amountLabel}>Monto Objetivo</Text>
            <Text style={styles.targetAmount}>
              {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={percent}
            color={isCompleted ? '#10B981' : '#3B82F6'}
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
                  color={isReached ? '#F59E0B' : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.milestoneText,
                    isReached && styles.milestoneTextActive,
                  ]}
                >
                  {step}%
                </Text>
              </View>
            );
          })}
        </View>

        {/* Frase motivacional */}
        <View style={styles.motivationalBox}>
          <Ionicons name="sparkles" size={14} color="#6366F1" />
          <Text style={styles.motivationalText}>{getMotivationalPhrase()}</Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsRow}>
          {goal.depositsHistory && goal.depositsHistory.length > 0 && (
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Ionicons
                name={showHistory ? 'chevron-up' : 'receipt-outline'}
                size={16}
                color="#6B7280"
              />
              <Text style={styles.historyBtnText}>Aportes</Text>
            </TouchableOpacity>
          )}

          {!isCompleted && (
            <TouchableOpacity
              style={styles.depositBtn}
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
          <View style={styles.historyList}>
            <Text style={styles.historyListTitle}>Historial de Ahorros:</Text>
            {goal.depositsHistory.map((item, idx) => (
              <View key={item.id || idx} style={styles.historyRow}>
                <View>
                  <Text style={styles.historyDepositNote}>
                    {item.note || 'Aporte'}
                  </Text>
                  <Text style={styles.historyDepositDate}>{item.date}</Text>
                </View>
                <Text style={styles.historyDepositAmount}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageCoverContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#EEF2FF',
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
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    margin: 8,
    borderRadius: 14,
  },
  placeholderCoverText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    marginTop: 6,
  },
  placeholderSub: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteCoverBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
  },
  body: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  motivationNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6B7280',
    marginTop: 2,
  },
  percentPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  percentPillText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 13,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 2,
  },
  targetAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 2,
  },
  progressContainer: {
    marginVertical: 8,
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
    color: '#9CA3AF',
    fontWeight: '600',
  },
  milestoneTextActive: {
    color: '#D97706',
    fontWeight: '700',
  },
  motivationalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  motivationalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B21B6',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  historyBtnText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  depositBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  historyList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
  },
  historyListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDepositNote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyDepositDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  historyDepositAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
});
