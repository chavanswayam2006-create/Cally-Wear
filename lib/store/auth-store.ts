import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
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
  login: (email: string, name?: string, phone?: string) => void;
  register: (name: string, email: string, phone: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, name?: string, phone?: string) => {
        const userName = name || email.split("@")[0];
        set({
          isAuthenticated: true,
          user: {
            id: `usr_${Date.now()}`,
            name: userName,
            email: email,
            phone: phone || "",
            isVip: true,
            addresses: [],
          },
        });
      },

      register: (name: string, email: string, phone: string) => {
        set({
          isAuthenticated: true,
          user: {
            id: `usr_${Date.now()}`,
            name,
            email,
            phone,
            isVip: true,
            addresses: [],
          },
        });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updated) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updated } : null,
        }));
      },
    }),
    {
      name: "cally_auth_session",
    }
  )
);
