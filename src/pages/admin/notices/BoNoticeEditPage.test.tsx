import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { BoNotice } from '@/types';
import BoNoticeEditPage from './BoNoticeEditPage';

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

// ── useBoNotice mock ─────────────────────────────────────────────────────────
const mockUseBoNotice = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoNotice', () => ({ default: mockUseBoNotice }));

// ── @/api/admin mock ─────────────────────────────────────────────────────────
const mockCreateNotice = vi.hoisted(() => vi.fn());
const mockUpdateNotice = vi.hoisted(() => vi.fn());
const mockDeleteNotice = vi.hoisted(() => vi.fn());
const mockMapAdminError = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  createNotice: mockCreateNotice,
  updateNotice: mockUpdateNotice,
  deleteNotice: mockDeleteNotice,
  mapAdminError: mockMapAdminError,
}));

// ── ConfirmModal mock — 확인 버튼만 노출 ────────────────────────────────────────
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
const MOCK_NOTICE: BoNotice = {
  id: 5,
  title: '기존 공지 제목',
  content: '기존 공지 내용',
  status: 'PUBLISHED',
  pinned: false,
  viewCount: 4321,
  publishedAt: '2025-02-01T00:00:00Z',
  createdAt: '2025-02-01T09:30:00Z',
  updatedAt: '2025-02-02T09:30:00Z',
};

const DEFAULT_NOTICE_RETURN = {
  notice: undefined,
  isLoading: false,
  error: null,
};

const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <BoNoticeEditPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('BoNoticeEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: undefined });
    mockUseBoNotice.mockReturnValue(DEFAULT_NOTICE_RETURN);
    mockCreateNotice.mockResolvedValue(MOCK_NOTICE);
    mockUpdateNotice.mockResolvedValue(MOCK_NOTICE);
    mockDeleteNotice.mockResolvedValue(undefined);
    mockMapAdminError.mockReturnValue('UNKNOWN');
  });

  describe('생성 모드 (id undefined)', () => {
    it('헤더 "새 공지" 가 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '새 공지' })).toBeInTheDocument();
    });

    it('빈 입력 시 "공지 작성" 버튼이 disabled 다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: '공지 작성' })).toBeDisabled();
    });

    it('제목·내용 입력 후 "공지 작성" 클릭 시 createNotice 호출 + navigate("/admin/notices")', async () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('공지 제목'), {
        target: { value: '새 제목' },
      });
      fireEvent.change(screen.getByPlaceholderText('공지 내용을 작성해 주세요.'), {
        target: { value: '새 내용' },
      });

      const submit = screen.getByRole('button', { name: '공지 작성' });
      expect(submit).toBeEnabled();
      fireEvent.click(submit);

      await waitFor(() => {
        expect(mockCreateNotice).toHaveBeenCalledWith({
          title: '새 제목',
          content: '새 내용',
          status: 'PUBLISHED',
          pinned: false,
        });
        expect(mockNavigate).toHaveBeenCalledWith('/admin/notices');
      });
    });

    it('생성 모드에서는 "공지 삭제" 버튼이 없다', () => {
      renderPage();
      expect(screen.queryByRole('button', { name: '공지 삭제' })).not.toBeInTheDocument();
    });
  });

  describe('수정 모드 (id="5")', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: '5' });
      mockUseBoNotice.mockReturnValue({ ...DEFAULT_NOTICE_RETURN, notice: MOCK_NOTICE });
    });

    it('헤더 "공지 수정" 이 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '공지 수정' })).toBeInTheDocument();
    });

    it('notice 값으로 폼이 초기화된다', () => {
      renderPage();
      expect(screen.getByDisplayValue('기존 공지 제목')).toBeInTheDocument();
      expect(screen.getByDisplayValue('기존 공지 내용')).toBeInTheDocument();
    });

    it('작성일(변경일)·조회수 메타가 표시된다', () => {
      renderPage();
      expect(screen.getByText('2025-02-02')).toBeInTheDocument(); // 작성일(변경일) = 최신(updatedAt)
      expect(screen.getByText('4,321')).toBeInTheDocument(); // viewCount toLocaleString
    });

    it('"변경사항 저장" 클릭 시 updateNotice(5, payload) + 성공 토스트', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }));
      await waitFor(() => {
        expect(mockUpdateNotice).toHaveBeenCalledWith(5, {
          title: '기존 공지 제목',
          content: '기존 공지 내용',
          status: 'PUBLISHED',
          pinned: false,
        });
        expect(mockToastSuccess).toHaveBeenCalledWith('공지를 저장했어요.');
      });
    });

    it('"공지 삭제" → ConfirmModal 확인 → deleteNotice(5) + navigate', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '공지 삭제' }));
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '모달-확인' }));
      await waitFor(() => {
        expect(mockDeleteNotice).toHaveBeenCalledWith(5);
        expect(mockNavigate).toHaveBeenCalledWith('/admin/notices');
      });
    });

    it('상태 segmented "임시저장" 클릭 시 aria-pressed 가 토글된다', () => {
      renderPage();
      const draftBtn = screen.getByRole('button', { name: '임시저장' });
      expect(draftBtn).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(draftBtn);
      expect(draftBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('상단 고정 Toggle 클릭 시 aria-checked 가 토글된다', () => {
      renderPage();
      const toggle = screen.getByRole('switch', { name: '상단 고정' });
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('부정 단언', () => {
    it('OWNER 배너가 렌더되지 않는다', () => {
      renderPage();
      expect(screen.queryByText('OWNER')).not.toBeInTheDocument();
    });
  });
});
