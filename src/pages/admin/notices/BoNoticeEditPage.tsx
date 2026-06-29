import { memo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '@/components/input';
import Button from '@/components/button';
import Toggle from '@/components/toggle';
import ConfirmModal from '@/components/confirm-modal';
import { useToast } from '@/components/toast';
import LegalDocument from '@/components/legal/LegalDocument';
import useBoNotice from '@/hooks/useBoNotice';
import { createNotice, updateNotice, deleteNotice, mapAdminError } from '@/api/admin';
import type { AdminErrorCode } from '@/api/admin';
import type { NoticeStatus } from '@/types';
import {
  wrapperStyle,
  headerStyle,
  headerTitleStyle,
  headerSubtitleStyle,
  layoutStyle,
  cardStyle,
  fieldStyle,
  labelRowStyle,
  labelStyle,
  hintStyle,
  textareaStyle,
  panelStyle,
  panelTitleStyle,
  segmentedStyle,
  segmentButtonStyle,
  toggleRowStyle,
  toggleMainStyle,
  toggleLabelStyle,
  toggleDescStyle,
  metaStyle,
  metaItemStyle,
  metaLabelStyle,
  metaValueStyle,
  actionsStyle,
  previewStyle,
  previewTitleStyle,
  previewBodyStyle,
  previewEmptyStyle,
} from './BoNoticeEditPage.style';

const ADMIN_ERROR_MESSAGES: Record<AdminErrorCode, string> = {
  FORBIDDEN: '권한이 없어요.',
  TARGET_INVALID: '대상이 올바르지 않아요.',
  SUSPENDED: '정지된 계정이에요.',
  NOT_FOUND: '공지를 찾을 수 없어요.',
  UNKNOWN: '잠시 후 다시 시도해 주세요.',
};

const BoNoticeEditPage = memo(() => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const numericId = id != null && /^\d+$/.test(id) ? Number(id) : undefined;
  const isEdit = numericId != null;

  const { notice, isLoading } = useBoNotice(numericId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<NoticeStatus>('PUBLISHED');
  const [pinned, setPinned] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
      setStatus(notice.status);
      setPinned(notice.pinned);
    }
  }, [notice]);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isSaving;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setSaving(true);
    const payload = { title: title.trim(), content: content.trim(), status, pinned };
    try {
      if (isEdit) {
        await updateNotice(numericId, payload);
        toast.success('공지를 저장했어요.');
      } else {
        await createNotice(payload);
        toast.success('공지를 등록했어요.');
      }
      navigate('/admin/notices');
      return;
    } catch (error) {
      toast.error(ADMIN_ERROR_MESSAGES[mapAdminError(error)]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) {
      return;
    }
    setDeleting(true);
    try {
      await deleteNotice(numericId);
      navigate('/admin/notices');
    } catch (error) {
      toast.error(ADMIN_ERROR_MESSAGES[mapAdminError(error)]);
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div css={wrapperStyle}>
      <header css={headerStyle}>
        <h1 css={headerTitleStyle}>{isEdit ? '공지 수정' : '새 공지'}</h1>
        <p css={headerSubtitleStyle}>
          {isEdit
            ? '선택한 공지의 내용과 노출 설정을 수정해요.'
            : '새 공지를 작성하고 게시 상태를 설정해요.'}
        </p>
      </header>

      <div css={layoutStyle}>
        <section css={cardStyle} aria-label="공지 내용">
          <Input label="제목" value={title} onChange={setTitle} placeholder="공지 제목" />

          <div css={fieldStyle}>
            <div css={labelRowStyle}>
              <label css={labelStyle} htmlFor="notice-content">
                내용
              </label>
              <span css={hintStyle}>마크다운 지원</span>
            </div>
            <textarea
              id="notice-content"
              css={textareaStyle}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지 내용을 작성해 주세요."
            />
          </div>
        </section>

        <aside css={panelStyle} aria-label="게시 설정">
          <h2 css={panelTitleStyle}>게시 설정</h2>

          <div css={fieldStyle}>
            <span css={labelStyle}>상태</span>
            <div css={segmentedStyle} role="group" aria-label="게시 상태">
              <button
                type="button"
                css={(theme) => segmentButtonStyle(theme, status === 'PUBLISHED')}
                aria-pressed={status === 'PUBLISHED'}
                onClick={() => setStatus('PUBLISHED')}
              >
                게시
              </button>
              <button
                type="button"
                css={(theme) => segmentButtonStyle(theme, status === 'DRAFT')}
                aria-pressed={status === 'DRAFT'}
                onClick={() => setStatus('DRAFT')}
              >
                임시저장
              </button>
            </div>
          </div>

          <div css={toggleRowStyle}>
            <div css={toggleMainStyle}>
              <span css={toggleLabelStyle}>상단 고정</span>
              <span css={toggleDescStyle}>목록 최상단에 노출</span>
            </div>
            <Toggle checked={pinned} onChange={setPinned} ariaLabel="상단 고정" />
          </div>

          {isEdit && notice && (
            <div css={metaStyle}>
              <div css={metaItemStyle}>
                <span css={metaLabelStyle}>작성일(변경일)</span>
                <span css={metaValueStyle}>
                  {(notice.updatedAt ?? notice.createdAt).slice(0, 10)}
                </span>
              </div>
              <div css={metaItemStyle}>
                <span css={metaLabelStyle}>조회수</span>
                <span css={metaValueStyle}>{notice.viewCount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div css={actionsStyle}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit || (isEdit && isLoading)}
            >
              {isEdit ? '변경사항 저장' : '공지 작성'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/notices')}>
              취소
            </Button>
            {isEdit && (
              <Button
                variant="dangerOutline"
                onClick={() => setDeleteOpen(true)}
                disabled={isDeleting}
              >
                공지 삭제
              </Button>
            )}
          </div>
        </aside>
      </div>

      <section css={previewStyle} aria-label="미리보기">
        <h2 css={panelTitleStyle}>미리보기</h2>
        {content.trim() ? (
          <article css={previewBodyStyle}>
            {title.trim() && <h3 css={previewTitleStyle}>{title}</h3>}
            <LegalDocument source={content} />
          </article>
        ) : (
          <p css={previewEmptyStyle}>내용을 입력하면 공지가 어떻게 보일지 미리 확인할 수 있어요.</p>
        )}
      </section>

      {isEdit && (
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title="공지를 삭제할까요?"
          message="삭제한 공지는 되돌릴 수 없어요."
          confirmLabel="삭제"
          confirmVariant="danger"
          isConfirming={isDeleting}
          confirmingLabel="삭제 중…"
        />
      )}
    </div>
  );
});

BoNoticeEditPage.displayName = 'BoNoticeEditPage';
export default BoNoticeEditPage;
