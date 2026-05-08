import { memo } from 'react';
import QuizQuestion from '@/features/quiz/play/QuizQuestion';
import QuizFeedback from '@/features/quiz/play/QuizFeedback';
import type { AttemptResultItem, Question } from '@/types';
import {
  listStyle,
  itemStyle,
  headerStyle,
  badgeCorrectStyle,
  badgeWrongStyle,
  numberStyle,
  userAnswerStyle,
  userAnswerLabelStyle,
} from './ResultDetailList.style';

type ResultDetailListProps = {
  questions: Question[];
  results: AttemptResultItem[];
};

const ResultDetailList = memo(({ questions, results }: ResultDetailListProps) => {
  const byQuestionId = new Map(results.map((r) => [r.questionId, r]));

  return (
    <ol css={listStyle}>
      {questions.map((q, idx) => {
        const r = byQuestionId.get(q.id);
        if (!r) {
          return null;
        }
        return (
          <li key={q.id} css={itemStyle}>
            <div css={headerStyle}>
              <span css={numberStyle}>문제 {idx + 1}</span>
              <span css={r.correct ? badgeCorrectStyle : badgeWrongStyle}>
                {r.correct ? '정답' : '오답'}
              </span>
            </div>
            <QuizQuestion question={q} revealAnswer />
            <p css={userAnswerStyle}>
              <span css={userAnswerLabelStyle}>내 답: </span>
              {r.userAnswer || '(미입력)'}
            </p>
            <QuizFeedback
              correct={r.correct}
              answer={r.correctAnswer}
              answerImageUrl={r.correctAnswerImageUrl}
            />
          </li>
        );
      })}
    </ol>
  );
});

ResultDetailList.displayName = 'ResultDetailList';
export default ResultDetailList;
