"use client";

// =============================================
// lib/auth-context.tsx — Poori app mein user
// ka state manage karne ke liye
// =============================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getCurrentUser, logoutUser, isLoggedIn } from "./api";
import { useAppStore } from "@/lib/store";
import { getCart } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "artist" | "admin";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, 
  isAuthenticated: false,
  setUser: () => {},
  logout: () => {},
});

// ── Provider ───────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  const initAuth = async () => {
    try {
      if (isLoggedIn()) {
        const savedUser = getCurrentUser();

        if (savedUser && savedUser.id) {
          setUser(savedUser);
        } else {
          logoutUser();
        }
      }
    } catch (err) {
      console.error(err);
      logoutUser();
    } finally {
      setLoading(false);
      setAuthChecked(true); 
    }
  };

  initAuth();
}, []);

  // 2️⃣ Load cart AFTER user is set
useEffect(() => {
  if (!user) return;
  if (user.role === "admin") return;

  (async () => {
    try {
      const res = await getCart();
      const items = res?.items || res?.data || (Array.isArray(res) ? res : []);

      const currentCart = useAppStore.getState().cart;
      const backendIds = items.map((i: any) => i.artworkId);
      const localOnly = currentCart.filter(
        (i: any) => !backendIds.includes(i.id || i.artwork?.id)
      );

      useAppStore.getState().setCart([...items, ...localOnly]);
    } catch (err) {
      console.error("Cart load failed", err);
    }
  })();
}, [user?.id]);

  const logout = () => {
    logoutUser();
    setUser(null);
    useAppStore.getState().setCart([]); 
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, isAuthenticated: !!user, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ───────────────────────────────────
export const useAuth = () => useContext(AuthContext);
