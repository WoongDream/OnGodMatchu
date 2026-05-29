import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuestionCard from './QuestionCard';

describe('QuestionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("variant='item' — 기본 노출", () => {
    it('imageUrl 이 있으면 img 가 렌더된다', () => {
      const { container } = renderWithTheme(
        <QuestionCard variant="item" imageUrl="data:image/png;base64,abc" />,
      );
      // alt="" 인 img 는 role=presentation 이므로 DOM 쿼리로 직접 찾는다
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img).toHaveAttribute('src', 'data:image/png;base64,abc');
      expect(img).toHaveAttribute('alt', '');
    });

    it('imageUrl 없고 questionText 가 있으면 텍스트가 노출된다', () => {
      renderWithTheme(<QuestionCard variant="item" questionText="한국의 수도는?" />);
      expect(screen.getByText('한국의 수도는?')).toBeInTheDocument();
      expect(screen.queryByText('비어 있음')).not.toBeInTheDocument();
    });

    it('imageUrl 없고 questionText 가 공백만이면 "비어 있음" 이 노출된다', () => {
      renderWithTheme(<QuestionCard variant="item" questionText="   " />);
      expect(screen.getByText('비어 있음')).toBeInTheDocument();
    });

    it('imageUrl 없고 questionText 가 빈 문자열이면 "비어 있음" 이 노출된다', () => {
      renderWithTheme(<QuestionCard variant="item" questionText="" />);
      expect(screen.getByText('비어 있음')).toBeInTheDocument();
    });

    it('imageUrl 도 questionText 도 없으면 "비어 있음" 이 노출된다', () => {
      renderWithTheme(<QuestionCard variant="item" />);
      expect(screen.getByText('비어 있음')).toBeInTheDocument();
    });

    it('imageUrl 우선 — 이미지가 있으면 텍스트는 노출되지 않는다', () => {
      renderWithTheme(
        <QuestionCard
          variant="item"
          imageUrl="data:image/png;base64,abc"
          questionText="텍스트는 무시"
        />,
      );
      expect(screen.queryByText('텍스트는 무시')).not.toBeInTheDocument();
      expect(screen.queryByText('비어 있음')).not.toBeInTheDocument();
    });

    it('variant 미지정 시 기본 "item" 으로 동작한다', () => {
      renderWithTheme(<QuestionCard />);
      expect(screen.getByText('비어 있음')).toBeInTheDocument();
      // 'add' 라면 "문제 추가" 텍스트가 있어야 함
      expect(screen.queryByText('문제 추가')).not.toBeInTheDocument();
    });
  });

  describe("variant='item' — selected / invalid", () => {
    it('selected=true 면 aria-pressed="true" 이다', () => {
      renderWithTheme(<QuestionCard variant="item" selected={true} ariaLabel="문제 1 카드" />);
      const btn = screen.getByLabelText('문제 1 카드');
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    it('selected=false 면 aria-pressed="false" 이다', () => {
      renderWithTheme(<QuestionCard variant="item" selected={false} ariaLabel="문제 1 카드" />);
      const btn = screen.getByLabelText('문제 1 카드');
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    it('selected 미지정 시 기본값 false 로 동작한다', () => {
      renderWithTheme(<QuestionCard variant="item" ariaLabel="문제 1 카드" />);
      const btn = screen.getByLabelText('문제 1 카드');
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    it('invalid=true 이면 "입력 필요" 배지가 노출된다', () => {
      renderWithTheme(<QuestionCard variant="item" invalid={true} />);
      const badge = screen.getByLabelText('입력 필요');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('role', 'img');
      expect(badge).toHaveTextContent('!');
    });

    it('invalid=false 이면 "입력 필요" 배지가 노출되지 않는다', () => {
      renderWithTheme(<QuestionCard variant="item" invalid={false} />);
      expect(screen.queryByLabelText('입력 필요')).toBeNull();
    });

    it('invalid 미지정 시 기본값 false 로 동작한다', () => {
      renderWithTheme(<QuestionCard variant="item" />);
      expect(screen.queryByLabelText('입력 필요')).toBeNull();
    });
  });

  describe("variant='item' — 인터랙션", () => {
    it('클릭 시 onClick 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithTheme(<QuestionCard variant="item" onClick={onClick} ariaLabel="문제 1 카드" />);
      await user.click(screen.getByLabelText('문제 1 카드'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('ariaLabel 이 button 의 aria-label 로 전달된다', () => {
      renderWithTheme(<QuestionCard variant="item" ariaLabel="문제 7 카드" />);
      expect(screen.getByLabelText('문제 7 카드')).toBeInTheDocument();
    });

    it('button type 이 "button" 이다 (form submit 방지)', () => {
      renderWithTheme(<QuestionCard variant="item" ariaLabel="문제 1 카드" />);
      const btn = screen.getByLabelText('문제 1 카드');
      expect(btn).toHaveAttribute('type', 'button');
    });
  });

  describe("variant='add'", () => {
    it('"문제 추가" 텍스트가 노출된다', () => {
      renderWithTheme(<QuestionCard variant="add" />);
      expect(screen.getByText('문제 추가')).toBeInTheDocument();
    });

    it('기본 aria-label 이 "문제 추가" 이다', () => {
      renderWithTheme(<QuestionCard variant="add" />);
      expect(screen.getByLabelText('문제 추가')).toBeInTheDocument();
    });

    it('ariaLabel 이 주어지면 기본값을 덮어쓴다', () => {
      renderWithTheme(<QuestionCard variant="add" ariaLabel="새 문제 추가하기" />);
      expect(screen.getByLabelText('새 문제 추가하기')).toBeInTheDocument();
      // 기본 라벨로는 찾히지 않음 (텍스트는 여전히 존재하지만 button aria-label 은 override)
      const btn = screen.getByLabelText('새 문제 추가하기');
      expect(btn).toHaveAttribute('aria-label', '새 문제 추가하기');
    });

    it('클릭 시 onClick 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithTheme(<QuestionCard variant="add" onClick={onClick} />);
      await user.click(screen.getByLabelText('문제 추가'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('"입력 필요" 배지는 노출되지 않는다 (add variant 에서는 visual only)', () => {
      renderWithTheme(<QuestionCard variant="add" invalid={true} />);
      expect(screen.queryByLabelText('입력 필요')).toBeNull();
    });

    it('button type 이 "button" 이다', () => {
      renderWithTheme(<QuestionCard variant="add" />);
      const btn = screen.getByLabelText('문제 추가');
      expect(btn).toHaveAttribute('type', 'button');
    });

    it('aria-pressed 가 설정되지 않는다 (add variant)', () => {
      renderWithTheme(<QuestionCard variant="add" />);
      const btn = screen.getByLabelText('문제 추가');
      expect(btn).not.toHaveAttribute('aria-pressed');
    });
  });

  describe('memo / displayName', () => {
    it('displayName 이 "QuestionCard" 이다', () => {
      expect(QuestionCard.displayName).toBe('QuestionCard');
    });
  });
});
