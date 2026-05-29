import { memo } from 'react';
import Badge from '@/components/badge';
import type { BadgeVariant } from '@/components/badge/Badge.type';
import type { ReleaseNoteTag } from '@/types';
import {
  cardStyle,
  leftColumnStyle,
  versionStyle,
  dateStyle,
  rightColumnStyle,
  tagsRowStyle,
  titleStyle,
  moreLinkStyle,
} from './ReleaseNoteCard.style';

export type ReleaseNoteCardProps = {
  version: string | null;
  tags: ReleaseNoteTag[];
  title: string;
  publishedAt: string;
};

const TAG_LABEL: Record<ReleaseNoteTag, string> = {
  NEW: '신규',
  IMPROVED: '개선',
  FIXED: '수정',
  NOTICE: '공지',
  SECURITY: '보안',
};

const TAG_VARIANT: Record<ReleaseNoteTag, BadgeVariant> = {
  NEW: 'success',
  IMPROVED: 'info',
  FIXED: 'warning',
  NOTICE: 'neutral',
  SECURITY: 'danger',
};

const formatDate = (iso: string): string => iso.slice(0, 10);

const ReleaseNoteCard = memo(({ version, tags, title, publishedAt }: ReleaseNoteCardProps) => {
  return (
    <article css={cardStyle}>
      <div css={leftColumnStyle}>
        {version && <span css={versionStyle}>v{version}</span>}
        <span css={dateStyle}>{formatDate(publishedAt)}</span>
      </div>
      <div css={rightColumnStyle}>
        {tags.length > 0 && (
          <div css={tagsRowStyle}>
            {tags.map((tag) => (
              <Badge key={tag} variant={TAG_VARIANT[tag]}>
                {TAG_LABEL[tag]}
              </Badge>
            ))}
          </div>
        )}
        <h3 css={titleStyle}>{title}</h3>
        <span css={moreLinkStyle}>자세히 보기 ›</span>
      </div>
    </article>
  );
});

ReleaseNoteCard.displayName = 'ReleaseNoteCard';
export default ReleaseNoteCard;
