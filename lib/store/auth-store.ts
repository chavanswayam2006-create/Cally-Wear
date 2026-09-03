import { create } from "zustand";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  isVip: boolean;
  addresses: Array<{
    id: string;
    isDefault: boolean;
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  }>;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false });
        return { success: false, error: data.error || "Login failed" };
      }
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch {
      set({ isLoading: false });
      return { success: false, error: "Network error during login" };
    }
  },

  register: async (name: string, email: string, password: string, phone: string = "") => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false });
        return { success: false, error: data.error || "Registration failed" };
      }
      set({ isLoading: false });
      return { success: true };
    } catch {
      set({ isLoading: false });
      return { success: false, error: "Network error during registration" };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  checkSession: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (updated) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          user: state.user ? { ...state.user, ...data.user } : null,
        }));
      }
    } catch {
      // ignore
    }
  },
}));
