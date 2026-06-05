import { useCallback } from 'react';
import useSWR from 'swr';
import { getBoInquiry } from '@/api/inquiry';
import type { BoInquiry } from '@/types';

export type UseBoInquiryReturn = {
  inquiry: BoInquiry | undefined;
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

/** BO 문의 단건 상세 (답변 목록 포함). id<=0 이면 비활성. */
const useBoInquiry = (id: number | null): UseBoInquiryReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    id != null && id > 0 ? ['admin', 'inquiry', id] : null,
    () => getBoInquiry(id as number),
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return { inquiry: data, isLoading, error, refresh };
};

export default useBoInquiry;
