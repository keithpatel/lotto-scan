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
    let unsubscribe: (() => void) | undefined;

    // First, check if we're returning from a redirect sign-in (mobile flow).
    // getRedirectResult resolves with the signed-in user after the page reloads.
    // We must await this BEFORE relying on onAuthStateChanged, otherwise the
    // loading state finishes before the redirect user is captured, causing
    // the login screen to flash again on mobile.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // Redirect sign-in succeeded — set user immediately
          setUser(result.user);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Redirect sign in error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          alert('This domain is not authorized for OAuth operations for your Firebase project. Please add your Vercel domain to the Authorized domains list in the Firebase Console -> Authentication -> Settings -> Authorized domains.');
        }
      })
      .finally(() => {
        // Always subscribe to auth state changes as the long-term listener.
        // This handles: returning users with persisted sessions, popup sign-in,
        // sign-out, and token refresh.
        unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
        });
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      // Use redirect on mobile devices to prevent popup blocking in webviews
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        alert('This domain is not authorized for OAuth operations for your Firebase project. Please add your Vercel domain to the Authorized domains list in the Firebase Console -> Authentication -> Settings -> Authorized domains.');
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
