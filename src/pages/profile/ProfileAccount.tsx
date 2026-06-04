import { memo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import Button from '@/components/button';
import PasswordChangeModal from '@/components/password-change-modal';
import WithdrawConfirmModal from '@/components/withdraw-confirm-modal';
import useAuthStore from '@/store/authStore';
import { getActivityDays } from '@/lib/time/activity';
import { parseUserAgent, formatDeviceLabel } from '@/lib/device';
import type { User } from '@/types';
import {
  wrapperStyle,
  titleStyle,
  cardStyle,
  dangerCardStyle,
  rowStyle,
  rowMainStyle,
  rowLabelStyle,
  rowValueStyle,
  rowSubtextStyle,
  rowAccentStyle,
  valueWithBadgeStyle,
  rowActionStyle,
  dangerTitleStyle,
  dangerBodyStyle,
  dangerActionRowStyle,
  providerBadgeStyle,
} from './ProfileAccount.style';

type OutletContext = {
  profile: User;
  isMe: boolean;
};

const PROVIDER_LABELS: Record<string, string> = {
  GOOGLE: 'Google',
  NAVER: 'Naver',
};

const ProfileAccount = memo(() => {
  const { profile, isMe } = useOutletContext<OutletContext>();

  if (!isMe) {
    return <Navigate to=".." replace />;
  }

  return <ProfileAccountView profile={profile} />;
});

ProfileAccount.displayName = 'ProfileAccount';
export default ProfileAccount;

type ViewProps = { profile: User };

const ProfileAccountView = memo(({ profile }: ViewProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const isLocalProvider = profile.provider === 'LOCAL';
  const providerLabel = profile.provider ? PROVIDER_LABELS[profile.provider] : null;
  const activity = getActivityDays(profile.createdAt);
  const deviceLabel = formatDeviceLabel(parseUserAgent(navigator.userAgent));
  const createdQuizCount = profile.stats?.createdQuizCount ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div css={wrapperStyle}>
      <h2 css={titleStyle}>계정</h2>

      <section css={cardStyle} aria-label="계정 정보">
        {activity && (
          <div css={rowStyle}>
            <div css={rowMainStyle}>
              <span css={rowLabelStyle}>활동</span>
              <span css={rowValueStyle}>
                활동한지 <span css={rowAccentStyle}>{activity.days}일</span>째
              </span>
              <span css={rowSubtextStyle}>가입일 {activity.joinedDate}</span>
            </div>
          </div>
        )}

        <div css={rowStyle}>
          <div css={rowMainStyle}>
            <span css={rowLabelStyle}>이메일</span>
            <span css={[rowValueStyle, valueWithBadgeStyle]}>
              {profile.email}
              {!isLocalProvider && providerLabel && (
                <span css={providerBadgeStyle}>{providerLabel}</span>
              )}
            </span>
            <span css={rowSubtextStyle}>
              {isLocalProvider
                ? '변경할 수 없어요'
                : `소셜 로그인 계정 (${providerLabel ?? profile.provider})`}
            </span>
          </div>
        </div>

        {isLocalProvider && (
          <div css={rowStyle}>
            <div css={rowMainStyle}>
              <span css={rowLabelStyle}>비밀번호</span>
              <span css={rowValueStyle}>●●●●●●●●●●</span>
            </div>
            <div css={rowActionStyle}>
              <Button variant="secondary" onClick={() => setPasswordModalOpen(true)}>
                비밀번호 변경
              </Button>
            </div>
          </div>
        )}

        <div css={rowStyle}>
          <div css={rowMainStyle}>
            <span css={rowLabelStyle}>현재 세션</span>
            <span css={rowValueStyle}>이 기기에 로그인됨</span>
            {deviceLabel && <span css={rowSubtextStyle}>{deviceLabel}</span>}
          </div>
          <div css={rowActionStyle}>
            <Button variant="ghost" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </section>

      <section css={dangerCardStyle} aria-label="회원 탈퇴">
        <h3 css={dangerTitleStyle}>회원 탈퇴</h3>
        <p css={dangerBodyStyle}>
          탈퇴하면 계정 정보가 삭제되고 다시 로그인할 수 없어요. 내가 만든 퀴즈, 댓글, 플레이 기록
          등은 다른 사용자를 위해 서비스에 남으며, 내 닉네임은 <strong>'탈퇴한 사용자'</strong>로
          표시돼요.
        </p>
        <div css={dangerActionRowStyle}>
          <Button variant="dangerOutline" onClick={() => setWithdrawModalOpen(true)}>
            회원 탈퇴
          </Button>
        </div>
      </section>

      {isLocalProvider && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          userInputs={[profile.email, profile.nickname]}
        />
      )}

      <WithdrawConfirmModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        createdQuizCount={createdQuizCount}
        email={profile.email}
      />
    </div>
  );
});

ProfileAccountView.displayName = 'ProfileAccountView';
