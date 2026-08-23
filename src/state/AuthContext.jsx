import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../services/firebase.js";
import { readStore, upsertUser } from "../services/prototypeStore.js";

const AuthContext = createContext(null);

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "admin@crowdsense.local")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function roleForEmail(email) {
  return adminEmails.includes(email?.toLowerCase()) ? "admin" : "citizen";
}

function normalizeFirebaseUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Citizen",
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL || "",
    role: roleForEmail(firebaseUser.email),
    regionPreference: import.meta.env.VITE_DEFAULT_REGION_ID || "sati-vidisha",
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("crowdsense-current-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return onAuthStateChanged(auth, (firebaseUser) => {
      const normalized = normalizeFirebaseUser(firebaseUser);
      setUser(normalized);
      if (normalized) upsertUser(normalized);
      if (normalized) localStorage.setItem("crowdsense-current-user", JSON.stringify(normalized));
      else localStorage.removeItem("crowdsense-current-user");
      setLoading(false);
    });
  }, []);

  const setSession = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      upsertUser(nextUser);
      localStorage.setItem("crowdsense-current-user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("crowdsense-current-user");
    }
  }, []);

  const signInDemo = useCallback((role = "citizen") => {
    const store = readStore();
    const demo = store.users.find((item) => item.role === role) || store.users[0];
    setSession(demo);
    return demo;
  }, [setSession]);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) return signInDemo("citizen");
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return normalizeFirebaseUser(result.user);
  }, [signInDemo]);

  const signInEmail = useCallback(async (email, password) => {
    if (!isFirebaseConfigured) {
      const nextUser = {
        uid: `local-${email.toLowerCase()}`,
        name: email.split("@")[0],
        email,
        photoURL: "",
        role: roleForEmail(email),
        regionPreference: import.meta.env.VITE_DEFAULT_REGION_ID || "sati-vidisha",
        createdAt: new Date().toISOString(),
      };
      setSession(nextUser);
      return nextUser;
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return normalizeFirebaseUser(result.user);
  }, [setSession]);

  const signUpEmail = useCallback(async (email, password, name) => {
    if (!isFirebaseConfigured) {
      const nextUser = {
        uid: `local-${email.toLowerCase()}`,
        name: name || email.split("@")[0],
        email,
        photoURL: "",
        role: roleForEmail(email),
        regionPreference: import.meta.env.VITE_DEFAULT_REGION_ID || "sati-vidisha",
        createdAt: new Date().toISOString(),
      };
      setSession(nextUser);
      return nextUser;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const normalized = normalizeFirebaseUser(result.user);
    setSession({ ...normalized, name: name || normalized.name });
    return normalized;
  }, [setSession]);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) await signOut(auth);
    setSession(null);
  }, [setSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: ["admin", "super-admin"].includes(user?.role),
      signInDemo,
      signInWithGoogle,
      signInEmail,
      signUpEmail,
      logout,
    }),
    [loading, logout, signInDemo, signInEmail, signInWithGoogle, signUpEmail, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
