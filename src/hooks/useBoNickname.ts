import useSWR from 'swr';
import { getBoNickname } from '@/api/admin';
import type { ForbiddenNickname } from '@/types';

export type UseBoNicknameReturn = {
  rule: ForbiddenNickname | undefined;
  isLoading: boolean;
  error: unknown;
};

const useBoNickname = (id: number | undefined): UseBoNicknameReturn => {
  const key = id != null ? (['admin', 'nickname', id] as const) : null;
  const { data, error, isLoading } = useSWR(key, ([, , ruleId]) => getBoNickname(ruleId as number));
  return { rule: data, isLoading, error };
};

export default useBoNickname;
