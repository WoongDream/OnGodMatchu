import { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useAdminUserDetail from '@/hooks/useAdminUserDetail';
import useAdminUserHistories from '@/hooks/useAdminUserHistories';
import { useToast } from '@/components/toast';
import Button from '@/components/button/Button';
import ProfileImage from '@/components/profile-image/ProfileImage';
import { mapAdminError, updateAdminUser } from '@/api/admin';
import type { AdminUserUpdatePayload } from '@/api/admin';
import type { NotificationDraft, Role } from '@/types';
import RoleBadge from '@/features/admin/users/RoleBadge';
import NotificationComposeModal from '@/features/admin/users/NotificationComposeModal';
import type { ComposeChangeItem } from '@/features/admin/users/NotificationComposeModal';
import * as s from './BoUserEditPage.style';

const ROLES: Role[] = ['USER', 'ADMIN', 'OWNER'];

const defaultSuspendDate = (): string =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const BoUserEditPage = memo(() => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const actorRole = useAuthStore((st) => st.user?.role ?? 'USER');
  const myUserId = useAuthStore((st) => st.user?.userId);

  const { user, isLoading, refresh } = useAdminUserDetail(publicId);
  const histories = useAdminUserHistories(publicId);

  const [role, setRole] = useState<Role>('USER');
  const [suspended, setSuspended] = useState(false);
  const [suspendUntil, setSuspendUntil] = useState('');
  const [resetImage, setResetImage] = useState(false);
  const [resetNickname, setResetNickname] = useState(false);
  const [resetBio, setResetBio] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const withdrawn = user?.status === 'WITHDRAWN';
  // OWNER 는 OWNER/ADMIN 임명·해제 가능. 단 본인 역할은 변경 불가.
  const canChangeRole = actorRole === 'OWNER' && !!user && user.userId !== myUserId;

  const syncFromDetail = useMemo(
    () => () => {
      if (!user) {
        return;
      }
      setRole(user.role);
      setSuspended(user.status === 'SUSPENDED');
      setSuspendUntil(
        user.suspendedUntil ? user.suspendedUntil.slice(0, 10) : defaultSuspendDate(),
      );
      setResetImage(false);
      setResetNickname(false);
      setResetBio(false);
    },
    [user],
  );

  useEffect(() => {
    syncFromDetail();
  }, [syncFromDetail]);

  const roleChanged = !!user && role !== user.role;
  const wasSuspended = user?.status === 'SUSPENDED';
  const statusChanged =
    !!user &&
    (suspended !== wasSuspended ||
      (suspended && wasSuspended && user.suspendedUntil?.slice(0, 10) !== suspendUntil));
  const dirty = roleChanged || statusChanged || resetImage || resetNickname || resetBio;

  const changeSummary = useMemo<ComposeChangeItem[]>(() => {
    if (!user) {
      return [];
    }
    const items: ComposeChangeItem[] = [];
    if (roleChanged) {
      items.push({ label: '역할', value: `${user.role} → ${role}` });
    }
    if (statusChanged) {
      items.push(
        suspended
          ? { label: '계정 상태', value: `정지 (~${suspendUntil})`, emphasize: true }
          : { label: '계정 상태', value: '정상' },
      );
    }
    if (resetImage) {
      items.push({ label: '프로필 이미지', value: '기본 이미지로 초기화' });
    }
    if (resetNickname) {
      items.push({ label: '닉네임', value: '기본 닉네임으로 초기화' });
    }
    if (resetBio) {
      items.push({ label: '자기소개', value: '초기화' });
    }
    return items;
  }, [
    user,
    role,
    roleChanged,
    statusChanged,
    suspended,
    suspendUntil,
    resetImage,
    resetNickname,
    resetBio,
  ]);

  const buildPayload = (notification?: NotificationDraft): AdminUserUpdatePayload => ({
    role: roleChanged ? role : undefined,
    suspension: statusChanged
      ? suspended
        ? { suspend: true, until: `${suspendUntil}T23:59:59+09:00` }
        : { suspend: false }
      : undefined,
    resetProfileImage: resetImage || undefined,
    resetNickname: resetNickname || undefined,
    resetBio: resetBio || undefined,
    notification,
  });

  const doSave = async (notification?: NotificationDraft) => {
    if (!publicId) {
      return;
    }
    setIsSaving(true);
    try {
      await updateAdminUser(publicId, buildPayload(notification));
      toast.success('변경사항을 저장했어요.');
      setComposeOpen(false);
      await refresh();
      histories.refresh();
    } catch (e) {
      const code = mapAdminError(e);
      toast.error(
        code === 'FORBIDDEN'
          ? '권한이 없어요.'
          : code === 'TARGET_INVALID'
            ? '대상이 올바르지 않아요.'
            : '저장에 실패했어요.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return <p css={s.loadingStyle}>{isLoading ? '불러오는 중...' : '유저를 찾을 수 없어요.'}</p>;
  }

  return (
    <div css={s.pageStyle}>
      <h1 css={s.titleStyle}>유저 수정</h1>
      <p css={s.subtitleStyle}>선택한 유저의 프로필 정보와 역할·계정 상태를 수정해요.</p>

      <div css={s.gridStyle}>
        {/* 좌측 프로필 */}
        <section css={s.cardStyle}>
          <div css={s.rowBoxStyle}>
            <div css={s.profileRowStyle}>
              <ProfileImage nickname={user.nickname} imageUrl={user.profileImageUrl} size="lg" />
              <span css={s.mutedStyle}>
                {resetImage ? '저장 시 기본 이미지로 변경' : '현재 이미지'}
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => setResetImage(true)}
              disabled={withdrawn || resetImage}
            >
              기본 이미지로 돌리기
            </Button>
          </div>

          <div css={s.rowBoxStyle}>
            <div>
              <p css={s.fieldLabelStyle}>닉네임</p>
              <p css={s.fieldValueStyle}>
                {resetNickname ? '저장 시 새 닉네임 생성' : user.nickname}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setResetNickname(true)}
              disabled={withdrawn || resetNickname}
            >
              기본 닉네임으로 돌리기
            </Button>
          </div>

          <div css={s.rowBoxStyle}>
            <div>
              <p css={s.fieldLabelStyle}>한 줄 소개</p>
              <p css={s.fieldValueStyle}>{resetBio ? '저장 시 초기화' : user.bio || '(없음)'}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setResetBio(true)}
              disabled={withdrawn || resetBio || !user.bio}
            >
              초기화
            </Button>
          </div>

          <div css={s.metaRowStyle}>
            <p css={s.fieldLabelStyle}>이메일</p>
            <p css={s.fieldValueStyle}>{user.email}</p>
          </div>
          <div css={s.metaRowStyle}>
            <p css={s.fieldLabelStyle}>가입일</p>
            <p css={s.fieldValueStyle}>{user.createdAt.slice(0, 10)}</p>
          </div>

          <div css={s.statsRowStyle}>
            <div css={s.statBlockStyle}>
              <span css={s.statValueStyle}>{user.solvedCount.toLocaleString()}</span>
              <span css={s.statLabelStyle}>풀어봄</span>
            </div>
            <div css={s.statBlockStyle}>
              <span css={s.statValueStyle}>
                {user.avgSolveRate == null ? '—' : `${Math.round(user.avgSolveRate)}%`}
              </span>
              <span css={s.statLabelStyle}>정답률</span>
            </div>
          </div>
          <div css={s.statsRowStyle}>
            <div css={s.statBlockStyle}>
              <span css={s.statValueStyle}>{user.quizCount.toLocaleString()}</span>
              <span css={s.statLabelStyle}>만든 퀴즈</span>
            </div>
            <div css={s.statBlockStyle}>
              <span css={s.statValueStyle}>{user.totalPlayCount.toLocaleString()}</span>
              <span css={s.statLabelStyle}>총 플레이</span>
            </div>
            <div css={s.statBlockStyle}>
              <span css={s.statValueStyle}>{user.totalStarCount.toLocaleString()}</span>
              <span css={s.statLabelStyle}>받은 스타</span>
            </div>
          </div>
        </section>

        {/* 우측 역할·상태 */}
        <aside css={s.cardStyle}>
          <p css={s.panelTitleStyle}>역할 · 상태</p>

          <p css={s.fieldLabelStyle}>
            역할 {actorRole !== 'OWNER' ? <span css={s.hintStyle}>OWNER만 변경 가능</span> : null}
          </p>
          <div css={s.toggleRowStyle}>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                css={(theme) => s.toggleButtonStyle(theme, role === r)}
                onClick={() => setRole(r)}
                disabled={!canChangeRole || withdrawn}
              >
                {r}
              </button>
            ))}
          </div>

          <p css={s.fieldLabelStyle}>상태</p>
          <div css={s.toggleRowStyle}>
            <button
              type="button"
              css={(theme) => s.toggleButtonStyle(theme, !suspended)}
              onClick={() => setSuspended(false)}
              disabled={withdrawn}
            >
              정상
            </button>
            <button
              type="button"
              css={(theme) => s.toggleDangerStyle(theme, suspended)}
              onClick={() => setSuspended(true)}
              disabled={withdrawn}
            >
              정지
            </button>
          </div>

          {suspended ? (
            <div css={s.suspendBoxStyle}>
              <p css={s.suspendLabelStyle}>정지 종료일</p>
              <input
                css={s.dateInputStyle}
                type="date"
                value={suspendUntil}
                onChange={(e) => setSuspendUntil(e.target.value)}
                disabled={withdrawn}
              />
              <p css={s.hintStyle}>일자를 수정하거나, 위에서 '정상'을 선택해 정지를 해제해요.</p>
            </div>
          ) : null}

          {withdrawn ? <p css={s.hintStyle}>탈퇴한 유저는 수정할 수 없어요.</p> : null}
        </aside>
      </div>

      {/* 저장 바 */}
      <div css={s.saveBarStyle}>
        <span css={s.mutedStyle}>변경한 내용을 저장하면 알림 작성 화면이 열려요.</span>
        <div css={s.saveActionsStyle}>
          <Button variant="secondary" onClick={() => navigate('/admin/users')}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={() => setComposeOpen(true)}
            disabled={!dirty || withdrawn || isSaving}
          >
            변경사항 저장
          </Button>
        </div>
      </div>

      {/* 수정 내역 */}
      <section css={s.historySectionStyle}>
        <div css={s.historyHeaderStyle}>
          <h2 css={s.historyTitleStyle}>수정 내역</h2>
          <span css={s.mutedStyle}>총 {histories.totalElements.toLocaleString()}건</span>
        </div>
        {histories.items.length === 0 ? (
          <p css={s.mutedStyle}>아직 수정 내역이 없어요.</p>
        ) : (
          histories.items.map((h) => (
            <div key={h.id} css={s.historyItemStyle}>
              <div css={s.historyActorStyle}>
                <ProfileImage nickname={h.actorNickname} size="sm" />
                <span css={s.historyActorNameStyle}>{h.actorNickname}</span>
                <RoleBadge role={h.actorRole} />
                <span css={s.historyDateStyle}>{h.createdAt.slice(0, 16).replace('T', ' ')}</span>
              </div>
              {h.changeType ? (
                <div css={s.historyChangeStyle}>
                  <p css={s.historyChangeLabelStyle}>수정 내용</p>
                  <p css={s.historyChangeTitleStyle}>{h.changeTypeLabel}</p>
                  {h.detail ? <p css={s.historyChangeDetailStyle}>{h.detail}</p> : null}
                </div>
              ) : null}
              <div css={(theme) => s.historyNotiStyle(theme, h.notification?.type)}>
                {h.notification ? (
                  <>
                    <p css={s.historyNotiHeadStyle}>관련 알림 · {h.notification.typeLabel}</p>
                    <p css={s.historyNotiTitleStyle}>{h.notification.title}</p>
                    <p css={s.historyNotiContentStyle}>{h.notification.content}</p>
                  </>
                ) : (
                  <p css={s.historyChangeLabelStyle}>관련 알림 · 발송된 알림 없음</p>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {composeOpen ? (
        <NotificationComposeModal
          isOpen
          onClose={() => setComposeOpen(false)}
          recipient={{ nickname: user.nickname, email: user.email }}
          changeSummary={changeSummary}
          isSubmitting={isSaving}
          onSend={(draft) => doSave(draft)}
          onSaveWithoutNotification={() => doSave(undefined)}
        />
      ) : null}
    </div>
  );
});

BoUserEditPage.displayName = 'BoUserEditPage';
export default BoUserEditPage;
