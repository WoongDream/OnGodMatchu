import { memo, useEffect, useRef, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import Button from '@/components/button/Button';
import Input from '@/components/input/Input';
import { useToast } from '@/components/toast';
import InquiryCard from '@/features/inquiry/InquiryCard';
import ReceivedNotificationModal from '@/features/notification/ReceivedNotificationModal';
import { createInquiry } from '@/api/inquiry';
import useMyInquiries from '@/hooks/useMyInquiries';
import type { User, UserNotification } from '@/types';
import {
  counterStyle,
  countStyle,
  emptyStyle,
  fieldHeaderStyle,
  fieldLabelStyle,
  fieldStyle,
  footerStyle,
  listStyle,
  messageStyle,
  noteStyle,
  panelStyle,
  panelTitleStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  sentinelStyle,
  textareaStyle,
  titleStyle,
  wrapperStyle,
} from './ProfileInquiries.style';

type OutletContext = {
  profile: User;
  isMe: boolean;
};

const TITLE_MAX_LENGTH = 50;
const CONTENT_MAX_LENGTH = 1000;

const ProfileInquiries = memo(() => {
  const { isMe } = useOutletContext<OutletContext>();
  const toast = useToast();

  const { items, totalElements, isLoading, isLoadingMore, hasNext, error, loadMore, refresh } =
    useMyInquiries();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<UserNotification | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current || !hasNext) {
      return;
    }
    const target = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNext, loadMore, items.length]);

  if (!isMe) {
    return <Navigate to=".." replace />;
  }

  const canSubmit = title.trim() !== '' && content.trim() !== '' && !isSubmitting;

  const handleReset = () => {
    setTitle('');
    setContent('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setIsSubmitting(true);
    try {
      await createInquiry({ title: title.trim(), content: content.trim() });
      handleReset();
      refresh();
      toast.success('문의가 접수되었어요.');
    } catch {
      toast.error('문의 접수에 실패했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInitialLoad = isLoading && items.length === 0;
  const isEmpty = !isLoading && items.length === 0 && !error;

  return (
    <section css={wrapperStyle}>
      <h2 css={titleStyle}>문의하기</h2>

      <section css={panelStyle}>
        <h3 css={panelTitleStyle}>새 문의</h3>

        <div css={fieldStyle}>
          <div css={fieldHeaderStyle}>
            <span css={fieldLabelStyle}>제목</span>
            <span css={counterStyle}>
              {title.length}/{TITLE_MAX_LENGTH}
            </span>
          </div>
          <Input
            value={title}
            onChange={(value) => setTitle(value.slice(0, TITLE_MAX_LENGTH))}
            placeholder="문의 제목을 입력하세요"
          />
        </div>

        <div css={fieldStyle}>
          <div css={fieldHeaderStyle}>
            <span css={fieldLabelStyle}>내용</span>
            <span css={counterStyle}>
              {content.length}/{CONTENT_MAX_LENGTH}
            </span>
          </div>
          <textarea
            css={textareaStyle}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의하실 내용을 자세히 적어주세요. 빠르게 확인하고 답변드릴게요."
            maxLength={CONTENT_MAX_LENGTH}
            rows={7}
          />
        </div>

        <div css={footerStyle}>
          <Button variant="secondary" onClick={handleReset} disabled={isSubmitting}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? '접수 중...' : '문의 접수'}
          </Button>
        </div>

        <p css={noteStyle}>접수된 문의는 운영팀이 확인 후 받은 알림으로 답변을 보내드려요.</p>
      </section>

      <div css={sectionHeaderStyle}>
        <h3 css={sectionTitleStyle}>이전 문의</h3>
        <span css={countStyle}>전체 {totalElements}개</span>
      </div>

      {error ? (
        <p css={messageStyle}>문의 내역을 불러오지 못했습니다.</p>
      ) : isInitialLoad ? (
        <p css={messageStyle}>불러오는 중...</p>
      ) : isEmpty ? (
        <div css={emptyStyle}>
          <p>아직 접수한 문의가 없어요.</p>
        </div>
      ) : (
        <div css={listStyle}>
          {items.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} onViewAnswer={setSelected} />
          ))}
        </div>
      )}

      {hasNext && !isInitialLoad && (
        <div ref={sentinelRef} css={sentinelStyle}>
          {isLoadingMore && <span>불러오는 중...</span>}
        </div>
      )}

      {selected && (
        <ReceivedNotificationModal notification={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
});

ProfileInquiries.displayName = 'ProfileInquiries';
export default ProfileInquiries;
