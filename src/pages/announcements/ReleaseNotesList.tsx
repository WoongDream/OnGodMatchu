import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ReleaseNoteIcon } from '@/components/icon';
import { getAllReleaseNotes } from '@/lib/release-notes/getAll';
import ReleaseNoteCard from '@/components/release-note-card';
import {
  pageStyle,
  headerStyle,
  headerIconStyle,
  titleStyle,
  subtitleStyle,
  cardListStyle,
  emptyStyle,
} from './AnnouncementsList.style';

const ReleaseNotesList = memo(() => {
  const notes = useMemo(() => getAllReleaseNotes(), []);

  return (
    <section css={pageStyle}>
      <header css={headerStyle}>
        <span css={headerIconStyle}>
          <ReleaseNoteIcon size={22} />
        </span>
        <div>
          <h1 css={titleStyle}>릴리즈 노트</h1>
          <p css={subtitleStyle}>새 기능, 개선 사항, 버그 수정 내역을 정리했어요.</p>
        </div>
      </header>

      {notes.length === 0 ? (
        <div css={emptyStyle}>아직 등록된 릴리즈 노트가 없어요.</div>
      ) : (
        <div css={cardListStyle}>
          {notes.map((note) => (
            <Link
              key={note.version}
              to={`/announcements/release-notes/${note.version}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ReleaseNoteCard
                version={note.version}
                tags={note.tags}
                title={note.title}
                publishedAt={note.publishedAt}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
});

ReleaseNotesList.displayName = 'ReleaseNotesList';
export default ReleaseNotesList;
