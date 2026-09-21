import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { storageService } from './storageService';

class FirestoreSyncService {
  /**
   * Sincroniza todos los datos locales existentes a la nube cuando el usuario inicia sesión
   */
  async migrateLocalDataToCloud(userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      const [localDebts, localBills, localSubs, localGoals, localSocial, localBanks, localProfile] =
        await Promise.all([
          storageService.getDebts(),
          storageService.getBills(),
          storageService.getSubscriptions(),
          storageService.getGoals(),
          storageService.getSocialDebts(),
          storageService.getBankAccounts(),
          storageService.getUserProfile(),
        ]);

      // Si el usuario ya tenía datos en la nube, los combinamos o usamos los de la nube
      if (userSnap.exists()) {
        const cloudData = userSnap.data();
        return {
          debts: cloudData.debts || localDebts,
          bills: cloudData.bills || localBills,
          subscriptions: cloudData.subscriptions || localSubs,
          goals: cloudData.goals || localGoals,
          socialDebts: cloudData.socialDebts || localSocial,
          bankAccounts: cloudData.bankAccounts || localBanks,
          profile: { ...localProfile, ...(cloudData.profile || {}) },
          householdId: cloudData.householdId || null,
        };
      }

      // Si es usuario nuevo en Firestore, subimos los datos locales
      const initialPayload = {
        profile: localProfile,
        bankAccounts: localBanks,
        debts: localDebts,
        bills: localBills,
        subscriptions: localSubs,
        goals: localGoals,
        socialDebts: localSocial,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, initialPayload, { merge: true });
      return initialPayload;
    } catch (error) {
      console.error('Error migrando datos a Firestore:', error);
      return null;
    }
  }

  /**
   * Guarda un cambio específico en Firestore para el usuario activo
   */
  async syncUserData(userId, fieldName, data) {
    if (!userId) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(
        userDocRef,
        {
          [fieldName]: data,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error(`Error sincronizando ${fieldName} en Firestore:`, error);
    }
  }

  /**
   * Escucha cambios en vivo de los datos del usuario en Firestore
   */
  listenToUserData(userId, onUpdate) {
    if (!userId) return () => {};
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data());
      }
    });
  }
}

export const firestoreSyncService = new FirestoreSyncService();
