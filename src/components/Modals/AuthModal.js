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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';

export const AuthModal = ({ visible, onClose, onAuthSuccess }) => {
  const { colors, isDark } = useTheme();

  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleAuth = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    let res;
    if (isSignUp) {
      res = await authService.signUpWithEmail(
        email.trim(),
        password,
        displayName.trim() || 'Usuario'
      );
    } else {
      res = await authService.signInWithEmail(email.trim(), password);
    }
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await authService.signInAsGuest();
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      onAuthSuccess(res.user);
      onClose();
    }
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
                {isSignUp ? 'Crear Cuenta en FinanZen ☁️' : 'Iniciar Sesión 🔐'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Sincronización en la nube y gastos compartidos
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Mensaje de error si ocurre */}
            {errorMessage && (
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
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Selector Pestañas Iniciar Sesión / Registrarse */}
            <View
              style={[
                styles.tabContainer,
                { backgroundColor: colors.surfaceSubtle },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  !isSignUp && {
                    backgroundColor: colors.surface,
                    shadowColor: colors.cardShadow,
                    elevation: 2,
                  },
                ]}
                onPress={() => {
                  setIsSignUp(false);
                  setErrorMessage(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: !isSignUp ? colors.textPrimary : colors.textMuted },
                    !isSignUp && { fontWeight: '800' },
                  ]}
                >
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  isSignUp && {
                    backgroundColor: colors.surface,
                    shadowColor: colors.cardShadow,
                    elevation: 2,
                  },
                ]}
                onPress={() => {
                  setIsSignUp(true);
                  setErrorMessage(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isSignUp ? colors.textPrimary : colors.textMuted },
                    isSignUp && { fontWeight: '800' },
                  ]}
                >
                  Registrarme
                </Text>
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Tu Nombre
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
                  placeholder="Ej. Bianca"
                  placeholderTextColor={colors.textMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </>
            )}

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Correo Electrónico
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
              placeholder="tu.correo@ejemplo.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Contraseña
            </Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.textPrimary }]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={isSignUp ? 'person-add' : 'log-in-outline'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.submitBtnText}>
                    {isSignUp ? 'Crear Mi Cuenta' : 'Entrar a FinanZen'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>
                o también
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity
              style={[
                styles.guestBtn,
                { borderColor: colors.border, backgroundColor: colors.surfaceSubtle },
              ]}
              onPress={handleGuest}
              disabled={loading}
            >
              <Ionicons name="flash-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.guestBtnText, { color: colors.textSecondary }]}>
                Continuar como Invitado (Modo Local)
              </Text>
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
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
    marginBottom: 10,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
