import type { UserProfile } from '@/types/profile';
import { create } from 'zustand';

interface UserProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
}

export const useUserProfileStore = create<UserProfileState>(set => ({
  profile: null,
  setProfile: profile => set(() => ({ profile })),
}));

export const useSetProfile = () =>
  useUserProfileStore(state => state.setProfile);
