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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
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

  const { colors, isDark, toggleTheme } = useTheme();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Mi Perfil y Ajustes
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Personalización, Modo Oscuro y cuentas bancarias
          </Text>
        </View>

        {/* Tarjeta de Perfil de Usuario */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrap}>
            {profile?.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons name="person" size={38} color={colors.primary} />
              </View>
            )}
            <View style={[styles.cameraIconBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {profile?.name || 'Usuario'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setName(profile?.name || '');
                  setEmail(profile?.email || '');
                  setIsEditingProfile(true);
                }}
                style={styles.editBtn}
              >
                <Ionicons name="pencil" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>
              {profile?.email || 'usuario@gmail.com'}
            </Text>
          </View>
        </View>

        {/* Selector de Modo Claro / Modo Oscuro */}
        <View
          style={[
            styles.themeCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.themeLeft}>
            <View
              style={[
                styles.themeIconWrap,
                {
                  backgroundColor: isDark
                    ? 'rgba(251, 191, 36, 0.15)'
                    : 'rgba(99, 102, 241, 0.15)',
                },
              ]}
            >
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={isDark ? '#FBBF24' : '#6366F1'}
              />
            </View>
            <View>
              <Text style={[styles.themeTitle, { color: colors.textPrimary }]}>
                {isDark ? 'Modo Oscuro (Dark)' : 'Modo Claro (Light)'}
              </Text>
              <Text style={[styles.themeSub, { color: colors.textMuted }]}>
                {isDark ? 'Tema nocturno de alto contraste' : 'Tema luminoso y limpio'}
              </Text>
            </View>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
            thumbColor={isDark ? '#F8FAFC' : '#FFFFFF'}
          />
        </View>

        {/* Vinculación con Google / Firebase */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View
              style={[
                styles.sectionIconWrap,
                {
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.18)'
                    : '#FEE2E2',
                },
              ]}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Cuenta de Google & Firebase
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                Para compartir gastos en pareja y sincronización en la nube (Fase 2)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.googleBtn,
              profile?.isGoogleLinked
                ? {
                    backgroundColor: colors.successLight,
                    borderColor: colors.successBorder,
                  }
                : {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                    borderColor: isDark ? '#7F1D1D' : '#FECACA',
                  },
            ]}
            onPress={handleGoogleLink}
            activeOpacity={0.8}
          >
            <Ionicons
              name={profile?.isGoogleLinked ? 'checkmark-circle' : 'logo-google'}
              size={18}
              color={profile?.isGoogleLinked ? colors.success : '#EA4335'}
            />
            <Text
              style={[
                styles.googleBtnText,
                { color: profile?.isGoogleLinked ? colors.success : '#DC2626' },
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
            <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
              Billetera de Cuentas Bancarias
            </Text>
            <Text style={[styles.sectionSubText, { color: colors.textMuted }]}>
              Ordenadas por preferencia para recibir transferencias
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBankBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddBank(true)}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBankBtnText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {bankAccounts.length === 0 ? (
          <View
            style={[
              styles.emptyBankCard,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.emptyBankText, { color: colors.textMuted }]}>
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
        <View
          style={[
            styles.optionsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity style={styles.optionRow} onPress={handleResetData}>
            <View style={styles.optionLeft}>
              <Ionicons name="refresh-circle-outline" size={22} color="#F59E0B" />
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                Restablecer datos de prueba
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />

          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="phone-portrait-outline" size={22} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                Plataforma
              </Text>
            </View>
            <Text style={[styles.optionValue, { color: colors.textMuted }]}>
              Android (React Native / Expo)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Editar Perfil */}
      <Modal visible={isEditingProfile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Editar Perfil
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Tu Nombre
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Tu Correo Electrónico
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="usuario@gmail.com"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditingProfile(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
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
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginVertical: 10,
    borderWidth: 1,
    gap: 16,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    padding: 5,
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
  },
  editBtn: {
    padding: 4,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  themeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeSub: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '500',
  },
  sectionCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionIconWrap: {
    padding: 10,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 8,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '800',
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
    letterSpacing: -0.3,
  },
  sectionSubText: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '500',
  },
  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  addBankBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyBankCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  emptyBankText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  optionsCard: {
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionDivider: {
    height: 1,
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
