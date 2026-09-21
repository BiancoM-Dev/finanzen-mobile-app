import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFinance } from '../context/FinanceContext';
import { BankAccountCard } from '../components/BankAccountCard';
import { AddBankAccountModal } from '../components/Modals/AddBankAccountModal';

export const ProfileScreen = () => {
  const {
    profile,
    bankAccounts,
    updateProfile,
    saveBankAccount,
    deleteBankAccount,
    resetData,
  } = useFinance();

  const [showAddBank, setShowAddBank] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');

  const handlePickAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.granted) {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          updateProfile({ avatarUri: res.assets[0].uri });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = () => {
    updateProfile({ name: name.trim() || 'Usuario', email: email.trim() });
    setIsEditingProfile(false);
  };

  const handleGoogleLink = () => {
    if (profile?.isGoogleLinked) {
      Alert.alert(
        'Cuenta de Google Vinculada',
        'Tu sesión está lista para sincronizar con Firebase Cloud Firestore en la Fase 2.'
      );
    } else {
      Alert.alert(
        'Vincular con Google',
        'En la Fase 2, esta acción abrirá Google Sign-In mediante Firebase Auth para habilitar gastos compartidos en pareja. ¿Deseas marcar tu cuenta como vinculada de prueba?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Vincular Ahora',
            onPress: () => {
              updateProfile({ isGoogleLinked: true, email: 'tu.cuenta.google@gmail.com' });
              Alert.alert('¡Excelente!', 'Perfil preparado con credencial de Google para Firebase.');
            },
          },
        ]
      );
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Restablecer datos de prueba',
      '¿Deseas recargar los datos semilla de ejemplo (deudas, cuentas de luz/agua, metas y préstamos)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restablecer', style: 'destructive', onPress: resetData },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil y Ajustes</Text>
          <Text style={styles.headerSubtitle}>
            Configuración personal, Google Auth y cuentas bancarias
          </Text>
        </View>

        {/* Tarjeta de Perfil de Usuario */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrap}>
            {profile?.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#3B82F6" />
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{profile?.name || 'Usuario'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setName(profile?.name || '');
                  setEmail(profile?.email || '');
                  setIsEditingProfile(true);
                }}
                style={styles.editBtn}
              >
                <Ionicons name="pencil" size={14} color="#6366F1" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userEmail}>{profile?.email || 'usuario@gmail.com'}</Text>
          </View>
        </View>

        {/* Vinculación con Google / Firebase */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Cuenta de Google & Firebase</Text>
              <Text style={styles.sectionSub}>
                Para compartir gastos en pareja y sincronización en la nube (Fase 2)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.googleBtn,
              profile?.isGoogleLinked && styles.googleBtnLinked,
            ]}
            onPress={handleGoogleLink}
            activeOpacity={0.8}
          >
            <Ionicons
              name={profile?.isGoogleLinked ? 'checkmark-circle' : 'logo-google'}
              size={18}
              color={profile?.isGoogleLinked ? '#10B981' : '#EA4335'}
            />
            <Text
              style={[
                styles.googleBtnText,
                profile?.isGoogleLinked && styles.googleBtnTextLinked,
              ]}
            >
              {profile?.isGoogleLinked
                ? 'Vinculado con Google (Listo para Firebase)'
                : 'Conectar con Cuenta de Google'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Billetera de Cuentas Bancarias */}
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitleText}>Billetera de Cuentas Bancarias</Text>
            <Text style={styles.sectionSubText}>
              Ordenadas por preferencia para recibir transferencias y recordatorios
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBankBtn}
            onPress={() => setShowAddBank(true)}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBankBtnText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {bankAccounts.length === 0 ? (
          <View style={styles.emptyBankCard}>
            <Text style={styles.emptyBankText}>
              No tienes cuentas bancarias registradas. Agrega una para copiar tus datos en 1 clic y compartirlos en WhatsApp.
            </Text>
          </View>
        ) : (
          bankAccounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onSetPrimary={(acc) => saveBankAccount({ ...acc, isPrimary: true })}
              onDelete={deleteBankAccount}
            />
          ))
        )}

        {/* Opciones Adicionales */}
        <View style={styles.optionsCard}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={handleResetData}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="refresh-circle-outline" size={22} color="#F59E0B" />
              <Text style={styles.optionText}>Restablecer datos de prueba</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.optionDivider} />

          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="phone-portrait-outline" size={22} color="#3B82F6" />
              <Text style={styles.optionText}>Plataforma</Text>
            </View>
            <Text style={styles.optionValue}>Android (React Native / Expo)</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Editar Perfil */}
      <Modal visible={isEditingProfile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <Text style={styles.inputLabel}>Tu Nombre</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="Ej. Juan Pérez"
            />

            <Text style={styles.inputLabel}>Tu Correo Electrónico</Text>
            <TextInput
              style={styles.modalInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="usuario@gmail.com"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditingProfile(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Añadir Cuenta Bancaria */}
      <AddBankAccountModal
        visible={showAddBank}
        onClose={() => setShowAddBank(false)}
        onSave={saveBankAccount}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 10,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    padding: 4,
    borderRadius: 12,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  editBtn: {
    padding: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  googleBtnLinked: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  googleBtnTextLinked: {
    color: '#059669',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  sectionSubText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addBankBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBankCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  emptyBankText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  optionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
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
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
    marginTop: 6,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
