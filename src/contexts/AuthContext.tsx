import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  globalError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    getRedirectResult(auth).then((cred) => {
      if (cred && cred.user) {
        syncUserToFirestore(cred.user);
      }
    }).catch((err: any) => {
      console.error(err);
      setGlobalError(err.message || 'Failed to complete Google sign-in redirect.');
    });

    return unsubscribe;
  }, []);

  const syncUserToFirestore = async (user: User) => {
    if (user.email) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
      }, { merge: true });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred && cred.user) {
        await syncUserToFirestore(cred.user);
      }
    } catch (error: any) {
      if (
        error.code === 'auth/popup-blocked' || 
        error.message?.includes('popup') || 
        error.message?.includes('auth/internal-error') ||
        error.code === 'auth/internal-error'
      ) {
        // Fallback to redirect if popup fails due to browser restrictions
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw error;
      }
    }
  };

  const loginWithEmail = async (e: string, p: string) => {
    const cred = await signInWithEmailAndPassword(auth, e, p);
    await syncUserToFirestore(cred.user);
  };

  const registerWithEmail = async (e: string, p: string) => {
    const cred = await createUserWithEmailAndPassword(auth, e, p);
    await syncUserToFirestore(cred.user);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    globalError,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
