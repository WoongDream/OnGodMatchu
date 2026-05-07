import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { User } from '@/types';
import ProfileInfo from './ProfileInfo';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockUseOutletContext = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) =>
    React.createElement('div', {
      'data-testid': 'navigate',
      'data-to': to,
      'data-replace': String(replace ?? false),
    }),
  useOutletContext: mockUseOutletContext,
}));

// ── useUpdateProfile mock ─────────────────────────────────────────────────────
const mockUpdate = vi.hoisted(() => vi.fn());
const mockToggleVisibility = vi.hoisted(() => vi.fn());
const mockClearError = vi.hoisted(() => vi.fn());
const mockUseUpdateProfile = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    update: mockUpdate,
    toggleVisibility: mockToggleVisibility,
    isSaving: false,
    isToggling: false,
    error: null,
    errorCode: null,
    clearError: mockClearError,
  }),
);

vi.mock('@/hooks/useUpdateProfile', () => ({
  default: mockUseUpdateProfile,
}));

// ── useProfileImage mock ──────────────────────────────────────────────────────
const mockUpload = vi.hoisted(() => vi.fn());
const mockRegenerateDefault = vi.hoisted(() => vi.fn());
const mockRemoveImage = vi.hoisted(() => vi.fn());
const mockClearImageError = vi.hoisted(() => vi.fn());
const mockUseProfileImage = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    upload: mockUpload,
    removeImage: mockRemoveImage,
    regenerateDefault: mockRegenerateDefault,
    isUploading: false,
    isRegenerating: false,
    isRemoving: false,
    isProcessing: false,
    error: null,
    errorCode: null,
    clearError: mockClearImageError,
  }),
);

vi.mock('@/hooks/useProfileImage', () => ({
  default: mockUseProfileImage,
}));

// ── useNicknameCheck mock ─────────────────────────────────────────────────────
const mockNicknameCheck = vi.hoisted(() =>
  vi.fn().mockReturnValue({ status: 'idle', message: undefined }),
);

vi.mock('@/hooks/useNicknameCheck', () => ({
  default: mockNicknameCheck,
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_PROFILE: User = {
  id: 1,
  email: 'test@example.com',
  nickname: 'woong',
  provider: 'LOCAL',
  profileImageUrl: 'https://example.com/avatar.png',
  bio: '안녕',
  isProfilePublic: true,
  createdAt: '2025-01-01T00:00:00Z',
};

// ── render 헬퍼 ───────────────────────────────────────────────────────────────
const renderProfileInfo = (overrides: Partial<{ profile: User; isMe: boolean }> = {}) => {
  mockUseOutletContext.mockReturnValue({
    profile: MOCK_PROFILE,
    isMe: true,
    ...overrides,
  });

  return render(
    <ThemeProvider theme={theme}>
      <ProfileInfo />
    </ThemeProvider>,
  );
};

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('ProfileInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNicknameCheck.mockReturnValue({ status: 'idle', message: undefined });
    mockUseUpdateProfile.mockReturnValue({
      update: mockUpdate,
      toggleVisibility: mockToggleVisibility,
      isSaving: false,
      isToggling: false,
      error: null,
      errorCode: null,
      clearError: mockClearError,
    });
    mockUseProfileImage.mockReturnValue({
      upload: mockUpload,
      removeImage: mockRemoveImage,
      regenerateDefault: mockRegenerateDefault,
      isUploading: false,
      isRegenerating: false,
      isRemoving: false,
      isProcessing: false,
      error: null,
      errorCode: null,
      clearError: mockClearImageError,
    });
    mockUpdate.mockResolvedValue(MOCK_PROFILE);
    mockToggleVisibility.mockResolvedValue(MOCK_PROFILE);
    mockUpload.mockResolvedValue(MOCK_PROFILE);
    mockRegenerateDefault.mockResolvedValue(MOCK_PROFILE);
    mockRemoveImage.mockResolvedValue({ ...MOCK_PROFILE, profileImageUrl: null });
  });

  describe('접근 제어', () => {
    it('isMe=false 이면 Navigate 렌더, 폼 미렌더', () => {
      renderProfileInfo({ isMe: false });
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '..');
      expect(screen.queryByRole('heading', { name: '내 정보' })).not.toBeInTheDocument();
    });
  });

  describe('렌더링', () => {
    it('isMe=true 이면 "내 정보" 헤딩이 표시된다', () => {
      renderProfileInfo();
      expect(screen.getByRole('heading', { name: '내 정보' })).toBeInTheDocument();
    });

    it('이미지 / 기본 정보 / 공개 설정 카드 3개가 렌더된다', () => {
      renderProfileInfo();
      expect(screen.getByRole('region', { name: '이미지' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: '기본 정보' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: '공개 설정' })).toBeInTheDocument();
    });

    it('닉네임 input 의 초기값 = profile.nickname', () => {
      renderProfileInfo();
      expect(screen.getByPlaceholderText('닉네임')).toHaveValue('woong');
    });

    it('bio textarea 의 초기값 = profile.bio', () => {
      renderProfileInfo();
      expect(screen.getByPlaceholderText('자신을 소개해주세요')).toHaveValue('안녕');
    });

    it('bio 가 없으면 textarea 초기값 = 빈 문자열', () => {
      renderProfileInfo({ profile: { ...MOCK_PROFILE, bio: undefined } });
      expect(screen.getByPlaceholderText('자신을 소개해주세요')).toHaveValue('');
    });

    it('한 줄 소개 카운터가 "현재길이/40" 형식으로 표시된다', () => {
      // bio='안녕' → 길이 2
      renderProfileInfo();
      expect(screen.getByText('2/40')).toBeInTheDocument();
    });

    it('useUpdateProfile 의 error 가 있으면 role=alert 으로 노출', () => {
      mockUseUpdateProfile.mockReturnValue({
        update: mockUpdate,
        toggleVisibility: mockToggleVisibility,
        isSaving: false,
        isToggling: false,
        error: '사용자를 찾을 수 없습니다.',
        errorCode: 'USER_NOT_FOUND',
        clearError: mockClearError,
      });
      renderProfileInfo();
      expect(screen.getByRole('alert')).toHaveTextContent('사용자를 찾을 수 없습니다.');
    });
  });

  describe('bio 카운터 & 최대 길이 제한', () => {
    it('bio 변경 시 카운터가 업데이트된다', () => {
      renderProfileInfo({ profile: { ...MOCK_PROFILE, bio: '' } });
      const textarea = screen.getByPlaceholderText('자신을 소개해주세요');
      fireEvent.change(textarea, { target: { value: 'hello' } });
      expect(screen.getByText('5/40')).toBeInTheDocument();
    });

    it('bio 가 BIO_MAX_LENGTH(40) 초과 입력 시 40자로 잘린다', () => {
      renderProfileInfo({ profile: { ...MOCK_PROFILE, bio: '' } });
      const textarea = screen.getByPlaceholderText('자신을 소개해주세요');
      fireEvent.change(textarea, { target: { value: 'a'.repeat(50) } });
      expect((textarea as HTMLTextAreaElement).value).toHaveLength(40);
      expect(screen.getByText('40/40')).toBeInTheDocument();
    });
  });

  describe('저장 버튼 활성 조건', () => {
    it('변경 없으면 저장 버튼 disabled', () => {
      renderProfileInfo();
      expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
    });

    it('bio 변경 + nicknameCheck.status=idle(닉네임 미변경) 이면 저장 버튼 활성', () => {
      mockNicknameCheck.mockReturnValue({ status: 'idle', message: undefined });
      renderProfileInfo();
      fireEvent.change(screen.getByPlaceholderText('자신을 소개해주세요'), {
        target: { value: '새 소개' },
      });
      expect(screen.getByRole('button', { name: '저장' })).not.toBeDisabled();
    });

    it('닉네임 변경 + status=available 이면 저장 버튼 활성', () => {
      mockNicknameCheck.mockReturnValue({
        status: 'available',
        message: '사용 가능한 닉네임입니다.',
      });
      renderProfileInfo();
      fireEvent.change(screen.getByPlaceholderText('닉네임'), { target: { value: 'newname' } });
      expect(screen.getByRole('button', { name: '저장' })).not.toBeDisabled();
    });

    it('닉네임 변경 + status=taken 이면 저장 버튼 disabled', () => {
      mockNicknameCheck.mockReturnValue({
        status: 'taken',
        message: '이미 사용 중인 닉네임입니다.',
      });
      renderProfileInfo();
      fireEvent.change(screen.getByPlaceholderText('닉네임'), { target: { value: 'takenname' } });
      expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
    });
  });

  describe('저장 버튼 클릭', () => {
    it('닉네임만 변경 시 nickname 필드만 포함한 payload 로 update 호출', async () => {
      mockNicknameCheck.mockReturnValue({
        status: 'available',
        message: '사용 가능한 닉네임입니다.',
      });
      renderProfileInfo();
      fireEvent.change(screen.getByPlaceholderText('닉네임'), { target: { value: 'newname' } });
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ nickname: 'newname' }));
    });

    it('bio 만 변경 시 bio 필드만 포함한 payload 로 update 호출', async () => {
      mockNicknameCheck.mockReturnValue({ status: 'idle', message: undefined });
      renderProfileInfo();
      fireEvent.change(screen.getByPlaceholderText('자신을 소개해주세요'), {
        target: { value: '새 소개' },
      });
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ bio: '새 소개' }));
    });

    it('닉네임 + bio 모두 변경 시 둘 다 payload 에 포함', async () => {
      mockNicknameCheck.mockReturnValue({
        status: 'available',
        message: '사용 가능한 닉네임입니다.',
      });
      renderProfileInfo();
      fireEvent.change(screen.getByPlaceholderText('닉네임'), { target: { value: 'newname' } });
      fireEvent.change(screen.getByPlaceholderText('자신을 소개해주세요'), {
        target: { value: '새 소개' },
      });
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith({ nickname: 'newname', bio: '새 소개' }),
      );
    });

    it('isSaving=true 일 때 저장 버튼만 disabled, 이미지 버튼/토글 영향 없음', () => {
      mockUseUpdateProfile.mockReturnValue({
        update: mockUpdate,
        toggleVisibility: mockToggleVisibility,
        isSaving: true,
        isToggling: false,
        error: null,
        errorCode: null,
        clearError: mockClearError,
      });
      renderProfileInfo();
      // 저장 버튼 — "저장 중..." 텍스트로 바뀜
      expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled();
      // 이미지 버튼들 — isProcessing=false 이므로 enabled
      expect(screen.getByRole('button', { name: '이미지 업로드' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: '기본 이미지로' })).not.toBeDisabled();
      // 토글 — isToggling=false 이므로 enabled
      expect(screen.getByRole('switch', { name: '프로필 공개' })).not.toBeDisabled();
    });
  });

  describe('이미지 업로드 버튼', () => {
    it('클릭 시 파일 input 을 트리거하여 파일 선택 후 upload(file) 가 호출된다', async () => {
      renderProfileInfo();
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
      Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
      fireEvent.change(fileInput);
      await waitFor(() => expect(mockUpload).toHaveBeenCalledWith(file));
    });

    it('isUploading=true 일 때 업로드 버튼만 "처리 중..."(disabled), 기본 이미지로 라벨 유지(disabled)', () => {
      mockUseProfileImage.mockReturnValue({
        upload: mockUpload,
        removeImage: mockRemoveImage,
        regenerateDefault: mockRegenerateDefault,
        isUploading: true,
        isRegenerating: false,
        isRemoving: false,
        isProcessing: true,
        error: null,
        errorCode: null,
        clearError: mockClearImageError,
      });
      renderProfileInfo();
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '기본 이미지로' })).toBeDisabled();
    });

    it('isProcessing=true 일 때 저장 버튼/토글 은 영향 없음', () => {
      mockUseProfileImage.mockReturnValue({
        upload: mockUpload,
        removeImage: mockRemoveImage,
        regenerateDefault: mockRegenerateDefault,
        isUploading: true,
        isRegenerating: false,
        isRemoving: false,
        isProcessing: true,
        error: null,
        errorCode: null,
        clearError: mockClearImageError,
      });
      renderProfileInfo();
      // 저장 버튼 — isDirty=false 이므로 disabled 이지만 isSaving 과 무관
      expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
      // 토글 — isToggling=false 이므로 enabled
      expect(screen.getByRole('switch', { name: '프로필 공개' })).not.toBeDisabled();
    });
  });

  describe('기본 이미지로 버튼', () => {
    it('클릭 시 regenerateDefault() 호출', async () => {
      renderProfileInfo();
      fireEvent.click(screen.getByRole('button', { name: '기본 이미지로' }));
      await waitFor(() => expect(mockRegenerateDefault).toHaveBeenCalledTimes(1));
    });

    it('isProcessing=false 이면 항상 enabled (profileImageUrl null 과 무관)', () => {
      // profileImageUrl=null 이어도 isProcessing=false 이면 enabled
      renderProfileInfo({ profile: { ...MOCK_PROFILE, profileImageUrl: null } });
      expect(screen.getByRole('button', { name: '기본 이미지로' })).not.toBeDisabled();
    });

    it('isProcessing=true 이면 disabled', () => {
      mockUseProfileImage.mockReturnValue({
        upload: mockUpload,
        removeImage: mockRemoveImage,
        regenerateDefault: mockRegenerateDefault,
        isUploading: false,
        isRegenerating: true,
        isRemoving: false,
        isProcessing: true,
        error: null,
        errorCode: null,
        clearError: mockClearImageError,
      });
      renderProfileInfo();
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled();
    });

    it('isRegenerating=true 일 때 기본 이미지로 버튼만 "처리 중..."(disabled), 업로드 라벨 유지(disabled)', () => {
      mockUseProfileImage.mockReturnValue({
        upload: mockUpload,
        removeImage: mockRemoveImage,
        regenerateDefault: mockRegenerateDefault,
        isUploading: false,
        isRegenerating: true,
        isRemoving: false,
        isProcessing: true,
        error: null,
        errorCode: null,
        clearError: mockClearImageError,
      });
      renderProfileInfo();
      // 업로드 버튼 라벨은 "이미지 업로드" 유지, disabled
      expect(screen.getByRole('button', { name: '이미지 업로드' })).toBeDisabled();
      // 기본 이미지로 버튼이 "처리 중..." 으로 바뀜
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled();
    });
  });

  describe('공개 설정 토글', () => {
    it('isProfilePublic=true 인 상태에서 토글 클릭 시 toggleVisibility(false) 호출', async () => {
      renderProfileInfo({ profile: { ...MOCK_PROFILE, isProfilePublic: true } });
      fireEvent.click(screen.getByRole('switch', { name: '프로필 공개' }));
      await waitFor(() => expect(mockToggleVisibility).toHaveBeenCalledWith(false));
    });

    it('isProfilePublic=false 인 상태에서 토글 클릭 시 toggleVisibility(true) 호출', async () => {
      renderProfileInfo({ profile: { ...MOCK_PROFILE, isProfilePublic: false } });
      fireEvent.click(screen.getByRole('switch', { name: '프로필 공개' }));
      await waitFor(() => expect(mockToggleVisibility).toHaveBeenCalledWith(true));
    });

    it('isToggling=true 일 때 토글만 disabled, 저장/이미지 버튼 영향 없음', () => {
      mockUseUpdateProfile.mockReturnValue({
        update: mockUpdate,
        toggleVisibility: mockToggleVisibility,
        isSaving: false,
        isToggling: true,
        error: null,
        errorCode: null,
        clearError: mockClearError,
      });
      renderProfileInfo();
      expect(screen.getByRole('switch', { name: '프로필 공개' })).toBeDisabled();
      // 저장 버튼 — isDirty=false 이므로 disabled 이지만 isToggling 과 무관
      expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
      // 이미지 버튼들 — isProcessing=false 이므로 enabled
      expect(screen.getByRole('button', { name: '이미지 업로드' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: '기본 이미지로' })).not.toBeDisabled();
    });
  });

  describe('이미지 정책 위반', () => {
    it('허용되지 않는 mime 타입 파일 선택 시 에러 메시지 노출, upload 미호출', async () => {
      renderProfileInfo();
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
      const file = new File(['data'], 'test.gif', { type: 'image/gif' });
      Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
      fireEvent.change(fileInput);
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('JPEG / PNG / WebP 파일만'),
      );
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('파일 크기 초과 시 에러 메시지 노출, upload 미호출', async () => {
      renderProfileInfo();
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
      const file = Object.defineProperty(
        new File(['data'], 'big.jpg', { type: 'image/jpeg' }),
        'size',
        { value: 4 * 1024 * 1024 },
      );
      Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
      fireEvent.change(fileInput);
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('최대'));
      expect(mockUpload).not.toHaveBeenCalled();
    });
  });
});
