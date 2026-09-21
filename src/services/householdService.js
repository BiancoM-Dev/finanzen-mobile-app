import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FNZ-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

class HouseholdService {
  /**
   * Crea un nuevo espacio de Hogar Compartido y genera código de invitación
   */
  async createHousehold(name, user) {
    try {
      const householdId = `house_${Date.now()}`;
      const inviteCode = generateInviteCode();
      const householdRef = doc(db, 'households', householdId);

      const creatorMember = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Miembro 1',
        email: user.email || '',
        role: 'admin',
        joinedAt: new Date().toISOString(),
      };

      const newHouseholdData = {
        id: householdId,
        name: name.trim() || 'Nuestro Hogar',
        inviteCode,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        members: [creatorMember],
        bills: [],
        activity: [
          {
            id: `act_${Date.now()}`,
            text: `Se creó el espacio "${name}"`,
            date: new Date().toISOString(),
          },
        ],
      };

      await setDoc(householdRef, newHouseholdData);

      // Vincular el ID de hogar al usuario
      await setDoc(
        doc(db, 'users', user.uid),
        { householdId, householdName: name },
        { merge: true }
      );

      return { household: newHouseholdData, error: null };
    } catch (error) {
      console.error('Error creando hogar en Firestore:', error);
      return { household: null, error: error.message };
    }
  }

  /**
   * Unirse a un hogar existente usando el código de invitación (ej. FNZ-4921)
   */
  async joinHouseholdWithCode(inviteCode, user) {
    try {
      const cleanCode = inviteCode.toUpperCase().trim();
      const q = query(
        collection(db, 'households'),
        where('inviteCode', '==', cleanCode)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return {
          household: null,
          error: 'Código de invitación no encontrado. Verifica las letras y números.',
        };
      }

      const householdDoc = snapshot.docs[0];
      const householdData = householdDoc.data();

      // Verificar si ya es miembro
      const isAlreadyMember = householdData.members?.some((m) => m.uid === user.uid);
      if (!isAlreadyMember) {
        const newMember = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Miembro',
          email: user.email || '',
          role: 'member',
          joinedAt: new Date().toISOString(),
        };

        await updateDoc(householdDoc.ref, {
          members: arrayUnion(newMember),
          activity: arrayUnion({
            id: `act_${Date.now()}`,
            text: `${newMember.name} se unió al hogar`,
            date: new Date().toISOString(),
          }),
        });

        householdData.members.push(newMember);
      }

      // Vincular ID de hogar al usuario
      await setDoc(
        doc(db, 'users', user.uid),
        { householdId: householdData.id, householdName: householdData.name },
        { merge: true }
      );

      return { household: householdData, error: null };
    } catch (error) {
      console.error('Error uniéndose a hogar:', error);
      return { household: null, error: error.message };
    }
  }

  /**
   * Escucha cambios en tiempo real del Hogar Compartido (cuentas, pagos, miembros)
   */
  listenToHousehold(householdId, onUpdate, onError) {
    if (!householdId) return () => {};
    const householdRef = doc(db, 'households', householdId);
    return onSnapshot(
      householdRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data());
        }
      },
      (error) => {
        console.error('Error en listener de hogar:', error);
        if (onError) onError(error);
      }
    );
  }

  /**
   * Agrega o actualiza una cuenta obligatoria compartida en el hogar
   */
  async saveHouseholdBill(householdId, bill) {
    try {
      const householdRef = doc(db, 'households', householdId);
      const docSnap = await getDoc(householdRef);

      if (!docSnap.exists()) return false;
      const data = docSnap.data();
      const existingBills = data.bills || [];

      const index = existingBills.findIndex((b) => b.id === bill.id);
      let updatedBills;
      if (index >= 0) {
        updatedBills = [...existingBills];
        updatedBills[index] = bill;
      } else {
        updatedBills = [bill, ...existingBills];
      }

      await updateDoc(householdRef, { bills: updatedBills });
      return true;
    } catch (error) {
      console.error('Error guardando cuenta compartida:', error);
      return false;
    }
  }

  /**
   * Alternar estado de pago de un miembro en una cuenta compartida
   */
  async toggleSplitPayment(householdId, billId, memberId, receiptUri = null) {
    try {
      const householdRef = doc(db, 'households', householdId);
      const docSnap = await getDoc(householdRef);
      if (!docSnap.exists()) return false;

      const data = docSnap.data();
      const updatedBills = (data.bills || []).map((b) => {
        if (b.id !== billId) return b;
        const updatedMembers = (b.splitMembers || []).map((m) => {
          if (m.id !== memberId && m.userId !== memberId) return m;
          const newPaid = !m.isPaid;
          return {
            ...m,
            isPaid: newPaid,
            paidDate: newPaid ? new Date().toISOString().split('T')[0] : null,
            receiptUri: newPaid ? (receiptUri || m.receiptUri || null) : null,
          };
        });
        const allPaid = updatedMembers.every((m) => m.isPaid);
        return { ...b, splitMembers: updatedMembers, isPaid: allPaid };
      });

      await updateDoc(householdRef, { bills: updatedBills });
      return true;
    } catch (error) {
      console.error('Error alternando pago en cuenta compartida:', error);
      return false;
    }
  }

  /**
   * Salir del hogar compartido
   */
  async leaveHousehold(householdId, userId) {
    try {
      const householdRef = doc(db, 'households', householdId);
      const docSnap = await getDoc(householdRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const memberToRemove = data.members?.find((m) => m.uid === userId);
        if (memberToRemove) {
          await updateDoc(householdRef, {
            members: arrayRemove(memberToRemove),
          });
        }
      }

      await updateDoc(doc(db, 'users', userId), {
        householdId: null,
        householdName: null,
      });

      return true;
    } catch (error) {
      console.error('Error saliendo de hogar:', error);
      return false;
    }
  }
}

export const householdService = new HouseholdService();
