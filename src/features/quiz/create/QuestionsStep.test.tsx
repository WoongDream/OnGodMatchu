import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuestionsStep from './QuestionsStep';
import { validateQuestion, validateAllQuestions } from './questionValidation';
import { createEmptyQuestion, type DraftQuestion } from './questionTypes';

const makeQ = (overrides?: Partial<DraftQuestion>): DraftQuestion => ({
  ...createEmptyQuestion(),
  ...overrides,
});

type StepProps = React.ComponentProps<typeof QuestionsStep>;

const renderStep = (overrides?: Partial<StepProps>) => {
  const defaults = {
    questions: [],
    onChange: vi.fn(),
    selectedId: null,
    onSelect: vi.fn(),
    errors: {},
    onClearError: vi.fn(),
    onRequestAdd: vi.fn(),
  } satisfies StepProps;
  const props: StepProps = { ...defaults, ...overrides };
  const utils = renderWithTheme(<QuestionsStep {...props} />);
  return { ...utils, props };
};

describe('QuestionsStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('레이아웃 & 헤더', () => {
    it('빈 questions=[] 일 때 안내 메시지만 노출되고 카드 그리드는 add 카드만 렌더', () => {
      renderStep({ questions: [], selectedId: null });

      expect(screen.getByRole('heading', { name: '문제 목록', level: 2 })).toBeInTheDocument();
      expect(screen.getByText('총 0 개')).toBeInTheDocument();
      expect(screen.getByText(/왼쪽에서 문제 카드를 선택하거나/)).toBeInTheDocument();
      // add 카드 1개만
      expect(screen.getByRole('button', { name: '문제 추가' })).toBeInTheDocument();
      // item variant card 는 없음 — '문제 1 카드' 같은 라벨 없음
      expect(screen.queryByRole('button', { name: /^문제 \d+ 카드$/ })).not.toBeInTheDocument();
    });

    it('N개 question + add 카드 그리드를 렌더하고 caption 에 "총 N 개" 표시', () => {
      const qs = [makeQ({ id: 'a' }), makeQ({ id: 'b' }), makeQ({ id: 'c' })];
      renderStep({ questions: qs });

      expect(screen.getByText('총 3 개')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문제 1 카드' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문제 2 카드' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문제 3 카드' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문제 추가' })).toBeInTheDocument();
    });
  });

  describe('카드 선택 / 추가', () => {
    it('카드 클릭 시 onSelect 가 해당 id 로 호출된다', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const qs = [makeQ({ id: 'x1' }), makeQ({ id: 'x2' })];
      renderStep({ questions: qs, onSelect });

      await user.click(screen.getByRole('button', { name: '문제 2 카드' }));
      expect(onSelect).toHaveBeenCalledWith('x2');
    });

    it('"+ 문제 추가" 카드 클릭 시 onRequestAdd 1회 호출', async () => {
      const user = userEvent.setup();
      const onRequestAdd = vi.fn();
      renderStep({ onRequestAdd });

      await user.click(screen.getByRole('button', { name: '문제 추가' }));
      expect(onRequestAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('우측 패널 (selected)', () => {
    it('selectedId 가 questions 에 있으면 QuestionItem 을 렌더 (placeholder 노출)', () => {
      const qs = [makeQ({ id: 'abc', questionText: '내용' })];
      renderStep({ questions: qs, selectedId: 'abc' });

      expect(screen.getByPlaceholderText('문제를 입력하세요')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('정답을 입력하세요')).toBeInTheDocument();
      // 안내 문구는 사라져야 함
      expect(screen.queryByText(/왼쪽에서 문제 카드를 선택하거나/)).not.toBeInTheDocument();
    });

    it('selectedId 가 questions 에 없으면 안내 메시지 노출', () => {
      const qs = [makeQ({ id: 'abc' })];
      renderStep({ questions: qs, selectedId: 'nope' });

      expect(screen.getByText(/왼쪽에서 문제 카드를 선택하거나/)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('문제를 입력하세요')).not.toBeInTheDocument();
    });
  });

  describe('errors / invalid 배지', () => {
    it('errors[id] 가 있는 question 카드는 "!" 배지를 노출 (aria-label="입력 필요")', () => {
      const qs = [makeQ({ id: 'q1' }), makeQ({ id: 'q2' })];
      renderStep({
        questions: qs,
        errors: { q1: { questionImageOrText: '필요' } },
      });

      // alertBadge 의 aria-label
      const badges = screen.getAllByLabelText('입력 필요');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('QuestionItem 입력 → onChange + onClearError', () => {
    it('문제 input typing → onChange 호출 + onClearError(id, "questionImageOrText")', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onClearError = vi.fn();
      const qs = [makeQ({ id: 'sel' })];
      renderStep({
        questions: qs,
        selectedId: 'sel',
        onChange,
        onClearError,
      });

      const questionInput = screen.getByPlaceholderText('문제를 입력하세요');
      await user.type(questionInput, '안');

      // onChange 호출됨 — 가장 마지막 호출은 questionText 갱신본
      expect(onChange).toHaveBeenCalled();
      const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(last[0].id).toBe('sel');
      expect(last[0].questionText).toBe('안');

      // 입력 시 onClearError 호출 (key='questionImageOrText')
      expect(onClearError).toHaveBeenCalledWith('sel', 'questionImageOrText');
    });

    it('정답 input typing → onChange 호출 + onClearError(id, "answer")', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onClearError = vi.fn();
      const qs = [makeQ({ id: 'sel' })];
      renderStep({
        questions: qs,
        selectedId: 'sel',
        onChange,
        onClearError,
      });

      const answerInput = screen.getByPlaceholderText('정답을 입력하세요');
      await user.type(answerInput, '답');

      expect(onChange).toHaveBeenCalled();
      const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(last[0].answer).toBe('답');

      expect(onClearError).toHaveBeenCalledWith('sel', 'answer');
    });
  });

  describe('삭제 동작', () => {
    it('삭제 버튼 → onChange (필터된 배열) + 선택된 id 였으면 인접 카드 선택', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onSelect = vi.fn();
      const qs = [makeQ({ id: 'a' }), makeQ({ id: 'b' }), makeQ({ id: 'c' })];
      renderStep({
        questions: qs,
        selectedId: 'b',
        onChange,
        onSelect,
      });

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      const next: DraftQuestion[] = onChange.mock.calls[0][0];
      expect(next.map((q) => q.id)).toEqual(['a', 'c']);

      // 원래 idx=1 → Math.min(1, next.length-1=1) = 1 → next[1]='c'
      expect(onSelect).toHaveBeenCalledWith('c');
    });

    it('마지막 카드를 선택한 상태에서 삭제 시 Math.min 으로 직전 카드 선택', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onSelect = vi.fn();
      const qs = [makeQ({ id: 'a' }), makeQ({ id: 'b' })];
      renderStep({
        questions: qs,
        selectedId: 'b',
        onChange,
        onSelect,
      });

      await user.click(screen.getByRole('button', { name: '삭제' }));

      const next: DraftQuestion[] = onChange.mock.calls[0][0];
      expect(next.map((q) => q.id)).toEqual(['a']);

      // 원래 idx=1, next.length-1=0 → Math.min(1, 0)=0 → next[0]='a'
      expect(onSelect).toHaveBeenCalledWith('a');
    });

    it('유일한 카드(=마지막) 삭제 시 onSelect 미호출 (empty 분기)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onSelect = vi.fn();
      const qs = [makeQ({ id: 'only' })];
      renderStep({
        questions: qs,
        selectedId: 'only',
        onChange,
        onSelect,
      });

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual([]);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });
});

describe('validateQuestion', () => {
  it('이미지 X + 텍스트 X + 정답 X → questionImageOrText, answer 모두 에러', () => {
    const q = makeQ();
    expect(validateQuestion(q)).toEqual({
      questionImageOrText: '이미지 또는 문제 텍스트를 입력해주세요',
      answer: '정답을 입력해주세요',
    });
  });

  it('이미지 O + 텍스트 X + 정답 O → 에러 없음', () => {
    const file = new File(['a'], 'a.png', { type: 'image/png' });
    const q = makeQ({
      imageFile: file,
      imagePreviewUrl: 'blob:img',
      answer: '정답',
    });
    expect(validateQuestion(q)).toEqual({});
  });

  it('이미지 X + 텍스트 O + 정답 O → 에러 없음', () => {
    const q = makeQ({ questionText: '문제', answer: '정답' });
    expect(validateQuestion(q)).toEqual({});
  });

  it('이미지 O + 정답 X → answer 에러만', () => {
    const file = new File(['a'], 'a.png', { type: 'image/png' });
    const q = makeQ({ imageFile: file, imagePreviewUrl: 'blob:img', answer: '' });
    expect(validateQuestion(q)).toEqual({
      answer: '정답을 입력해주세요',
    });
  });

  it('imageKey 만 있고 imageFile/imagePreviewUrl 없음 + 정답 O → 에러 없음 (서버 이미지)', () => {
    const q = makeQ({
      imageKey: 'remote/abc.png',
      imageFile: null,
      imagePreviewUrl: null,
      answer: '정답',
    });
    expect(validateQuestion(q)).toEqual({});
  });

  it('정답이 공백만 → answer 에러', () => {
    const q = makeQ({ questionText: '문제', answer: '   ' });
    expect(validateQuestion(q)).toEqual({
      answer: '정답을 입력해주세요',
    });
  });
});

describe('validateAllQuestions', () => {
  it('각 question 별 errors 매핑, errors 없는 question 은 결과에서 제외', () => {
    const qs = [
      makeQ({ id: 'bad' }), // 둘 다 없음
      makeQ({ id: 'good', questionText: '문제', answer: '정답' }), // OK
      makeQ({ id: 'half', questionText: '문제', answer: '' }), // answer 만 에러
    ];
    const result = validateAllQuestions(qs);
    expect(Object.keys(result).sort()).toEqual(['bad', 'half']);
    expect(result.bad).toEqual({
      questionImageOrText: '이미지 또는 문제 텍스트를 입력해주세요',
      answer: '정답을 입력해주세요',
    });
    expect(result.half).toEqual({ answer: '정답을 입력해주세요' });
  });

  it('전부 valid 면 빈 객체 반환', () => {
    const qs = [
      makeQ({ id: 'a', questionText: '문제', answer: '정답' }),
      makeQ({ id: 'b', questionText: '문제', answer: '정답' }),
    ];
    expect(validateAllQuestions(qs)).toEqual({});
  });

  it('빈 배열 → 빈 객체', () => {
    expect(validateAllQuestions([])).toEqual({});
  });
});
