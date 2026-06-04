import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfileSummary from '@/hooks/useProfileSummary';
import useAuthStore from '@/store/authStore';
import ProfileModalView from './ProfileModalView';
import type { ProfileModalProps } from './ProfileModal.type';

/**
 * 사람(퀴즈 만든이 / 댓글 작성자)을 클릭하면 뜨는 프로필 카드형 모달.
 * publicId 가 null 이면 닫힘. "프로필 보러가기" → 본인이면 /profile, 타인이면 /users/:publicId/quizzes-made.
 */
const ProfileModal = memo(({ publicId, onClose }: ProfileModalProps) => {
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);
  const { summary, isLoading, error } = useProfileSummary(publicId);

  const handleGoProfile = useCallback(() => {
    if (!publicId) {
      return;
    }
    const isMe = !!me?.userId && me.userId === publicId;
    navigate(isMe ? '/profile/quizzes-made' : `/users/${publicId}/quizzes-made`);
    onClose();
  }, [publicId, me, navigate, onClose]);

  return (
    <ProfileModalView
      isOpen={publicId != null}
      onClose={onClose}
      summary={summary}
      isLoading={isLoading}
      error={!!error}
      onGoProfile={handleGoProfile}
    />
  );
});

ProfileModal.displayName = 'ProfileModal';
export default ProfileModal;
