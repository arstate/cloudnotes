import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  deadline: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  userId: string;
  theme: 'light' | 'dark' | 'system';
}

export const updateUserTheme = async (userId: string, theme: 'light' | 'dark' | 'system') => {
  const userRef = doc(db, 'users', userId);
  try {
    await setDoc(userRef, { theme }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};

export const subscribeToUserTheme = (userId: string, callback: (theme: 'light' | 'dark' | 'system') => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().theme || 'system');
    } else {
      callback('system');
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  });
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const createNote = async (userId: string): Promise<Note> => {
  const newNoteRef = doc(collection(db, 'notes'));
  const now = Timestamp.now();
  const newNote: Note = {
    id: newNoteRef.id,
    userId,
    title: '',
    content: '',
    isPinned: false,
    deadline: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newNoteRef, newNote);
    return newNote;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `notes/${newNoteRef.id}`);
    throw error;
  }
};

export const updateNote = async (noteId: string, updates: Partial<Note>) => {
  const noteRef = doc(db, 'notes', noteId);
  try {
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notes/${noteId}`);
  }
};

export const deleteNote = async (noteId: string) => {
  const noteRef = doc(db, 'notes', noteId);
  try {
    await deleteDoc(noteRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `notes/${noteId}`);
  }
};

export const subscribeToNotes = (userId: string, callback: (notes: Note[]) => void) => {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notes: Note[] = [];
    snapshot.forEach((doc) => {
      notes.push(doc.data() as Note);
    });
    callback(notes);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'notes');
  });
};
