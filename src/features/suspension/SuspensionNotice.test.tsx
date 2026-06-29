import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import SuspensionNotice from './SuspensionNotice';

describe('SuspensionNotice', () => {
  describe('배지', () => {
    it('until 이 없으면 "정지됨" 배지를 표시한다', () => {
      renderWithTheme(<SuspensionNotice />);
      expect(screen.getByText('정지됨')).toBeInTheDocument();
    });

    it('until 이 있으면 날짜를 포함한 배지를 표시한다', () => {
      renderWithTheme(<SuspensionNotice until="2026-12-31" />);
      expect(screen.getByText('정지됨 · ~2026-12-31까지')).toBeInTheDocument();
    });
  });

  describe('메시지', () => {
    it('message 미지정 시 기본 안내 문구를 표시한다', () => {
      renderWithTheme(<SuspensionNotice />);
      expect(screen.getByText('정지된 계정은 이 기능을 사용할 수 없어요.')).toBeInTheDocument();
    });

    it('message 지정 시 해당 문구를 표시한다', () => {
      renderWithTheme(<SuspensionNotice message="퀴즈 생성이 제한되었어요." />);
      expect(screen.getByText('퀴즈 생성이 제한되었어요.')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('role="alert" 컨테이너로 렌더된다', () => {
      renderWithTheme(<SuspensionNotice />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "SuspensionNotice" 이다', () => {
      expect(SuspensionNotice.displayName).toBe('SuspensionNotice');
    });
  });
});
