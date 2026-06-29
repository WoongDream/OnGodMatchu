import { useMemo } from 'react';
import useSWR from 'swr';
import { checkNicknameAvailability } from '@/api/auth';
import { matchesNicknamePolicy, normalizeNickname } from '@/lib/nickname';
import useDebouncedValue from './useDebouncedValue';

export type NicknameStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'invalid'
  | 'forbidden'
  | 'error';

export type UseNicknameCheckReturn = {
  status: NicknameStatus;
  message: string | undefined;
};

export type UseNicknameCheckOptions = {
  enabled?: boolean;
  exclude?: string;
};

export const NICKNAME_DEBOUNCE_MS = 350;

const MESSAGES: Record<NicknameStatus, string | undefined> = {
  idle: undefined,
  checking: '닉네임 확인 중...',
  available: '사용 가능한 닉네임입니다.',
  taken: '이미 사용 중인 닉네임입니다.',
  invalid: '닉네임은 2~10자, 한글·영문·숫자·_ 만 사용할 수 있습니다.',
  forbidden: '사용할 수 없는 닉네임입니다.',
  error: '닉네임 확인에 실패했습니다.',
};

/** 금지/예약 닉네임 — 무엇 때문에 막혔는지(matched) 함께 안내. */
const forbiddenMessage = (matched: string | null | undefined): string =>
  matched ? `사용할 수 없는 닉네임입니다. ‘${matched}’ 은(는) 쓸 수 없어요.` : MESSAGES.forbidden!;

const useNicknameCheck = (
  raw: string,
  options?: UseNicknameCheckOptions,
): UseNicknameCheckReturn => {
  const enabled = options?.enabled ?? true;
  const exclude = options?.exclude;

  const normalized = normalizeNickname(raw);
  const normalizedExclude = exclude ? normalizeNickname(exclude) : '';
  const isEmpty = normalized.length === 0;
  const isExcluded = normalizedExclude.length > 0 && normalized === normalizedExclude;
  const isPolicyOk = matchesNicknamePolicy(normalized);

  const debounced = useDebouncedValue(normalized, NICKNAME_DEBOUNCE_MS);
  const isSettled = debounced === normalized;

  const swrKey =
    enabled && !isEmpty && !isExcluded && isPolicyOk && isSettled
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
    if (isExcluded) {
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
    if (data.reason === 'forbidden') {
      return 'forbidden';
    }
    return 'error';
  }, [enabled, isEmpty, isExcluded, isPolicyOk, isSettled, error, isLoading, data]);

  const message = status === 'forbidden' ? forbiddenMessage(data?.matched) : MESSAGES[status];

  return { status, message };
};

export default useNicknameCheck;
