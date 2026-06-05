import instance from './instance';
import type {
  BoInquiry,
  BoInquiryListItem,
  InquiryFilter,
  InquiryListItem,
  InquiryStats,
  InquiryStatus,
  NotificationDraft,
  UserNotification,
} from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type InquiryCreatePayload = {
  title: string;
  content: string;
};

/** 문의 접수. 로그인 필요(정지 사용자도 허용). */
export const createInquiry = async (payload: InquiryCreatePayload): Promise<InquiryListItem> => {
  const res = await instance.post<ApiResponse<InquiryListItem>>('/api/inquiries', payload);
  return res.data.data;
};

/** 본인 문의 목록 (최신순) + 받은 답변(연결 알림). */
export const getMyInquiries = async (q?: {
  page?: number;
  size?: number;
}): Promise<Page<InquiryListItem>> => {
  const res = await instance.get<ApiResponse<Page<InquiryListItem>>>('/api/users/me/inquiries', {
    params: { page: q?.page ?? 0, size: q?.size ?? 20 },
  });
  return res.data.data;
};

// ── BO 문의 관리 (ADMIN/OWNER) ────────────────────────────────────────────

export type BoInquiryQuery = {
  filter?: InquiryFilter;
  query?: string;
  page?: number;
  size?: number;
};

export const getBoInquiries = async (q?: BoInquiryQuery): Promise<Page<BoInquiryListItem>> => {
  const res = await instance.get<ApiResponse<Page<BoInquiryListItem>>>('/api/admin/inquiries', {
    params: q,
  });
  return res.data.data;
};

export const getBoInquiryStats = async (): Promise<InquiryStats> => {
  const res = await instance.get<ApiResponse<InquiryStats>>('/api/admin/inquiries/stats');
  return res.data.data;
};

export const getBoInquiry = async (id: number): Promise<BoInquiry> => {
  const res = await instance.get<ApiResponse<BoInquiry>>(`/api/admin/inquiries/${id}`);
  return res.data.data;
};

/** 처리 상태 변경 (수동, 답변 발송과 독립). */
export const changeInquiryStatus = async (
  id: number,
  status: InquiryStatus,
): Promise<BoInquiry> => {
  const res = await instance.patch<ApiResponse<BoInquiry>>(`/api/admin/inquiries/${id}/status`, {
    status,
  });
  return res.data.data;
};

/** 답변 발송 — 문의 작성자에게 알림 발송 + 문의에 연결(여러 번 가능). */
export const answerInquiry = async (
  id: number,
  draft: NotificationDraft,
): Promise<UserNotification> => {
  const res = await instance.post<ApiResponse<UserNotification>>(
    `/api/admin/inquiries/${id}/answers`,
    draft,
  );
  return res.data.data;
};
