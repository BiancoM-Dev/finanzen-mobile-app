import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { householdService } from '../../services/householdService';

export const HouseholdModal = ({
  visible,
  household,
  currentUser,
  onClose,
  onHouseholdUpdated,
}) => {
  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [householdName, setHouseholdName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCreate = async () => {
    if (!currentUser) {
      Alert.alert('Inicia Sesión', 'Debes iniciar sesión con tu cuenta para crear un hogar.');
      return;
    }
    if (!householdName.trim()) {
      setErrorMsg('Ingresa un nombre para tu hogar.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const res = await householdService.createHousehold(householdName, currentUser);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      Alert.alert('¡Hogar Creado!', `Comparte el código ${res.household.inviteCode} con tu pareja.`);
      onHouseholdUpdated(res.household);
      setHouseholdName('');
    }
  };

  const handleJoin = async () => {
    if (!currentUser) {
      Alert.alert('Inicia Sesión', 'Debes iniciar sesión para unirte a un hogar.');
      return;
    }
    if (!inviteCodeInput.trim()) {
      setErrorMsg('Ingresa el código de invitación.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const res = await householdService.joinHouseholdWithCode(
      inviteCodeInput.trim(),
      currentUser
    );
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      Alert.alert('¡Te has unido!', `Ahora formas parte de "${res.household.name}".`);
      onHouseholdUpdated(res.household);
      setInviteCodeInput('');
    }
  };

  const handleCopyCode = async () => {
    if (household?.inviteCode) {
      await Clipboard.setStringAsync(household.inviteCode);
      Alert.alert('¡Copiado!', 'Código de invitación copiado al portapapeles.');
    }
  };

  const handleShareWhatsApp = () => {
    if (!household?.inviteCode) return;
    const msg = `¡Hola! 😊 Te invito a compartir las cuentas del hogar en FinanZen.\n\n` +
      `Descarga la app y únete a *${household.name}* usando este código:\n\n` +
      `👉 *${household.inviteCode}*\n\n` +
      `¡Así podremos llevar el control de los gastos y transferencias en tiempo real!`;
    const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
    });
  };

  const handleLeaveHousehold = () => {
    Alert.alert(
      'Salir del Hogar',
      '¿Estás seguro de salir de este espacio compartido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await householdService.leaveHousehold(household.id, currentUser.uid);
            setLoading(false);
            onHouseholdUpdated(null);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Hogar Compartido 🏡
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Cuentas en pareja y finanzas familiares en tiempo real
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.15)'
                      : '#FEF2F2',
                    borderColor: isDark ? '#7F1D1D' : '#FECACA',
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {household ? (
              /* Usuario YA tiene un hogar creado o activo */
              <View>
                <View
                  style={[
                    styles.activeHouseholdCard,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.householdName, { color: colors.textPrimary }]}>
                    {household.name}
                  </Text>
                  <Text style={[styles.householdCreated, { color: colors.textMuted }]}>
                    Espacio sincronizado en tiempo real
                  </Text>

                  {/* Código de invitación destacado */}
                  <View
                    style={[
                      styles.codeBox,
                      {
                        backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.codeLabel, { color: colors.textMuted }]}>
                      CÓDIGO DE INVITACIÓN
                    </Text>
                    <Text style={[styles.codeValue, { color: colors.primary }]}>
                      {household.inviteCode}
                    </Text>
                    <Text style={[styles.codeSub, { color: colors.textMuted }]}>
                      Pásale este código a tu pareja para que lo ingrese en su app
                    </Text>
                  </View>

                  {/* Botones de compartir código */}
                  <View style={styles.shareButtonsRow}>
                    <TouchableOpacity
                      style={[
                        styles.copyBtn,
                        { borderColor: colors.border, backgroundColor: colors.surface },
                      ]}
                      onPress={handleCopyCode}
                    >
                      <Ionicons name="copy-outline" size={16} color={colors.textPrimary} />
                      <Text style={[styles.copyBtnText, { color: colors.textPrimary }]}>
                        Copiar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.whatsAppInviteBtn}
                      onPress={handleShareWhatsApp}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                      <Text style={styles.whatsAppInviteBtnText}>
                        Enviar por WhatsApp
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Lista de Miembros */}
                <Text style={[styles.membersTitle, { color: colors.textPrimary }]}>
                  Miembros en el Hogar ({household.members?.length || 1}):
                </Text>
                {(household.members || []).map((m, idx) => (
                  <View
                    key={m.uid || idx}
                    style={[
                      styles.memberRow,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.memberLeft}>
                      <Ionicons name="person-circle" size={28} color={colors.primary} />
                      <View>
                        <Text style={[styles.memberNameText, { color: colors.textPrimary }]}>
                          {m.name} {m.uid === currentUser?.uid ? '(Tú)' : ''}
                        </Text>
                        <Text style={[styles.memberEmailText, { color: colors.textMuted }]}>
                          {m.email || 'Miembro'}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor: m.role === 'admin' ? '#FEF3C7' : '#EFF6FF',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          {
                            color: m.role === 'admin' ? '#92400E' : '#1D4ED8',
                          },
                        ]}
                      >
                        {m.role === 'admin' ? 'Creador' : 'Pareja'}
                      </Text>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.leaveBtn}
                  onPress={handleLeaveHousehold}
                  disabled={loading}
                >
                  <Ionicons name="log-out-outline" size={16} color="#EF4444" />
                  <Text style={styles.leaveBtnText}>Salir de este Hogar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Usuario NO tiene hogar: Opciones Crear o Unirse */
              <View>
                <View
                  style={[
                    styles.tabContainer,
                    { backgroundColor: colors.surfaceSubtle },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.tabBtn,
                      activeTab === 'create' && {
                        backgroundColor: colors.surface,
                        shadowColor: colors.cardShadow,
                        elevation: 2,
                      },
                    ]}
                    onPress={() => {
                      setActiveTab('create');
                      setErrorMsg(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color:
                            activeTab === 'create'
                              ? colors.textPrimary
                              : colors.textMuted,
                        },
                        activeTab === 'create' && { fontWeight: '800' },
                      ]}
                    >
                      Crear Nuevo Hogar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tabBtn,
                      activeTab === 'join' && {
                        backgroundColor: colors.surface,
                        shadowColor: colors.cardShadow,
                        elevation: 2,
                      },
                    ]}
                    onPress={() => {
                      setActiveTab('join');
                      setErrorMsg(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color:
                            activeTab === 'join'
                              ? colors.textPrimary
                              : colors.textMuted,
                        },
                        activeTab === 'join' && { fontWeight: '800' },
                      ]}
                    >
                      Unirme con Código
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeTab === 'create' ? (
                  <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Nombre de tu Hogar
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
                      placeholder="Ej. Casa de Bianca & Pareja"
                      placeholderTextColor={colors.textMuted}
                      value={householdName}
                      onChangeText={setHouseholdName}
                    />

                    <TouchableOpacity
                      style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                      onPress={handleCreate}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="home" size={18} color="#FFFFFF" />
                          <Text style={styles.submitBtnText}>Crear y Obtener Código</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Ingresa el Código de Invitación
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.codeInput,
                        {
                          color: colors.textPrimary,
                          borderColor: colors.primary,
                          backgroundColor: colors.surfaceSubtle,
                        },
                      ]}
                      placeholder="FNZ-XXXX"
                      placeholderTextColor={colors.textMuted}
                      value={inviteCodeInput}
                      onChangeText={setInviteCodeInput}
                      autoCapitalize="characters"
                    />

                    <TouchableOpacity
                      style={[styles.submitBtn, { backgroundColor: colors.success }]}
                      onPress={handleJoin}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="people" size={18} color="#FFFFFF" />
                          <Text style={styles.submitBtnText}>Unirme al Hogar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
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
  modalCard: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
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
    fontSize: 20,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  activeHouseholdCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  householdName: {
    fontSize: 18,
    fontWeight: '800',
  },
  householdCreated: {
    fontSize: 11,
    marginTop: 2,
  },
  codeBox: {
    marginVertical: 14,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    marginVertical: 4,
  },
  codeSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  whatsAppInviteBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  whatsAppInviteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberNameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberEmailText: {
    fontSize: 11,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    gap: 6,
  },
  leaveBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  codeInput: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
