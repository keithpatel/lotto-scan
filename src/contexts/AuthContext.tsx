import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle any pending redirect result (fallback flow if popup was blocked)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Redirect sign in error:', error);
      });

    // Primary auth state listener — handles persisted sessions, popup sign-in,
    // sign-out, and token refresh.
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Always try popup first — it works on both desktop AND modern mobile browsers.
      // signInWithRedirect is broken on mobile Safari/Chrome due to third-party cookie blocking.
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Popup sign in error:', error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        // Only fall back to redirect if the popup was actually blocked
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          console.error('Redirect sign in error:', redirectError);
          alert('Sign in failed. Please try again.');
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('This domain is not authorized for sign-in. Please add it to Firebase Console -> Authentication -> Settings -> Authorized domains.');
      } else {
        alert('Sign in failed: ' + error.message);
      }
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
