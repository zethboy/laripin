import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sign up with Email/Password
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Login with Email/Password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Google Login
  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  // Logout
  function logout() {
    setIsGuest(false);
    return signOut(auth);
  }

  // Guest Mode
  function playAsGuest() {
    setIsGuest(true);
    setCurrentUser(null);
  }

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth is not initialized. Check your .env file.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsGuest(false); // If true user logs in, remove guest state
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isGuest,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    playAsGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
