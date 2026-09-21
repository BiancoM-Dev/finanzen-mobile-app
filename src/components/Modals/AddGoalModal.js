import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { parseCurrencyInput } from '../../utils/currencyFormatter';

export const AddGoalModal = ({ visible, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [targetAmountText, setTargetAmountText] = useState('');
  const [initialSavedText, setInitialSavedText] = useState('0');
  const [category, setCategory] = useState('Vehículo');
  const [motivationNote, setMotivationNote] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  const handlePickPhoto = async () => {
    try {
      Alert.alert('Foto de la meta', 'Selecciona una opción:', [
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
                setPhotoUri(res.assets[0].uri);
              }
            }
          },
        },
        {
          text: 'Galería',
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
                setPhotoUri(res.assets[0].uri);
              }
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = () => {
    const targetAmount = parseCurrencyInput(targetAmountText);
    const initialSaved = parseCurrencyInput(initialSavedText);

    if (!title.trim()) {
      Alert.alert('Falta información', 'Ingresa el nombre de tu meta (ej. Moto Yamaha).');
      return;
    }
    if (targetAmount <= 0) {
      Alert.alert('Monto requerido', 'Ingresa el monto objetivo de ahorro.');
      return;
    }

    const newGoal = {
      id: `goal_${Date.now()}`,
      title: title.trim(),
      targetAmount,
      currentAmount: initialSaved,
      category,
      photoUri,
      motivationNote: motivationNote.trim(),
      depositsHistory: initialSaved > 0 ? [
        {
          id: `dep_${Date.now()}`,
          amount: initialSaved,
          date: new Date().toISOString().split('T')[0],
          note: 'Ahorro inicial',
        }
      ] : [],
    };

    onSave(newGoal);

    // Reset
    setTitle('');
    setTargetAmountText('');
    setInitialSavedText('0');
    setMotivationNote('');
    setPhotoUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva Meta de Ahorro 🎯</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Foto de la meta */}
            <Text style={styles.label}>Foto de Motivación</Text>
            {photoUri ? (
              <View style={styles.photoPreviewWrap}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setPhotoUri(null)}
                >
                  <Ionicons name="trash" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoPlaceholder}
                onPress={handlePickPhoto}
              >
                <Ionicons name="image-outline" size={28} color="#3B82F6" />
                <Text style={styles.photoPlaceholderText}>
                  + Cargar foto de la meta (ej. la moto que quieres)
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>¿Qué quieres lograr?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Comprar Moto Yamaha, Viaje a la playa"
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Monto Objetivo</Text>
                <View style={styles.currencyWrap}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    keyboardType="numeric"
                    placeholder="3500000"
                    value={targetAmountText}
                    onChangeText={setTargetAmountText}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Ahorro Inicial (opcional)</Text>
                <View style={styles.currencyWrap}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    keyboardType="numeric"
                    placeholder="0"
                    value={initialSavedText}
                    onChangeText={setInitialSavedText}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>Nota motivacional</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Para no depender de buses y salir los fines de semana"
              value={motivationNote}
              onChangeText={setMotivationNote}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Crear Mi Meta</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '90%',
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
    color: '#1F2937',
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  photoPreviewWrap: {
    position: 'relative',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    padding: 6,
    borderRadius: 20,
  },
  photoPlaceholder: {
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoPlaceholderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginRight: 4,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
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
    fontSize: 16,
    fontWeight: '700',
  },
});
