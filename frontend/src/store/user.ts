import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      setUser: user => set(() => ({ user })),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ user: state.user }),
    },
  ),
);

export const useUser = () => useUserStore(state => state.user);
export const useSetUser = () => useUserStore(state => state.setUser);
