import { useMemo } from 'react';
import useSWR from 'swr';
import { checkNicknameAvailability } from '@/api/auth';
import { matchesNicknamePolicy, normalizeNickname } from '@/lib/nickname';
import useDebouncedValue from './useDebouncedValue';

export type NicknameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error';

export type UseNicknameCheckReturn = {
  status: NicknameStatus;
  message: string | undefined;
};

export type UseNicknameCheckOptions = {
  enabled?: boolean;
};

export const NICKNAME_DEBOUNCE_MS = 350;

const MESSAGES: Record<NicknameStatus, string | undefined> = {
  idle: undefined,
  checking: '닉네임 확인 중...',
  available: '사용 가능한 닉네임입니다.',
  taken: '이미 사용 중인 닉네임입니다.',
  invalid: '닉네임은 2~10자, 한글·영문·숫자·_ 만 사용할 수 있습니다.',
  error: '닉네임 확인에 실패했습니다.',
};

const useNicknameCheck = (
  raw: string,
  options?: UseNicknameCheckOptions,
): UseNicknameCheckReturn => {
  const enabled = options?.enabled ?? true;

  const normalized = normalizeNickname(raw);
  const isEmpty = normalized.length === 0;
  const isPolicyOk = matchesNicknamePolicy(normalized);

  const debounced = useDebouncedValue(normalized, NICKNAME_DEBOUNCE_MS);
  const isSettled = debounced === normalized;

  const swrKey =
    enabled && !isEmpty && isPolicyOk && isSettled
      ? (['check-nickname', debounced] as const)
      : null;

  const { data, error, isLoading } = useSWR(swrKey, ([, n]) => checkNicknameAvailability(n), {
    revalidateOnFocus: false,
  });

  const status: NicknameStatus = useMemo(() => {
    if (!enabled) {
      return 'idle';
    }
    if (isEmpty) {
      return 'idle';
    }
    if (!isPolicyOk) {
      return 'invalid';
    }
    if (!isSettled) {
      return 'checking';
    }
    if (error) {
      return 'error';
    }
    if (isLoading || !data) {
      return 'checking';
    }
    if (data.available) {
      return 'available';
    }
    if (data.reason === 'taken') {
      return 'taken';
    }
    if (data.reason === 'format') {
      return 'invalid';
    }
    return 'error';
  }, [enabled, isEmpty, isPolicyOk, isSettled, error, isLoading, data]);

  return { status, message: MESSAGES[status] };
};

export default useNicknameCheck;
