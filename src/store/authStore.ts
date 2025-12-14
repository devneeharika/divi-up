import { create } from "zustand";
import type { User } from "firebase/auth";
import { auth } from "@/src/services/firebase";

type AuthState = {
  user: User | null;
  initializing: boolean;
  setUser: (user: User | null) => void;
  setInitializing: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  setUser: (user) => set({ user }),
  setInitializing: (value) => set({ initializing: value }),
}));

// Attach a Firebase listener once when this module is loaded
auth.onAuthStateChanged((firebaseUser) => {
  useAuthStore.getState().setUser(firebaseUser);
  useAuthStore.getState().setInitializing(false);
});
