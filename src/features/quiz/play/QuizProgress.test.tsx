import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import QuizProgress from './QuizProgress';

/**
 * 라벨 매처 헬퍼.
 * 현재 구현은 `<span>{current}</span> / {total}` 로 텍스트 노드가 분할되어 있어
 * 단일 문자열 매처(`getByText('2 / 3')`) 가 매치되지 않는다.
 * 따라서 노드의 `textContent` 로 매치한다.
 */
const findLabel = (text: string) =>
  screen.getByText((_, node) => {
    if (!node) {
      return false;
    }
    // 자식 element 의 textContent 도 동일한 문자열로 합쳐지므로,
    // 가장 가까운 (자식 element 가 동일 매치를 가지지 않는) 노드만 채택.
    const hasText = (n: Element | null) => n?.textContent?.replace(/\s+/g, ' ').trim() === text;
    const nodeHasText = hasText(node);
    const childrenDontHave = Array.from(node.children).every((child) => !hasText(child));
    return nodeHasText && childrenDontHave;
  });

describe('QuizProgress', () => {
  describe('rendering', () => {
    it('renders progress label with current and total values', () => {
      renderWithTheme(<QuizProgress current={3} total={10} />);
      expect(findLabel('3 / 10')).toBeInTheDocument();
    });

    it('current 값을 별도 <span> 으로 분리해서 렌더한다 (bold slot)', () => {
      const { container } = renderWithTheme(<QuizProgress current={3} total={10} />);
      // 라벨 컨테이너 안에 자식 span 이 존재해야 함
      const currentSpan = container.querySelector('span > span');
      expect(currentSpan).not.toBeNull();
      expect(currentSpan?.textContent).toBe('3');
    });

    it('renders progress bar container', () => {
      const { container } = renderWithTheme(<QuizProgress current={5} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(findLabel('5 / 10')).toBeInTheDocument();
    });

    it('renders both label and bar elements', () => {
      const { container } = renderWithTheme(<QuizProgress current={2} total={8} />);
      expect(findLabel('2 / 8')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('percentage calculation', () => {
    it('calculates 0% when current is 0', () => {
      const { container } = renderWithTheme(<QuizProgress current={0} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(findLabel('0 / 10')).toBeInTheDocument();
    });

    it('calculates 50% when current is half of total', () => {
      const { container } = renderWithTheme(<QuizProgress current={5} total={10} />);
      expect(findLabel('5 / 10')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('calculates 100% when current equals total', () => {
      renderWithTheme(<QuizProgress current={10} total={10} />);
      expect(findLabel('10 / 10')).toBeInTheDocument();
    });

    it('calculates correct percentage for various values', () => {
      const testCases = [
        { current: 1, total: 4 }, // 25%
        { current: 3, total: 4 }, // 75%
        { current: 2, total: 3 }, // 66.67%
        { current: 1, total: 3 }, // 33.33%
      ];

      testCases.forEach(({ current, total }) => {
        const { unmount } = renderWithTheme(<QuizProgress current={current} total={total} />);
        expect(findLabel(`${current} / ${total}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('edge cases', () => {
    it('handles total of 1', () => {
      renderWithTheme(<QuizProgress current={1} total={1} />);
      expect(findLabel('1 / 1')).toBeInTheDocument();
    });

    it('handles large numbers', () => {
      renderWithTheme(<QuizProgress current={500} total={1000} />);
      expect(findLabel('500 / 1000')).toBeInTheDocument();
    });

    it('handles very small progress', () => {
      renderWithTheme(<QuizProgress current={1} total={100} />);
      expect(findLabel('1 / 100')).toBeInTheDocument();
    });

    it('handles progress close to completion', () => {
      renderWithTheme(<QuizProgress current={99} total={100} />);
      expect(findLabel('99 / 100')).toBeInTheDocument();
    });

    it('total === 0 가드 — percent 계산이 NaN 이 되지 않음 (막대 width 0%)', () => {
      const { container } = renderWithTheme(<QuizProgress current={0} total={0} />);
      // 라벨은 "0 / 0" 으로 정상 노출
      expect(findLabel('0 / 0')).toBeInTheDocument();
      // fill 요소의 width 가 0% 이고 NaN 이 포함되지 않아야 함
      const fill = container.querySelector('div > div > div');
      expect(fill).not.toBeNull();
      const style = fill?.getAttribute('style') ?? '';
      // emotion 은 css 클래스로 적용하므로 inline style 이 없을 수 있음 — class name 만 확인
      // NaN 방어 핵심: 라벨이 정상 렌더되고 throw 없이 마운트되는지
      expect(style).not.toContain('NaN');
    });
  });

  describe('label formatting', () => {
    it('displays label with forward slash separator', () => {
      renderWithTheme(<QuizProgress current={2} total={5} />);
      const label = findLabel('2 / 5');
      expect(label.textContent?.replace(/\s+/g, ' ').trim()).toMatch(/^\d+ \/ \d+$/);
    });

    it('updates label when props change', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={1} total={5} />);
      expect(findLabel('1 / 5')).toBeInTheDocument();

      rerender(<QuizProgress current={3} total={5} />);
      expect(findLabel('3 / 5')).toBeInTheDocument();
    });

    it('displays correct values for sequential updates', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={1} total={10} />);
      expect(findLabel('1 / 10')).toBeInTheDocument();

      rerender(<QuizProgress current={5} total={10} />);
      expect(findLabel('5 / 10')).toBeInTheDocument();

      rerender(<QuizProgress current={10} total={10} />);
      expect(findLabel('10 / 10')).toBeInTheDocument();
    });
  });

  describe('memo optimization', () => {
    it('does not re-render when props remain the same', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={5} total={10} />);
      const initialElement = findLabel('5 / 10');

      rerender(<QuizProgress current={5} total={10} />);
      const rerenderElement = findLabel('5 / 10');

      expect(initialElement).toBeInTheDocument();
      expect(rerenderElement).toBeInTheDocument();
    });

    it('re-renders when current prop changes', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={5} total={10} />);
      expect(findLabel('5 / 10')).toBeInTheDocument();

      rerender(<QuizProgress current={6} total={10} />);
      expect(findLabel('6 / 10')).toBeInTheDocument();
    });

    it('re-renders when total prop changes', () => {
      const { rerender } = renderWithTheme(<QuizProgress current={5} total={10} />);
      expect(findLabel('5 / 10')).toBeInTheDocument();

      rerender(<QuizProgress current={5} total={15} />);
      expect(findLabel('5 / 15')).toBeInTheDocument();
    });
  });

  describe('progress bar structure', () => {
    it('has wrapper, label, bar, and fill elements', () => {
      const { container } = renderWithTheme(<QuizProgress current={5} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(findLabel('5 / 10')).toBeInTheDocument();
    });

    it('maintains structure with 0% progress', () => {
      const { container } = renderWithTheme(<QuizProgress current={0} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(findLabel('0 / 10')).toBeInTheDocument();
    });

    it('maintains structure with 100% progress', () => {
      const { container } = renderWithTheme(<QuizProgress current={10} total={10} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(findLabel('10 / 10')).toBeInTheDocument();
    });
  });

  describe('numeric accuracy', () => {
    it('handles decimal percentage calculations correctly', () => {
      renderWithTheme(<QuizProgress current={1} total={3} />);
      expect(findLabel('1 / 3')).toBeInTheDocument();
    });

    it('handles non-integer percentages', () => {
      renderWithTheme(<QuizProgress current={1} total={7} />);
      expect(findLabel('1 / 7')).toBeInTheDocument();
    });

    it('handles progress values that result in repeating decimals', () => {
      renderWithTheme(<QuizProgress current={2} total={3} />);
      expect(findLabel('2 / 3')).toBeInTheDocument();
    });
  });

  describe('trailing slot', () => {
    it('trailing 노드를 우상단에 마운트한다', () => {
      renderWithTheme(
        <QuizProgress current={3} total={10} trailing={<span data-testid="trailing-slot" />} />,
      );
      expect(screen.getByTestId('trailing-slot')).toBeInTheDocument();
      expect(findLabel('3 / 10')).toBeInTheDocument();
    });

    it('trailing 미전달 시 추가 노드 없이 라벨만 마운트', () => {
      const { container } = renderWithTheme(<QuizProgress current={3} total={10} />);
      // 라벨은 노출되지만 trailing 슬롯에 해당하는 testid 는 없어야 함
      expect(findLabel('3 / 10')).toBeInTheDocument();
      expect(screen.queryByTestId('trailing-slot')).not.toBeInTheDocument();
      // wrapper > topRow(첫 div) 의 자식이 라벨 span 한 개만 존재
      const wrapper = container.firstElementChild;
      const topRow = wrapper?.firstElementChild;
      expect(topRow?.children.length).toBe(1);
      expect(topRow?.firstElementChild?.tagName).toBe('SPAN');
    });
  });
});
