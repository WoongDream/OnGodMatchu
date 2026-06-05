import { memo } from 'react';
import InquiryStatusBadge from '@/components/inquiry-status-badge/InquiryStatusBadge';
import type { InquiryListItem, UserNotification } from '@/types';
import {
  answerDateStyle,
  answerItemStyle,
  answerListStyle,
  answerSectionLabelStyle,
  answerTitleStyle,
  cardStyle,
  contentStyle,
  dateStyle,
  headerRowStyle,
  titleStyle,
} from './InquiryCard.style';

export type InquiryCardProps = {
  inquiry: InquiryListItem;
  onViewAnswer: (notification: UserNotification) => void;
};

/**
 * 본인 문의 한 건 카드 — 상태 배지·접수일 + 제목/내용 + (있을 때) 받은 답변 목록.
 * 답변이 여러 건일 수 있어 제목을 행으로 나열하고, 각 행을 누르면 해당 답변 모달을 띄운다.
 */
const InquiryCard = memo(({ inquiry, onViewAnswer }: InquiryCardProps) => {
  const { answers } = inquiry;
  const hasAnswer = answers.length > 0;

  return (
    <article css={cardStyle}>
      <div css={headerRowStyle}>
        <InquiryStatusBadge status={inquiry.status} />
        <span css={dateStyle}>{inquiry.createdAt.slice(0, 10)}</span>
      </div>
      <h3 css={titleStyle}>{inquiry.title}</h3>
      <p css={contentStyle}>{inquiry.content}</p>
      {hasAnswer && (
        <div css={answerListStyle}>
          <span css={answerSectionLabelStyle}>받은 답변 {answers.length}개</span>
          {answers.map((answer) => (
            <button
              key={answer.id}
              type="button"
              css={answerItemStyle}
              onClick={() => onViewAnswer(answer)}
            >
              <span css={answerTitleStyle}>{answer.title}</span>
              <span css={answerDateStyle}>{answer.createdAt.slice(0, 10)}</span>
            </button>
          ))}
        </div>
      )}
    </article>
  );
});

InquiryCard.displayName = 'InquiryCard';
export default InquiryCard;
