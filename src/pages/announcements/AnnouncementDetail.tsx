import { memo } from 'react';
import { Link, useParams } from 'react-router-dom';
import useNoticeDetail from '@/hooks/useNoticeDetail';
import LegalDocument from '@/components/legal/LegalDocument';
import {
  detailStyle,
  detailHeaderStyle,
  detailTitleStyle,
  detailDateStyle,
  detailBodyStyle,
  backLinkStyle,
  notFoundStyle,
} from './AnnouncementDetail.style';

const formatDate = (iso: string): string => iso.slice(0, 10);

const AnnouncementDetail = memo(() => {
  const { slug } = useParams<{ slug: string }>();
  const { notice, isLoading, error } = useNoticeDetail(slug);

  if (isLoading) {
    return <div css={notFoundStyle}>불러오는 중...</div>;
  }

  if (error || !notice) {
    return (
      <div css={notFoundStyle}>
        <span>공지사항을 찾을 수 없습니다.</span>
        <Link to="/announcements/notices" css={backLinkStyle}>
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <article css={detailStyle}>
      <header css={detailHeaderStyle}>
        <Link to="/announcements/notices" css={backLinkStyle}>
          ‹ 공지사항 목록
        </Link>
        <h1 css={detailTitleStyle}>{notice.title}</h1>
        <span css={detailDateStyle}>{formatDate(notice.publishedAt)}</span>
      </header>
      <div css={detailBodyStyle}>
        <LegalDocument source={notice.content} />
      </div>
    </article>
  );
});

AnnouncementDetail.displayName = 'AnnouncementDetail';
export default AnnouncementDetail;
