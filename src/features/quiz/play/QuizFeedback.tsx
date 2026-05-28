import { memo } from 'react';
import { ArrowRightIcon } from '@/components/icon';
import {
  boxStyle,
  detailLabelStyle,
  detailRowStyle,
  detailValueStyle,
  myAnswerValueStyle,
  nextButtonStyle,
  resultIconStyle,
  resultRowStyle,
  rowStyle,
} from './QuizFeedback.style';

type QuizFeedbackProps = {
  correct: boolean;
  /** 정답 텍스트 */
  answer: string;
  /** 사용자가 입력한 답 (오답일 때만 노출, 시간 초과 빈 답이면 "(미입력)") */
  userAnswer: string;
  /** 다음 버튼 동작 — 다음 문제 또는 결과 페이지 */
  onNext: () => void;
  /** 접근성 라벨 — 마지막 문항이면 "결과 보기", 아니면 "다음 문제" */
  nextAriaLabel: string;
  nextDisabled?: boolean;
};

const QuizFeedback = memo(
  ({
    correct,
    answer,
    userAnswer,
    onNext,
    nextAriaLabel,
    nextDisabled = false,
  }: QuizFeedbackProps) => {
    return (
      <div css={rowStyle}>
        <div css={boxStyle(correct)}>
          <div css={resultRowStyle}>
            <span css={resultIconStyle(correct)} aria-hidden>
              {correct ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6.5l2.5 2.5 4.5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 3l6 6M9 3l-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            <span>{correct ? '정답입니다' : '오답입니다'}</span>
          </div>
          <div css={detailRowStyle}>
            <span css={detailLabelStyle}>정답</span>
            <span css={detailValueStyle}>{answer}</span>
          </div>
          {!correct && (
            <div css={detailRowStyle}>
              <span css={detailLabelStyle}>내 답변</span>
              <span css={myAnswerValueStyle}>
                {userAnswer.trim() === '' ? '(미입력)' : userAnswer}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          css={nextButtonStyle}
          onClick={onNext}
          disabled={nextDisabled}
          aria-label={nextAriaLabel}
        >
          <ArrowRightIcon size={24} aria-hidden />
        </button>
      </div>
    );
  },
);

QuizFeedback.displayName = 'QuizFeedback';
export default QuizFeedback;
