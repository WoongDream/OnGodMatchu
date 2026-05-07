import { memo, useEffect, useRef, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import Button from '@/components/button';
import Input from '@/components/input';
import Toggle from '@/components/toggle';
import ProfileImage from '@/components/profile-image';
import useNicknameCheck from '@/hooks/useNicknameCheck';
import useProfileImage from '@/hooks/useProfileImage';
import useUpdateProfile from '@/hooks/useUpdateProfile';
import {
  BIO_MAX_LENGTH,
  PROFILE_IMAGE_MAX_BYTES,
  isAllowedProfileImageMime,
  isWithinProfileImageSize,
} from '@/lib/user';
import type { User } from '@/types';
import {
  wrapperStyle,
  cardStyle,
  cardHeadingStyle,
  imageRowStyle,
  imageActionsStyle,
  imageButtonsRowStyle,
  policyTextStyle,
  fieldStyle,
  labelRowStyle,
  labelStyle,
  counterStyle,
  textareaStyle,
  saveRowStyle,
  visibilityRowStyle,
  visibilityTextStyle,
  visibilityTitleStyle,
  visibilityHintStyle,
  errorTextStyle,
  statusTextStyle,
} from './ProfileInfo.style';

type OutletContext = {
  profile: User;
  isMe: boolean;
};

const PROFILE_IMAGE_MAX_MB = Math.round(PROFILE_IMAGE_MAX_BYTES / (1024 * 1024));

const ProfileInfo = memo(() => {
  const { profile, isMe } = useOutletContext<OutletContext>();

  if (!isMe) {
    return <Navigate to=".." replace />;
  }

  return <ProfileInfoForm profile={profile} />;
});

ProfileInfo.displayName = 'ProfileInfo';
export default ProfileInfo;

type FormProps = { profile: User };

const ProfileInfoForm = memo(({ profile }: FormProps) => {
  const { update, toggleVisibility, isSaving, isToggling, error, errorCode, clearError } =
    useUpdateProfile();
  const {
    upload,
    regenerateDefault,
    isUploading,
    isRegenerating,
    isProcessing: isImageProcessing,
    error: imageError,
    clearError: clearImageError,
  } = useProfileImage();

  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nicknameCheck = useNicknameCheck(nickname, { exclude: profile.nickname });

  const isDirty = nickname !== profile.nickname || bio !== (profile.bio ?? '');
  const canSave =
    isDirty &&
    !isSaving &&
    bio.length <= BIO_MAX_LENGTH &&
    (nickname === profile.nickname ||
      nicknameCheck.status === 'available' ||
      nicknameCheck.status === 'idle');

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleSave = async () => {
    clearError();
    const payload: { nickname?: string; bio?: string } = {};
    if (nickname !== profile.nickname) {
      payload.nickname = nickname;
    }
    if (bio !== (profile.bio ?? '')) {
      payload.bio = bio;
    }
    if (Object.keys(payload).length === 0) {
      return;
    }
    await update(payload);
  };

  const handleFileChosen = async (file: File) => {
    setImageValidationError(null);
    clearImageError();
    if (!isAllowedProfileImageMime(file.type)) {
      setImageValidationError('JPEG / PNG / WebP 파일만 업로드할 수 있어요.');
      return;
    }
    if (!isWithinProfileImageSize(file.size)) {
      setImageValidationError(`최대 ${PROFILE_IMAGE_MAX_MB}MB 이하만 업로드할 수 있어요.`);
      return;
    }
    await upload(file);
  };

  const handleRegenerateDefault = async () => {
    setImageValidationError(null);
    clearImageError();
    await regenerateDefault();
  };

  const handleToggleVisibility = async (next: boolean) => {
    await toggleVisibility(next);
  };

  const imageMessage = imageValidationError ?? imageError;

  return (
    <div css={wrapperStyle}>
      <h2>내 정보</h2>

      <section css={cardStyle} aria-label="이미지">
        <h3 css={cardHeadingStyle}>이미지</h3>
        <div css={imageRowStyle}>
          <ProfileImage nickname={profile.nickname} imageUrl={profile.profileImageUrl} size="lg" />
          <div css={imageActionsStyle}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileChosen(file);
                }
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            />
            <div css={imageButtonsRowStyle}>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImageProcessing}
              >
                {isUploading ? '처리 중...' : '이미지 업로드'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleRegenerateDefault}
                disabled={isImageProcessing}
              >
                {isRegenerating ? '처리 중...' : '기본 이미지로'}
              </Button>
            </div>
            <span css={policyTextStyle}>JPEG / PNG / WebP</span>
            <span css={policyTextStyle}>최대 크기 {PROFILE_IMAGE_MAX_MB}MB</span>
            {imageMessage && (
              <span css={errorTextStyle} role="alert">
                {imageMessage}
              </span>
            )}
          </div>
        </div>
      </section>

      <section css={cardStyle} aria-label="기본 정보">
        <h3 css={cardHeadingStyle}>기본 정보</h3>
        <div css={fieldStyle}>
          <div css={labelRowStyle}>
            <span css={labelStyle}>닉네임</span>
            <span css={counterStyle}>2-10자</span>
          </div>
          <Input value={nickname} onChange={setNickname} placeholder="닉네임" />
          {nicknameCheck.message && (
            <span
              css={statusTextStyle(
                nicknameCheck.status as 'available' | 'taken' | 'invalid' | 'checking' | 'error',
              )}
            >
              {nicknameCheck.message}
            </span>
          )}
        </div>
        <div css={fieldStyle}>
          <div css={labelRowStyle}>
            <span css={labelStyle}>한 줄 소개</span>
            <span css={counterStyle}>
              {bio.length}/{BIO_MAX_LENGTH}
            </span>
          </div>
          <textarea
            css={textareaStyle}
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
            placeholder="자신을 소개해주세요"
          />
        </div>
        {error && (
          <span css={errorTextStyle} role="alert">
            {error}
            {errorCode === 'NICKNAME_TAKEN' && ' 다른 닉네임을 선택해주세요.'}
          </span>
        )}
        <div css={saveRowStyle}>
          <Button onClick={handleSave} disabled={!canSave}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </section>

      <section css={cardStyle} aria-label="공개 설정">
        <h3 css={cardHeadingStyle}>공개 설정</h3>
        <div css={visibilityRowStyle}>
          <div css={visibilityTextStyle}>
            <span css={visibilityTitleStyle}>프로필 공개</span>
            <span css={visibilityHintStyle}>
              다른 사용자가 내가 만든 퀴즈 목록, 푼 퀴즈 목록을 볼 수 있어요.
            </span>
          </div>
          <Toggle
            checked={profile.isProfilePublic}
            onChange={handleToggleVisibility}
            disabled={isToggling}
            ariaLabel="프로필 공개"
          />
        </div>
      </section>
    </div>
  );
});

ProfileInfoForm.displayName = 'ProfileInfoForm';
