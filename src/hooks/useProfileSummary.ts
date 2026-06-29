import useSWR from 'swr';
import { getPublicProfileSummary } from '@/api/user';
import type { PublicProfileSummary } from '@/types';

export type UseProfileSummaryReturn = {
  summary: PublicProfileSummary | undefined;
  isLoading: boolean;
  error: unknown;
};

/** 타 유저 프로필 요약 SWR 훅. publicId 없으면 요청하지 않는다(key null). */
const useProfileSummary = (publicId?: string | null): UseProfileSummaryReturn => {
  const { data, error, isLoading } = useSWR<PublicProfileSummary>(
    publicId ? ['profile-summary', publicId] : null,
    () => getPublicProfileSummary(publicId as string),
  );
  return { summary: data, isLoading, error };
};

export default useProfileSummary;
