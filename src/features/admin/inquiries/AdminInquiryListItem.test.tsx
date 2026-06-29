import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import type { BoInquiryListItem } from '@/types';
import AdminInquiryListItem from './AdminInquiryListItem';

// ── react-router-dom mock (useNavigate) ──────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createItem = (overrides?: Partial<BoInquiryListItem>): BoInquiryListItem => ({
  id: 1,
  title: '로그인이 안돼요',
  author: {
    publicId: 'pub-1',
    nickname: '홍길동',
    profileImageUrl: null,
  },
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2025-03-15T08:30:00Z',
  ...overrides,
});

describe('AdminInquiryListItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더', () => {
    it('제목이 렌더된다', () => {
      renderWithTheme(<AdminInquiryListItem item={createItem({ title: '환불 문의' })} />);
      expect(screen.getByText('환불 문의')).toBeInTheDocument();
    });

    it('작성자 닉네임이 렌더된다', () => {
      renderWithTheme(
        <AdminInquiryListItem
          item={createItem({
            author: { publicId: 'p', nickname: '김철수', profileImageUrl: null },
          })}
        />,
      );
      expect(screen.getByText('김철수')).toBeInTheDocument();
    });

    it('imageUrl 이 없으면 ProfileImage fallback(role="img") 이 렌더된다', () => {
      renderWithTheme(
        <AdminInquiryListItem
          item={createItem({
            author: { publicId: 'p', nickname: '홍길동', profileImageUrl: null },
          })}
        />,
      );
      expect(screen.getByRole('img', { name: '홍길동 프로필 이미지' })).toBeInTheDocument();
    });

    it('imageUrl 이 있으면 img 요소가 src 로 렌더된다', () => {
      renderWithTheme(
        <AdminInquiryListItem
          item={createItem({
            author: {
              publicId: 'p',
              nickname: '홍길동',
              profileImageUrl: 'https://example.com/a.png',
            },
          })}
        />,
      );
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/a.png');
    });

    it('상태 배지 라벨이 렌더된다', () => {
      renderWithTheme(<AdminInquiryListItem item={createItem({ status: 'IN_PROGRESS' })} />);
      expect(screen.getByText('처리중')).toBeInTheDocument();
    });

    it('접수일이 YYYY-MM-DD 로 잘려서 렌더된다', () => {
      renderWithTheme(
        <AdminInquiryListItem item={createItem({ createdAt: '2025-03-15T08:30:00Z' })} />,
      );
      expect(screen.getByText('2025-03-15')).toBeInTheDocument();
    });
  });

  describe('네비게이션', () => {
    it('행 클릭 시 navigate(`/admin/inquiries/{id}`) 호출', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AdminInquiryListItem item={createItem({ id: 42 })} />);
      await user.click(screen.getByRole('button', { name: /로그인이 안돼요/ }));
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/inquiries/42');
    });

    it('Enter 키로 행을 활성화하면 navigate 가 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AdminInquiryListItem item={createItem({ id: 7 })} />);
      screen.getByRole('button', { name: /로그인이 안돼요/ }).focus();
      await user.keyboard('{Enter}');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/inquiries/7');
    });

    it('Space 키로 행을 활성화하면 navigate 가 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<AdminInquiryListItem item={createItem({ id: 9 })} />);
      screen.getByRole('button', { name: /로그인이 안돼요/ }).focus();
      await user.keyboard(' ');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/inquiries/9');
    });
  });

  describe('displayName', () => {
    it('displayName 이 "AdminInquiryListItem" 이다', () => {
      expect(AdminInquiryListItem.displayName).toBe('AdminInquiryListItem');
    });
  });
});
