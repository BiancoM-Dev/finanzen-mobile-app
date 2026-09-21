import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export const parseAuthError = (error) => {
  if (!error) return 'Ocurrió un error inesperado.';
  const code = error.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado. Intenta iniciar sesión.';
    case 'auth/invalid-email':
      return 'El formato de correo electrónico no es válido.';
    case 'auth/operation-not-allowed':
      return 'El método de inicio de sesión no está habilitado en Firebase Console.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido inhabilitada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    default:
      return error.message || 'Error al autenticar.';
  }
};

class AuthService {
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  async signUpWithEmail(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: parseAuthError(error) };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: parseAuthError(error) };
    }
  }

  async signInAsGuest() {
    try {
      const userCredential = await signInAnonymously(auth);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: parseAuthError(error) };
    }
  }

  async signOutUser() {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: parseAuthError(error) };
    }
  }
}

export const authService = new AuthService();
