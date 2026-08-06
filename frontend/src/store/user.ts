import { create } from 'zustand';
import type { User } from '../types';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
}

const useUserStore = create<UserState>(set => ({
  user: null,
  setUser: user => set(() => ({ user })),
}));

export const useUser = () => useUserStore(state => state.user);
export const useSetUser = () => useUserStore(state => state.setUser);
