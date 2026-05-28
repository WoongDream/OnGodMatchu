import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuizPlayOptions from './QuizPlayOptions';
import type { StartOption } from './QuizPlayOptions.type';

describe('QuizPlayOptions', () => {
  let onStart: ReturnType<typeof vi.fn<(option: StartOption) => void>>;

  beforeEach(() => {
    onStart = vi.fn<(option: StartOption) => void>();
  });

  describe('일반 — 10문제 이상', () => {
    it('풀이 개수 카드 4종 (10/20/30/50) 렌더', () => {
      renderWithTheme(<QuizPlayOptions questionCount={218} onStart={onStart} />);
      expect(screen.getByRole('radio', { name: '10 문제' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '20 문제' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '30 문제' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '50 문제' })).toBeInTheDocument();
    });

    it('기본 풀이 개수 10 선택', () => {
      renderWithTheme(<QuizPlayOptions questionCount={218} onStart={onStart} />);
      expect(screen.getByRole('radio', { name: '10 문제' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('questionCount 미달 카드는 disabled (예: 30문제 → 50 disabled)', () => {
      renderWithTheme(<QuizPlayOptions questionCount={30} onStart={onStart} />);
      expect(screen.getByRole('radio', { name: '50 문제' })).toBeDisabled();
      expect(screen.getByRole('radio', { name: '30 문제' })).not.toBeDisabled();
    });

    it('CTA 클릭 시 shuffle=true + 선택한 count 로 onStart 호출', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizPlayOptions questionCount={218} onStart={onStart} />);
      await user.click(screen.getByRole('radio', { name: '30 문제' }));
      await user.click(screen.getByRole('button', { name: /30문제 풀기 시작/ }));
      expect(onStart).toHaveBeenCalledWith({
        count: 30,
        timeLimitSec: null,
        shuffle: true,
      });
    });

    it('CTA 라벨에 선택한 풀이 개수가 반영', () => {
      renderWithTheme(<QuizPlayOptions questionCount={218} onStart={onStart} />);
      expect(screen.getByRole('button', { name: /10문제 풀기 시작/ })).toBeInTheDocument();
    });
  });

  describe('적은 문제 수 — 10 미만', () => {
    it('풀이 개수 카드 대신 안내 박스 노출', () => {
      renderWithTheme(<QuizPlayOptions questionCount={7} onStart={onStart} />);
      expect(screen.queryByRole('radio', { name: '10 문제' })).not.toBeInTheDocument();
      expect(screen.getByText(/전체 문항이 적어/)).toBeInTheDocument();
      expect(screen.getByText('총 7문제')).toBeInTheDocument();
    });

    it('"전체 문항 N개" 캡션은 미노출', () => {
      renderWithTheme(<QuizPlayOptions questionCount={7} onStart={onStart} />);
      expect(screen.queryByText(/전체 문항 7개 중에서 무작위 출제/)).not.toBeInTheDocument();
    });

    it('CTA 라벨은 "N문제 풀기 시작" 으로 questionCount 사용', () => {
      renderWithTheme(<QuizPlayOptions questionCount={7} onStart={onStart} />);
      expect(screen.getByRole('button', { name: /7문제 풀기 시작/ })).toBeInTheDocument();
    });

    it('CTA 클릭 시 shuffle=false + count=questionCount 로 onStart 호출', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizPlayOptions questionCount={7} onStart={onStart} />);
      await user.click(screen.getByRole('button', { name: /7문제 풀기 시작/ }));
      expect(onStart).toHaveBeenCalledWith({
        count: 7,
        timeLimitSec: null,
        shuffle: false,
      });
    });
  });

  describe('빈 퀴즈 — 0문제', () => {
    it('CTA 가 disabled', () => {
      renderWithTheme(<QuizPlayOptions questionCount={0} onStart={onStart} />);
      const btn = screen.getByRole('button', { name: /문제 풀기 시작/ });
      expect(btn).toBeDisabled();
    });
  });
});
