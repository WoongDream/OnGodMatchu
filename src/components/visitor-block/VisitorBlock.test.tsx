import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { formatCount } from '@/lib/format/count';
import VisitorBlock from './VisitorBlock';

describe('VisitorBlock', () => {
  describe('카운트 렌더링', () => {
    it('today=63 을 그대로 텍스트로 노출한다', () => {
      renderWithTheme(<VisitorBlock today={63} total={1000} daily={[]} />);
      expect(screen.getByText('63')).toBeInTheDocument();
    });

    it('TODAY 라벨이 존재한다', () => {
      renderWithTheme(<VisitorBlock today={1} total={2} daily={[]} />);
      expect(screen.getByText('TODAY')).toBeInTheDocument();
    });

    it('total=7600000 을 formatCount 결과로 노출한다', () => {
      const total = 7_600_000;
      renderWithTheme(<VisitorBlock today={0} total={total} daily={[]} />);
      expect(screen.getByText(formatCount(total))).toBeInTheDocument();
    });

    it('TOTAL 라벨이 존재한다', () => {
      renderWithTheme(<VisitorBlock today={1} total={2} daily={[]} />);
      expect(screen.getByText('TOTAL')).toBeInTheDocument();
    });

    it('today=0 / total=0 일 때도 "0" 텍스트가 두 군데 노출된다', () => {
      renderWithTheme(<VisitorBlock today={0} total={0} daily={[]} />);
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('sparkline 마운트 분기', () => {
    it('daily 가 비어있지 않으면 <svg> + <polyline points> 가 렌더된다', () => {
      const { container } = renderWithTheme(
        <VisitorBlock today={10} total={100} daily={[1, 2, 3, 4, 5, 6, 7]} />,
      );

      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();

      const polyline = container.querySelector('polyline');
      expect(polyline).not.toBeNull();
      expect(polyline?.getAttribute('points')).toBeTruthy();
      expect(polyline?.getAttribute('points')?.length).toBeGreaterThan(0);
    });

    it('daily 가 빈 배열이면 <svg> 자체가 미마운트된다', () => {
      const { container } = renderWithTheme(<VisitorBlock today={10} total={100} daily={[]} />);

      expect(container.querySelector('svg')).toBeNull();
      expect(container.querySelector('polyline')).toBeNull();
    });
  });

  describe('접근성', () => {
    it('wrapper 가 aria-label="방문자 통계" 를 갖는다', () => {
      renderWithTheme(<VisitorBlock today={1} total={2} daily={[1, 2, 3]} />);
      expect(screen.getByLabelText('방문자 통계')).toBeInTheDocument();
    });

    it('sparkline 영역이 aria-hidden 으로 스크린리더 무시 대상이다', () => {
      const { container } = renderWithTheme(<VisitorBlock today={1} total={2} daily={[1, 2, 3]} />);

      const hidden = container.querySelector('[aria-hidden]');
      expect(hidden).not.toBeNull();
      // sparkline svg 는 aria-hidden 영역 안에 위치해야 한다
      expect(hidden?.querySelector('svg')).not.toBeNull();
    });
  });

  describe('memoization', () => {
    it('displayName 이 "VisitorBlock" 이다', () => {
      expect(VisitorBlock.displayName).toBe('VisitorBlock');
    });
  });
});
