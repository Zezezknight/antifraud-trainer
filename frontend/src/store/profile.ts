import type { UserProfile } from '@/types/profile';
import { create } from 'zustand';

interface UserProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

export const useUserProfileStore = create<UserProfileState>(set => ({
  profile: null,
  setProfile: profile => set(() => ({ profile })),
}));

export const useUserProfile = () => useUserProfileStore(state => state.profile);
export const useSetUserProfile = () =>
  useUserProfileStore(state => state.setProfile);
