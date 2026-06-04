import instance from './instance';
import type { NoticeListItem, NoticeDetail } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type NoticePage = {
  content: NoticeListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type NoticeListQuery = {
  page?: number;
  size?: number;
};

export type NoticeErrorCode = 'NOTICE_NOT_FOUND' | 'NETWORK';

const buildQuery = (q: NoticeListQuery): string => {
  const params = new URLSearchParams();
  if (q.page !== undefined) {
    params.set('page', String(q.page));
  }
  if (q.size !== undefined) {
    params.set('size', String(q.size));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const getAnnouncements = async (q: NoticeListQuery = {}): Promise<NoticePage> => {
  const res = await instance.get<ApiResponse<NoticePage>>(`/api/announcements${buildQuery(q)}`);
  return res.data.data;
};

export const getAnnouncementDetail = async (id: number): Promise<NoticeDetail> => {
  const res = await instance.get<ApiResponse<NoticeDetail>>(`/api/announcements/${id}`);
  return res.data.data;
};
