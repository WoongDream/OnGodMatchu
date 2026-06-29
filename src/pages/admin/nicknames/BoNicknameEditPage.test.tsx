import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { ForbiddenNickname } from '@/types';
import BoNicknameEditPage from './BoNicknameEditPage';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseParams = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// ── useToast mock ────────────────────────────────────────────────────────────
const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock('@/components/toast', () => ({
  useToast: () => ({
    show: vi.fn(),
    success: mockToastSuccess,
    info: vi.fn(),
    error: mockToastError,
  }),
}));

// ── useBoNickname mock ───────────────────────────────────────────────────────
const mockUseBoNickname = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoNickname', () => ({ default: mockUseBoNickname }));

// ── @/api/admin mock ─────────────────────────────────────────────────────────
const mockCreate = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockMapNicknameError = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  createNicknameRule: mockCreate,
  updateNicknameRule: mockUpdate,
  deleteNicknameRule: mockDelete,
  mapNicknameError: mockMapNicknameError,
}));

// ── ConfirmModal mock — 모달-확인 / 모달-취소 버튼 노출 ──────────────────────────
vi.mock('@/components/confirm-modal', () => ({
  default: ({
    isOpen,
    onConfirm,
    onClose,
    title,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    title: string;
  }) =>
    isOpen
      ? React.createElement(
          'div',
          { 'data-testid': 'confirm-modal' },
          React.createElement('span', null, title),
          React.createElement('button', { onClick: onConfirm }, '모달-확인'),
          React.createElement('button', { onClick: onClose }, '모달-취소'),
        )
      : null,
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_RULE: ForbiddenNickname = {
  id: 5,
  value: '관리자',
  normalizedValue: '관리자',
  type: 'FORBIDDEN',
  matchType: 'CONTAINS',
  reason: '사칭 방지',
  createdAt: '2025-02-01T09:30:00Z',
};

const DEFAULT_NICKNAME_RETURN = {
  rule: undefined,
  isLoading: false,
  error: null,
};

const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <BoNicknameEditPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('BoNicknameEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: undefined });
    mockUseBoNickname.mockReturnValue(DEFAULT_NICKNAME_RETURN);
    mockCreate.mockResolvedValue(MOCK_RULE);
    mockUpdate.mockResolvedValue(MOCK_RULE);
    mockDelete.mockResolvedValue(undefined);
    mockMapNicknameError.mockReturnValue('UNKNOWN');
  });

  describe('생성 모드 (id undefined)', () => {
    it('헤더 "닉네임 추가" 가 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '닉네임 추가' })).toBeInTheDocument();
    });

    it('빈 입력 시 "추가" 버튼이 disabled 다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
    });

    it('유형 "예약" 클릭 시 matchType 이 "접두일치"(PREFIX) 로 전환된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '예약' }));
      expect(screen.getByRole('button', { name: '접두일치' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('유형 "금지" 클릭 시 matchType 이 "부분일치"(CONTAINS) 로 전환된다', () => {
      renderPage();
      // 먼저 예약 → 접두로 바꾼 뒤 다시 금지 클릭
      fireEvent.click(screen.getByRole('button', { name: '예약' }));
      fireEvent.click(screen.getByRole('button', { name: '금지' }));
      expect(screen.getByRole('button', { name: '부분일치' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('매칭 방식 "완전일치" 클릭 시 설명 문구가 갱신된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '완전일치' }));
      expect(screen.getByText('닉네임이 정확히 같을 때만 차단해요.')).toBeInTheDocument();
    });

    it('값 입력 후 "추가" 클릭 시 createNicknameRule 호출(reason null) + 성공 토스트 + navigate', async () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('예: 관리자'), {
        target: { value: '관리자' },
      });

      const submit = screen.getByRole('button', { name: '추가' });
      expect(submit).toBeEnabled();
      fireEvent.click(submit);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          value: '관리자',
          type: 'FORBIDDEN',
          matchType: 'CONTAINS',
          reason: null,
        });
        expect(mockToastSuccess).toHaveBeenCalledWith('닉네임 규칙을 등록했어요.');
        expect(mockNavigate).toHaveBeenCalledWith('/admin/nicknames');
      });
    });

    it('생성 모드에서는 "규칙 삭제" 버튼이 없다', () => {
      renderPage();
      expect(screen.queryByRole('button', { name: '규칙 삭제' })).not.toBeInTheDocument();
    });
  });

  describe('수정 모드 (id="5")', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: '5' });
      mockUseBoNickname.mockReturnValue({ ...DEFAULT_NICKNAME_RETURN, rule: MOCK_RULE });
    });

    it('헤더 "닉네임 수정" 이 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '닉네임 수정' })).toBeInTheDocument();
    });

    it('rule 값으로 폼이 초기화된다', () => {
      renderPage();
      expect(screen.getByDisplayValue('관리자')).toBeInTheDocument();
      expect(screen.getByDisplayValue('사칭 방지')).toBeInTheDocument();
    });

    it('"변경사항 저장" 클릭 시 updateNicknameRule(5, payload) + 성공 토스트', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }));
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(5, {
          value: '관리자',
          type: 'FORBIDDEN',
          matchType: 'CONTAINS',
          reason: '사칭 방지',
        });
        expect(mockToastSuccess).toHaveBeenCalledWith('닉네임 규칙을 저장했어요.');
      });
    });

    it('"규칙 삭제" → ConfirmModal 확인 → deleteNicknameRule(5) + navigate', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '규칙 삭제' }));
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '모달-확인' }));
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith(5);
        expect(mockNavigate).toHaveBeenCalledWith('/admin/nicknames');
      });
    });
  });

  describe('에러', () => {
    it('생성 중 중복 에러 시 DUPLICATE 토스트가 노출된다', async () => {
      mockCreate.mockRejectedValue(new Error('dup'));
      mockMapNicknameError.mockReturnValue('DUPLICATE');
      renderPage();

      fireEvent.change(screen.getByPlaceholderText('예: 관리자'), {
        target: { value: '관리자' },
      });
      fireEvent.click(screen.getByRole('button', { name: '추가' }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('이미 등록된 닉네임·매칭 조합이에요.');
      });
    });
  });
});
