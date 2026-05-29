import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import LoginPromptModal from './LoginPromptModal';

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/quiz', search: '' }),
}));

describe('LoginPromptModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isOpen=false 면 렌더되지 않는다', () => {
    renderWithTheme(<LoginPromptModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen=true 면 dialog 가 렌더된다', () => {
    renderWithTheme(<LoginPromptModal isOpen onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('footer 버튼 순서는 [로그인하러 가기][닫기]', () => {
    renderWithTheme(<LoginPromptModal isOpen onClose={() => {}} />);
    const buttons = screen.getAllByRole('button').filter((b) => {
      const t = b.textContent ?? '';
      return t === '로그인하러 가기' || t === '닫기';
    });
    expect(buttons.map((b) => b.textContent)).toEqual(['로그인하러 가기', '닫기']);
  });

  it('「로그인하러 가기」 클릭 시 navigate("/login", state) + onClose 호출', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(<LoginPromptModal isOpen onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '로그인하러 가기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { from: '/quiz' },
    });
  });

  it('footer 「닫기」 클릭 시 onClose 호출 + navigate 미호출 (Modal X 버튼 아님)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(<LoginPromptModal isOpen onClose={onClose} />);
    const footerClose = screen.getByText('닫기'); // 텍스트 노드 = footer 버튼 라벨
    await user.click(footerClose);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
