import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { EMPTY_SLOT, type ImageSlot } from '@/lib/image/imageSlot';
import type { ImageEditResult } from '@/components/image-edit-modal';
import QuestionItem from './QuestionItem';

// ImageUpload 는 ImageEditModal(canvas) 체인을 끌고 오므로 더미로 모킹한다.
// - 빈 슬롯이면 "클릭하여 이미지 업로드" 플레이스홀더 노출
// - previewUrl 이 있으면 alt="업로드 이미지 미리보기" img 노출
// - onApply/onRemove 를 트리거하는 버튼 노출
const stubApplyResult: ImageEditResult = { transform: null, cropped: null, originalFile: null };

vi.mock('@/components/image-upload', () => ({
  default: ({
    slot,
    onApply,
    onRemove,
  }: {
    slot: ImageSlot;
    onApply: (result: ImageEditResult) => void;
    onRemove: () => void;
  }) => (
    <div data-testid="image-upload-stub">
      {slot.previewUrl ? (
        <img alt="업로드 이미지 미리보기" src={slot.previewUrl} />
      ) : (
        <span>클릭하여 이미지 업로드</span>
      )}
      <button type="button" onClick={() => onApply(stubApplyResult)}>
        apply-image
      </button>
      <button type="button" onClick={onRemove}>
        remove-image
      </button>
    </div>
  ),
}));

// Controlled-state wrapper for inputs
const QuestionItemWrapper = (
  props: Omit<React.ComponentProps<typeof QuestionItem>, 'questionText' | 'answer'> & {
    initialQuestion?: string;
    initialAnswer?: string;
    onQuestionChange?: (val: string) => void;
    onAnswerChange?: (val: string) => void;
  },
) => {
  const [question, setQuestion] = useState(props.initialQuestion ?? '');
  const [answer, setAnswer] = useState(props.initialAnswer ?? '');

  return (
    <QuestionItem
      {...props}
      questionText={question}
      answer={answer}
      onQuestionChange={(val) => {
        setQuestion(val);
        props.onQuestionChange?.(val);
      }}
      onAnswerChange={(val) => {
        setAnswer(val);
        props.onAnswerChange?.(val);
      }}
    />
  );
};

describe('QuestionItem', () => {
  const mockCallbacks = {
    onQuestionChange: vi.fn(),
    onAnswerChange: vi.fn(),
    onImageApply: vi.fn(),
    onImageRemove: vi.fn(),
    onAnswerImageApply: vi.fn(),
    onAnswerImageRemove: vi.fn(),
    onAnswerImageSameAsQuestionChange: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    onDelete: vi.fn(),
  };

  const defaultProps = {
    index: 0,
    questionText: '테스트 문제',
    answer: '테스트 답',
    imageSlot: EMPTY_SLOT,
    answerImageSlot: EMPTY_SLOT,
    answerImageSameAsQuestion: true,
    isFirst: false,
    isLast: false,
    ...mockCallbacks,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('헤더 — "문제 N" 텍스트', () => {
    it('index=0 일 때 "문제 1" 을 표시한다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} index={0} />);
      expect(screen.getByText('문제 1')).toBeInTheDocument();
    });

    it('index=5 일 때 "문제 6" 을 표시한다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} index={5} />);
      expect(screen.getByText('문제 6')).toBeInTheDocument();
    });

    it('index=99 일 때 "문제 100" 을 표시한다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} index={99} />);
      expect(screen.getByText('문제 100')).toBeInTheDocument();
    });
  });

  describe('위로 버튼', () => {
    it('onMoveUp 지정 시 버튼이 노출된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      expect(screen.getByLabelText('위로')).toBeInTheDocument();
    });

    it('onMoveUp 미지정 시 버튼이 렌더되지 않는다', () => {
      const { onMoveUp: _omit, ...rest } = defaultProps;
      void _omit;
      renderWithTheme(<QuestionItem {...rest} />);
      expect(screen.queryByLabelText('위로')).toBeNull();
    });

    it('isFirst=false 일 때 활성화된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={false} />);
      expect(screen.getByLabelText('위로')).not.toBeDisabled();
    });

    it('isFirst=true 일 때 비활성화된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={true} />);
      expect(screen.getByLabelText('위로')).toBeDisabled();
    });

    it('클릭 시 onMoveUp 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} onMoveUp={onMoveUp} />);
      await user.click(screen.getByLabelText('위로'));
      expect(onMoveUp).toHaveBeenCalledOnce();
    });

    it('disabled 인 경우 클릭해도 콜백이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={true} onMoveUp={onMoveUp} />);
      await user.click(screen.getByLabelText('위로'));
      expect(onMoveUp).not.toHaveBeenCalled();
    });

    it('disabled 인 경우 Enter 키도 콜백이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      const onMoveUp = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isFirst={true} onMoveUp={onMoveUp} />);
      const btn = screen.getByLabelText('위로');
      btn.focus();
      await user.keyboard('{Enter}');
      expect(onMoveUp).not.toHaveBeenCalled();
    });
  });

  describe('아래로 버튼', () => {
    it('onMoveDown 지정 시 버튼이 노출된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      expect(screen.getByLabelText('아래로')).toBeInTheDocument();
    });

    it('onMoveDown 미지정 시 버튼이 렌더되지 않는다', () => {
      const { onMoveDown: _omit, ...rest } = defaultProps;
      void _omit;
      renderWithTheme(<QuestionItem {...rest} />);
      expect(screen.queryByLabelText('아래로')).toBeNull();
    });

    it('isLast=false 일 때 활성화된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} isLast={false} />);
      expect(screen.getByLabelText('아래로')).not.toBeDisabled();
    });

    it('isLast=true 일 때 비활성화된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} isLast={true} />);
      expect(screen.getByLabelText('아래로')).toBeDisabled();
    });

    it('클릭 시 onMoveDown 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onMoveDown = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} onMoveDown={onMoveDown} />);
      await user.click(screen.getByLabelText('아래로'));
      expect(onMoveDown).toHaveBeenCalledOnce();
    });

    it('disabled 인 경우 클릭해도 콜백이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      const onMoveDown = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} isLast={true} onMoveDown={onMoveDown} />);
      await user.click(screen.getByLabelText('아래로'));
      expect(onMoveDown).not.toHaveBeenCalled();
    });

    it('isFirst 와는 독립적으로 동작한다', () => {
      const { rerender } = renderWithTheme(
        <QuestionItem {...defaultProps} isFirst={true} isLast={false} />,
      );
      expect(screen.getByLabelText('아래로')).not.toBeDisabled();

      rerender(<QuestionItem {...defaultProps} isFirst={true} isLast={true} />);
      expect(screen.getByLabelText('아래로')).toBeDisabled();
    });
  });

  describe('삭제 버튼', () => {
    it('항상 노출되며 "삭제" 텍스트를 표시한다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      const btn = screen.getByLabelText('삭제');
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('삭제');
    });

    it('이동 콜백 없이도 항상 노출된다', () => {
      const { onMoveUp: _u, onMoveDown: _d, ...rest } = defaultProps;
      void _u;
      void _d;
      renderWithTheme(<QuestionItem {...rest} />);
      expect(screen.getByLabelText('삭제')).toBeInTheDocument();
    });

    it('isFirst/isLast 와 무관하게 활성화되어 있다', () => {
      const { rerender } = renderWithTheme(
        <QuestionItem {...defaultProps} isFirst={true} isLast={true} />,
      );
      expect(screen.getByLabelText('삭제')).not.toBeDisabled();

      rerender(<QuestionItem {...defaultProps} isFirst={false} isLast={false} />);
      expect(screen.getByLabelText('삭제')).not.toBeDisabled();
    });

    it('클릭 시 onDelete 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} onDelete={onDelete} />);
      await user.click(screen.getByLabelText('삭제'));
      expect(onDelete).toHaveBeenCalledOnce();
    });
  });

  describe('문제 입력', () => {
    it('전달된 questionText 가 표시된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} questionText="한국의 수도는?" />);
      expect(screen.getByDisplayValue('한국의 수도는?')).toBeInTheDocument();
    });

    it('placeholder "문제를 입력하세요" 가 표시된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} questionText="" />);
      expect(screen.getByPlaceholderText('문제를 입력하세요')).toBeInTheDocument();
    });

    it('입력 변경 시 onQuestionChange 가 호출된다', async () => {
      const user = userEvent.setup();
      const onQuestionChange = vi.fn();
      renderWithTheme(
        <QuestionItemWrapper
          {...defaultProps}
          initialQuestion=""
          onQuestionChange={onQuestionChange}
        />,
      );
      const input = screen.getByPlaceholderText('문제를 입력하세요');
      await user.type(input, 'abc');
      expect(onQuestionChange).toHaveBeenLastCalledWith('abc');
    });
  });

  describe('정답 입력', () => {
    it('전달된 answer 가 표시된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} answer="서울" />);
      expect(screen.getByDisplayValue('서울')).toBeInTheDocument();
    });

    it('placeholder "정답을 입력하세요" 가 표시된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} answer="" />);
      expect(screen.getByPlaceholderText('정답을 입력하세요')).toBeInTheDocument();
    });

    it('입력 변경 시 onAnswerChange 가 호출된다', async () => {
      const user = userEvent.setup();
      const onAnswerChange = vi.fn();
      renderWithTheme(
        <QuestionItemWrapper {...defaultProps} initialAnswer="" onAnswerChange={onAnswerChange} />,
      );
      const input = screen.getByPlaceholderText('정답을 입력하세요');
      await user.type(input, '한글');
      expect(onAnswerChange).toHaveBeenLastCalledWith('한글');
    });
  });

  describe('문제 이미지 업로드', () => {
    it('문제 섹션 상단에 안내 문구 "이미지 또는 문제 텍스트를 입력해주세요" 가 표시된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      expect(screen.getByText('이미지 또는 문제 텍스트를 입력해주세요')).toBeInTheDocument();
    });

    it('imageSlot 이 빈 슬롯이면 미리보기 img 가 없다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} imageSlot={EMPTY_SLOT} />);
      expect(screen.queryByAltText('업로드 이미지 미리보기')).not.toBeInTheDocument();
    });

    it('imageSlot.previewUrl 이 있으면 미리보기 img 가 노출된다', () => {
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          imageSlot={{ ...EMPTY_SLOT, previewUrl: 'data:image/png;base64,test' }}
        />,
      );
      const previewImage = screen.getByAltText('업로드 이미지 미리보기');
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute('src', 'data:image/png;base64,test');
    });

    it('문제 이미지 적용 시 onImageApply 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onImageApply = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} onImageApply={onImageApply} />);
      // 체크 ON 이므로 ImageUpload(=apply-image 버튼)는 문제 영역 1개만 존재
      await user.click(screen.getByRole('button', { name: 'apply-image' }));
      expect(onImageApply).toHaveBeenCalledOnce();
    });

    it('문제 이미지 삭제 시 onImageRemove 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onImageRemove = vi.fn();
      renderWithTheme(<QuestionItem {...defaultProps} onImageRemove={onImageRemove} />);
      await user.click(screen.getByRole('button', { name: 'remove-image' }));
      expect(onImageRemove).toHaveBeenCalledOnce();
    });
  });

  describe('정답 이미지 동일 사용 체크박스', () => {
    it('answerImageSameAsQuestion=true 이면 체크되어 있다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} answerImageSameAsQuestion={true} />);
      const checkbox = screen.getByRole('checkbox', {
        name: /문제 이미지와 동일하게 사용/,
      });
      expect(checkbox).toBeChecked();
    });

    it('체크 ON: 정답 ImageUpload 미노출 + 안내 문구 노출', () => {
      renderWithTheme(<QuestionItem {...defaultProps} answerImageSameAsQuestion={true} />);
      // 문제 + 정답 두 영역이 모두 ImageUpload 를 가지므로 ON 일 때는 문제 영역의 1개만 남음
      expect(screen.getAllByText('클릭하여 이미지 업로드')).toHaveLength(1);
      expect(screen.getByText(/정답 이미지로 문제 이미지를 그대로 사용/)).toBeInTheDocument();
    });

    it('체크 OFF: 정답 ImageUpload 가 노출된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} answerImageSameAsQuestion={false} />);
      // 문제 + 정답 두 영역이 모두 ImageUpload 가 마운트됨
      expect(screen.getAllByText('클릭하여 이미지 업로드')).toHaveLength(2);
      expect(screen.queryByText(/정답 이미지로 문제 이미지를 그대로 사용/)).not.toBeInTheDocument();
    });

    it('체크 ON 상태에서 클릭하면 false 로 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          answerImageSameAsQuestion={true}
          onAnswerImageSameAsQuestionChange={onChange}
        />,
      );
      await user.click(screen.getByRole('checkbox', { name: /문제 이미지와 동일하게 사용/ }));
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('체크 OFF 상태에서 클릭하면 true 로 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          answerImageSameAsQuestion={false}
          onAnswerImageSameAsQuestionChange={onChange}
        />,
      );
      await user.click(screen.getByRole('checkbox', { name: /문제 이미지와 동일하게 사용/ }));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('OFF 상태에서 정답 이미지 미리보기가 표시된다', () => {
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          answerImageSameAsQuestion={false}
          answerImageSlot={{ ...EMPTY_SLOT, previewUrl: 'blob:answer-preview' }}
        />,
      );
      const previews = screen.getAllByAltText('업로드 이미지 미리보기');
      const sources = previews.map((img) => (img as HTMLImageElement).src);
      expect(sources).toContain('blob:answer-preview');
    });

    it('OFF 상태에서 정답 이미지 적용 시 onAnswerImageApply 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onAnswerImageApply = vi.fn();
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          answerImageSameAsQuestion={false}
          onAnswerImageApply={onAnswerImageApply}
        />,
      );
      // OFF → ImageUpload(apply-image 버튼) 2개 (문제 + 정답), 두 번째가 정답
      const applyButtons = screen.getAllByRole('button', { name: 'apply-image' });
      expect(applyButtons).toHaveLength(2);
      await user.click(applyButtons[1]);
      expect(onAnswerImageApply).toHaveBeenCalledOnce();
    });
  });

  describe('섹션 헤딩', () => {
    it('"정답" h3 헤딩이 존재한다 (문제 헤딩은 안내 문구로 대체됨)', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      const headings = screen.getAllByRole('heading', { level: 3 });
      const headingTexts = headings.map((h) => h.textContent);
      expect(headingTexts.some((t) => t?.includes('정답'))).toBe(true);
      // "문제" h3 는 더 이상 존재하지 않고, 같은 자리에 안내 문구가 노출됨
      expect(screen.getByText('이미지 또는 문제 텍스트를 입력해주세요')).toBeInTheDocument();
    });
  });

  describe('errors prop — 검증 에러 표시', () => {
    it('errors 가 없으면 "입력 필요" pill 이 노출되지 않는다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} />);
      expect(screen.queryByText('입력 필요')).not.toBeInTheDocument();
    });

    it('errors.questionImageOrText 가 있으면 "입력 필요" pill 이 노출된다', () => {
      renderWithTheme(
        <QuestionItem
          {...defaultProps}
          errors={{ questionImageOrText: '문제 이미지 또는 텍스트를 입력하세요' }}
        />,
      );
      expect(screen.getByText('입력 필요')).toBeInTheDocument();
    });

    it('errors.questionImageOrText 가 있으면 인라인 에러 메시지가 노출된다', () => {
      const message = '문제 이미지 또는 텍스트를 입력하세요';
      renderWithTheme(<QuestionItem {...defaultProps} errors={{ questionImageOrText: message }} />);
      // pill ("입력 필요") + 인라인 메시지가 동시 노출
      expect(screen.getByText('입력 필요')).toBeInTheDocument();
      // 인라인 메시지가 적어도 한 번 등장한다 (Input error + fieldError span 가능성)
      const matches = screen.getAllByText(message);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('errors.answer 만 있을 때도 "입력 필요" pill 이 노출된다', () => {
      renderWithTheme(<QuestionItem {...defaultProps} errors={{ answer: '정답을 입력하세요' }} />);
      expect(screen.getByText('입력 필요')).toBeInTheDocument();
    });

    it('errors.answer 가 있으면 정답 에러 메시지가 노출된다', () => {
      const message = '정답을 입력하세요';
      renderWithTheme(<QuestionItem {...defaultProps} errors={{ answer: message }} />);
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('errors 두 필드 모두 있을 때 두 메시지 모두 노출된다', () => {
      const q = '문제 입력 필요';
      const a = '정답 입력 필요';
      renderWithTheme(
        <QuestionItem {...defaultProps} errors={{ questionImageOrText: q, answer: a }} />,
      );
      expect(screen.getAllByText(q).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(a)).toBeInTheDocument();
      expect(screen.getByText('입력 필요')).toBeInTheDocument();
    });
  });

  describe('통합 — 여러 콜백 시퀀스', () => {
    it('문제 입력 → 정답 입력 → 위로 → 삭제 순서로 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const callbacks = {
        onQuestionChange: vi.fn(),
        onAnswerChange: vi.fn(),
        onMoveUp: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithTheme(
        <QuestionItemWrapper
          {...defaultProps}
          initialQuestion=""
          initialAnswer=""
          isFirst={false}
          {...callbacks}
        />,
      );

      await user.type(screen.getByPlaceholderText('문제를 입력하세요'), 'q');
      expect(callbacks.onQuestionChange).toHaveBeenCalled();

      await user.type(screen.getByPlaceholderText('정답을 입력하세요'), 'a');
      expect(callbacks.onAnswerChange).toHaveBeenCalled();

      await user.click(screen.getByLabelText('위로'));
      expect(callbacks.onMoveUp).toHaveBeenCalledOnce();

      await user.click(screen.getByLabelText('삭제'));
      expect(callbacks.onDelete).toHaveBeenCalledOnce();
    });
  });
});
