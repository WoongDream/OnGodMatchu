import useSWR from 'swr';
import useAuthStore from '@/store/authStore';
import { getMyProfile, getUserProfile } from '@/api/user';
import type { User } from '@/types';

export type UseProfileReturn = {
  profile: User | undefined;
  isLoading: boolean;
  error: unknown;
  isMe: boolean;
  mutate: () => Promise<User | undefined>;
};

const useProfile = (userId?: number): UseProfileReturn => {
  const me = useAuthStore((s) => s.user);
  const isMyRoute = userId === undefined;

  const key = isMyRoute ? (['profile', 'me'] as const) : (['profile', userId] as const);

  const { data, error, isLoading, mutate } = useSWR<User>(key, () =>
    isMyRoute ? getMyProfile() : getUserProfile(userId!),
  );

  const isMe = isMyRoute || (!!me && !!data && me.id === data.id);

  return {
    profile: data,
    isLoading,
    error,
    isMe,
    mutate: () => mutate(),
  };
};

export default useProfile;
