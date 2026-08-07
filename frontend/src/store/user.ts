import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';

export const AUTH_STORAGE_KEY = 'auth-storage';

interface UserState {
  user: User | null;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setHydrated: (value: boolean) => void;
}

const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      isHydrated: false,
      setUser: user => set(() => ({ user })),
      setHydrated: isHydrated => set(() => ({ isHydrated })),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: state => ({ user: state.user }),
      onRehydrateStorage: () => state => {
        state?.setHydrated?.(true);
      },
    },
  ),
);

export const useUser = () => useUserStore(state => state.user);
export const useSetUser = () => useUserStore(state => state.setUser);
export const useUserHydrated = () => useUserStore(state => state.isHydrated);
