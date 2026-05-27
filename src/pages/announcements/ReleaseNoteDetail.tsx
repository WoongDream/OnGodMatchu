import { memo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '@/components/badge';
import type { BadgeVariant } from '@/components/badge/Badge.type';
import LegalDocument from '@/components/legal/LegalDocument';
import { getReleaseNoteByVersion } from '@/lib/release-notes/getAll';
import type { ReleaseNoteTag } from '@/types';
import {
  detailStyle,
  detailHeaderStyle,
  detailTitleStyle,
  detailDateStyle,
  detailBodyStyle,
  backLinkStyle,
  notFoundStyle,
  releaseHeaderRowStyle,
  versionStyle,
  tagsRowStyle,
} from './AnnouncementDetail.style';

const TAG_LABEL: Record<ReleaseNoteTag, string> = {
  NEW: '신규',
  IMPROVED: '개선',
  FIXED: '수정',
};

const TAG_VARIANT: Record<ReleaseNoteTag, BadgeVariant> = {
  NEW: 'success',
  IMPROVED: 'info',
  FIXED: 'warning',
};

const ReleaseNoteDetail = memo(() => {
  const { version } = useParams<{ version: string }>();
  const note = version ? getReleaseNoteByVersion(version) : undefined;

  if (!note) {
    return (
      <div css={notFoundStyle}>
        <span>릴리즈 노트를 찾을 수 없습니다.</span>
        <Link to="/announcements/release-notes" css={backLinkStyle}>
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <article css={detailStyle}>
      <header css={detailHeaderStyle}>
        <Link to="/announcements/release-notes" css={backLinkStyle}>
          ‹ 릴리즈 노트 목록
        </Link>
        <div css={releaseHeaderRowStyle}>
          <span css={versionStyle}>v{note.version}</span>
          <span css={detailDateStyle}>{note.publishedAt}</span>
        </div>
        <h1 css={detailTitleStyle}>{note.title}</h1>
        {note.tags.length > 0 && (
          <div css={tagsRowStyle}>
            {note.tags.map((tag) => (
              <Badge key={tag} variant={TAG_VARIANT[tag]}>
                {TAG_LABEL[tag]}
              </Badge>
            ))}
          </div>
        )}
      </header>
      <div css={detailBodyStyle}>
        <LegalDocument source={note.body} />
      </div>
    </article>
  );
});

ReleaseNoteDetail.displayName = 'ReleaseNoteDetail';
export default ReleaseNoteDetail;
