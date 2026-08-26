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
import { defaultRegionId } from "../config/regions.js";
import { listOfficers, resolveRoleForEmail } from "../services/officerService.js";

const AuthContext = createContext(null);
const OFFICER_ROLES = ["junior-officer", "senior-officer", "super-admin"];

// Role/zone are never taken from the client - they always come from
// VITE_ADMIN_EMAILS (super admin) or the officers roster, looked up fresh on
// every sign-in.
async function buildUser({ uid, email, name, photoURL }) {
  const roster = await listOfficers();
  const { role, zoneNumber } = resolveRoleForEmail(email, roster);
  return {
    uid,
    name: name || email?.split("@")[0] || "Citizen",
    email,
    photoURL: photoURL || "",
    role,
    zoneNumber,
    regionPreference: defaultRegionId,
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
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem("crowdsense-current-user");
        setLoading(false);
        return;
      }
      buildUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      }).then((normalized) => {
        setUser(normalized);
        upsertUser(normalized);
        localStorage.setItem("crowdsense-current-user", JSON.stringify(normalized));
        setLoading(false);
      });
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
    await signInWithPopup(auth, new GoogleAuthProvider());
    // onAuthStateChanged resolves the role/zone and updates context state.
  }, [signInDemo]);

  const signInEmail = useCallback(async (email, password) => {
    if (!isFirebaseConfigured) {
      const nextUser = await buildUser({ uid: `local-${email.toLowerCase()}`, email });
      setSession(nextUser);
      return nextUser;
    }
    await signInWithEmailAndPassword(auth, email, password);
    return null;
  }, [setSession]);

  const signUpEmail = useCallback(async (email, password, name) => {
    if (!isFirebaseConfigured) {
      const nextUser = await buildUser({ uid: `local-${email.toLowerCase()}`, email, name });
      setSession(nextUser);
      return nextUser;
    }
    await createUserWithEmailAndPassword(auth, email, password);
    return null;
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
      isAdmin: OFFICER_ROLES.includes(user?.role),
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
