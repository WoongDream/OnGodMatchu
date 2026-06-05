import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useBoInquiry from '@/hooks/useBoInquiry';
import { useToast } from '@/components/toast';
import Button from '@/components/button/Button';
import ProfileImage from '@/components/profile-image/ProfileImage';
import ProfileModal from '@/components/profile-modal/ProfileModal';
import InquiryStatusBadge from '@/components/inquiry-status-badge/InquiryStatusBadge';
import NotificationComposeModal from '@/features/admin/users/NotificationComposeModal';
import { answerInquiry, changeInquiryStatus } from '@/api/inquiry';
import type { InquiryStatus } from '@/types';
import * as s from './BoInquiryDetailPage.style';

const STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: 'PENDING', label: '대기' },
  { value: 'IN_PROGRESS', label: '처리중' },
  { value: 'DONE', label: '완료' },
];

const BoInquiryDetailPage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const inquiryId = Number(id);
  const toast = useToast();

  const { inquiry, isLoading, error, refresh } = useBoInquiry(
    Number.isFinite(inquiryId) ? inquiryId : null,
  );

  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>('PENDING');
  const [modalPublicId, setModalPublicId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSendingAnswer, setIsSendingAnswer] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setSelectedStatus(inquiry.status);
    }
  }, [inquiry]);

  if (isLoading || error || !inquiry) {
    return <p css={s.loadingStyle}>{isLoading ? '불러오는 중...' : '문의를 찾을 수 없어요.'}</p>;
  }

  const { author } = inquiry;
  const authorClickable = author.publicId != null;
  const statusDirty = selectedStatus !== inquiry.status;

  const handleAuthorClick = () => {
    if (author.publicId != null) {
      setModalPublicId(author.publicId);
    }
  };

  const handleSaveStatus = async () => {
    if (!statusDirty) {
      return;
    }
    setIsSavingStatus(true);
    try {
      await changeInquiryStatus(inquiry.id, selectedStatus);
      refresh();
      toast.success('처리 상태가 저장되었어요.');
    } catch {
      toast.error('처리 상태 저장에 실패했어요.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSendAnswer = (draft: Parameters<typeof answerInquiry>[1]) => {
    setIsSendingAnswer(true);
    answerInquiry(inquiry.id, draft)
      .then(() => {
        refresh();
        toast.success('답변을 보냈어요.');
        setComposeOpen(false);
      })
      .catch(() => {
        toast.error('답변 전송에 실패했어요. (탈퇴한 사용자일 수 있어요)');
      })
      .finally(() => {
        setIsSendingAnswer(false);
      });
  };

  return (
    <div css={s.pageStyle}>
      <h1 css={s.titleStyle}>문의 상세</h1>
      <p css={s.subtitleStyle}>문의 내용을 확인하고 답변을 작성해요.</p>

      <div css={s.gridStyle}>
        {/* 좌측 문의 카드 */}
        <section css={s.cardStyle}>
          <h2 css={s.inquiryTitleStyle}>{inquiry.title}</h2>

          <button
            type="button"
            css={(theme) => s.authorRowStyle(theme, authorClickable)}
            onClick={handleAuthorClick}
            disabled={!authorClickable}
          >
            <ProfileImage nickname={author.nickname} imageUrl={author.profileImageUrl} size="sm" />
            <span css={s.authorInfoStyle}>
              <span css={s.authorNameStyle}>{author.nickname}</span>
              <span css={s.authorDateStyle}>접수일 {inquiry.createdAt.slice(0, 10)}</span>
            </span>
          </button>

          <p css={s.contentBoxStyle}>{inquiry.content}</p>

          {inquiry.answers.length > 0 ? (
            <div css={s.answersSectionStyle}>
              <h3 css={s.answersTitleStyle}>보낸 답변 {inquiry.answers.length}건</h3>
              {inquiry.answers.map((answer) => (
                <div key={answer.id} css={(theme) => s.answerItemStyle(theme, answer.type)}>
                  <p css={s.answerHeadStyle}>
                    <span>
                      {answer.typeLabel} · {answer.senderLabel}
                    </span>
                    <span>{answer.createdAt.slice(0, 10)}</span>
                  </p>
                  <p css={s.answerTitleStyle}>{answer.title}</p>
                  <p css={s.answerContentStyle}>{answer.content}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* 우측 처리 상태 패널 */}
        <aside css={s.cardStyle}>
          <p css={s.panelTitleStyle}>처리 상태</p>
          <InquiryStatusBadge status={inquiry.status} />
          <div css={s.statusColumnStyle}>
            {STATUSES.map((st) => (
              <button
                key={st.value}
                type="button"
                css={(theme) => s.statusButtonStyle(theme, selectedStatus === st.value)}
                onClick={() => setSelectedStatus(st.value)}
                disabled={isSavingStatus}
              >
                {st.label}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* 하단 저장 바 */}
      <div css={s.saveBarStyle}>
        <span css={s.saveHintStyle}>
          저장하면 처리 상태가 반영되고, 알림 보내기로 답변을 전달할 수 있어요.
        </span>
        <div css={s.saveActionsStyle}>
          <Button variant="secondary" onClick={() => setComposeOpen(true)}>
            알림 보내기
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveStatus}
            disabled={!statusDirty || isSavingStatus}
          >
            저장
          </Button>
        </div>
      </div>

      {composeOpen ? (
        <NotificationComposeModal
          isOpen
          onClose={() => setComposeOpen(false)}
          recipient={{ nickname: author.nickname, email: '' }}
          changeSummary={null}
          isSubmitting={isSendingAnswer}
          onSend={handleSendAnswer}
        />
      ) : null}

      {modalPublicId != null ? (
        <ProfileModal publicId={modalPublicId} onClose={() => setModalPublicId(null)} />
      ) : null}
    </div>
  );
});

BoInquiryDetailPage.displayName = 'BoInquiryDetailPage';
export default BoInquiryDetailPage;
