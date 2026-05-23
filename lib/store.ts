// "use client";

import { create } from "zustand";
import { CartItem, Artwork, User, UserRole } from "./data";

interface AppState {
  /* ================= USER ================= */
  currentUser: User | null;
  userRole: UserRole;

  setUserRole: (role: UserRole) => void;
  setCurrentUser: (user: User | null) => void;

  /* ================= CART ================= */
  cart: CartItem[];

  setCart: (items: CartItem[]) => void;

  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  /* ================= UI ================= */
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  authMode: "login" | "signup";
  setAuthMode: (mode: "login" | "signup") => void;

  galleryRefreshKey: number;
  triggerGalleryRefresh: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  /* ================= USER ================= */
  currentUser: null,
  userRole: "buyer",

  setUserRole: (role) => {
    set({ userRole: role });
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  /* ================= CART ================= */
  cart: [],

  setCart: (items) => {
    set({
      cart: items || [],
    });
  },

  addToCart: (artwork) => {
    if (!artwork?.id) return;

    const cart = get().cart || [];

    const existing = cart.find((item) => item?.artwork?.id === artwork.id);

    if (existing) {
      set({
        cart: cart.map((item) =>
          item?.artwork?.id === artwork.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        ),
      });
    } else {
      set({
        cart: [
          ...cart,
          {
            artwork,
            quantity: 1,
          },
        ],
      });
    }

    set({
      isCartOpen: true,
    });
  },

  removeFromCart: (artworkId) => {
    set({
      cart: get().cart.filter((item) => item?.artwork?.id !== artworkId),
    });
  },

  updateQuantity: (artworkId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(artworkId);
      return;
    }

    set({
      cart: get().cart.map((item) =>
        item?.artwork?.id === artworkId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    });
  },

  clearCart: () => {
    set({
      cart: [],
    });
  },

  cartTotal: () => {
    return get().cart.reduce((total, item) => {
      const price = item?.artwork?.price || 0;
      const quantity = item?.quantity || 0;

      return total + price * quantity;
    }, 0);
  },

  cartCount: () => {
    const cart = get().cart || [];
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  },

  /* ================= UI ================= */
  isCartOpen: false,

  setCartOpen: (open) => {
    set({
      isCartOpen: open,
    });
  },

  isAuthModalOpen: false,

  setAuthModalOpen: (open) => {
    set({
      isAuthModalOpen: open,
    });
  },

  authMode: "login",

  setAuthMode: (mode) => {
    set({
      authMode: mode,
    });
  },
  galleryRefreshKey: 0,
  triggerGalleryRefresh: () =>
    set((state) => ({
      galleryRefreshKey: state.galleryRefreshKey + 1,
    })),
}));
