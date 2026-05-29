import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, within } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import ImageEditModal from './ImageEditModal';

// react-image-crop 은 canvas/측정 의존이 커서 children 만 그대로 렌더하는 더미로 대체.
vi.mock('react-image-crop', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  centerCrop: (c: unknown) => c,
  makeAspectCrop: () => ({ unit: '%', x: 0, y: 0, width: 90, height: 90 }),
}));

// canvas 미지원(jsdom) → 이미지 베이크/방향 렌더는 가벼운 mock 으로 대체.
vi.mock('@/lib/image/bakeImage', () => ({
  renderOrientedDataUrl: () => 'data:image/png;base64,oriented',
  bakeCroppedImage: vi.fn(async () => ({
    blob: new Blob(),
    previewUrl: 'data:image/webp;base64,baked',
  })),
}));

const defaultProps = {
  isOpen: true as const,
  src: 'blob:https://example.com/original',
  aspect: 16 / 9,
  onCancel: vi.fn(),
  onApply: vi.fn(),
};

// 확인 모달("이미지를 삭제하시겠습니까?") 의 dialog 스코프를 잡아준다.
// 메인 모달에도 「삭제」가 없지만 「취소」는 양쪽에 존재할 수 있어 스코프가 필요.
const getConfirmDialog = (): HTMLElement => {
  const confirmText = screen.getByText('이미지를 삭제하시겠습니까?');
  const dialog = confirmText.closest('[role="dialog"]');
  if (!dialog) {
    throw new Error('확인 모달 dialog 를 찾지 못했습니다');
  }
  return dialog as HTMLElement;
};

describe('ImageEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isOpen=false 면 아무것도 렌더되지 않는다', () => {
    renderWithTheme(<ImageEditModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen=true 면 타이틀·서브타이틀이 노출된다', () => {
    renderWithTheme(<ImageEditModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('이미지 편집')).toBeInTheDocument();
    expect(screen.getByText('사용할 영역을 드래그해서 선택하세요')).toBeInTheDocument();
  });

  it('툴바에 「이미지 교체」 + 회전/반전/초기화 버튼이 렌더된다', () => {
    renderWithTheme(<ImageEditModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: '이미지 교체' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90° 회전' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '좌우 반전' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();
  });

  it('footer 에 「취소」「이미지 적용」 버튼이 렌더된다', () => {
    renderWithTheme(<ImageEditModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이미지 적용' })).toBeInTheDocument();
  });

  it('로딩 전(baseImg=null)에는 "이미지를 불러오는 중..." 이 표시된다', () => {
    // jsdom 은 img.onload 를 발화하지 않으므로 baseImg 는 null 로 남는다.
    renderWithTheme(<ImageEditModal {...defaultProps} />);
    expect(screen.getByText('이미지를 불러오는 중...')).toBeInTheDocument();
  });

  it('로딩 전에는 회전/반전/초기화 + 적용 버튼이 disabled 다', () => {
    renderWithTheme(<ImageEditModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: '90° 회전' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '좌우 반전' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '초기화' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '이미지 적용' })).toBeDisabled();
  });

  it('로딩 전에도 「이미지 교체」 버튼은 disabled 가 아니다', () => {
    renderWithTheme(<ImageEditModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: '이미지 교체' })).toBeEnabled();
  });

  it('「취소」 클릭 시 onCancel 이 호출된다', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithTheme(<ImageEditModal {...defaultProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('canDelete 기본(false)이면 「이미지 삭제」 버튼이 노출되지 않는다', () => {
    renderWithTheme(<ImageEditModal {...defaultProps} />);
    expect(screen.queryByRole('button', { name: '이미지 삭제' })).not.toBeInTheDocument();
  });

  it('canDelete=true 면 「이미지 삭제」 버튼이 노출된다', () => {
    renderWithTheme(<ImageEditModal {...defaultProps} canDelete onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: '이미지 삭제' })).toBeInTheDocument();
  });

  it('「이미지 삭제」 클릭 시 확인 모달이 열린다', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ImageEditModal {...defaultProps} canDelete onDelete={vi.fn()} />);
    expect(screen.queryByText('이미지를 삭제하시겠습니까?')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '이미지 삭제' }));
    expect(await screen.findByText('이미지를 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('확인 모달의 「삭제」 클릭 시 onDelete 가 호출된다', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithTheme(<ImageEditModal {...defaultProps} canDelete onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: '이미지 삭제' }));

    const confirmDialog = getConfirmDialog();
    await user.click(within(confirmDialog).getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('확인 모달의 「취소」 클릭 시 onDelete 미호출 + 확인 문구가 사라진다', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithTheme(<ImageEditModal {...defaultProps} canDelete onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: '이미지 삭제' }));

    const confirmDialog = getConfirmDialog();
    await user.click(within(confirmDialog).getByRole('button', { name: '취소' }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText('이미지를 삭제하시겠습니까?')).not.toBeInTheDocument();
  });

  it('displayName 이 "ImageEditModal" 이다', () => {
    expect(ImageEditModal.displayName).toBe('ImageEditModal');
  });
});
