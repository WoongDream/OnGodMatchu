import { css, keyframes, type Theme } from '@emotion/react';
import { HEADER_HEIGHT, Z_INDEX } from '@/styles/constants';

export const wrapperStyle = (theme: Theme) => css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT};
  background-color: ${theme.colors.bg.primary};
  border-bottom: 1px solid ${theme.colors.border.primary};
  z-index: ${Z_INDEX.LOW};
`;

export const innerStyle = (theme: Theme) => css`
  position: relative;
  width: 100%;
  max-width: ${theme.breakpoints.desktop};
  height: 100%;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  display: flex;
  align-items: stretch;
  justify-content: space-between;

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 0 ${theme.spacing.xl};
  }
`;

export const leftSlotStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.tablet}) {
    gap: ${theme.spacing.md};
  }
`;

export const logoStyle = css`
  display: block;
  height: 2rem;
  width: auto;
  cursor: pointer;
  flex-shrink: 0;
`;

export const tabsStyle = (theme: Theme) => css`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.lg};
`;

export const tabStyle = (theme: Theme) => css`
  position: relative;
  display: inline-flex;
  align-items: flex-end;
  height: 100%;
  padding: 0 ${theme.spacing.xs} 6px;
  color: ${theme.colors.fg.secondary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  text-decoration: none;
  transition:
    color 0.15s ease,
    font-weight 0.15s ease;

  &:hover {
    color: ${theme.colors.fg.primary};
  }

  &.active {
    color: ${theme.colors.accent.primary};
    font-weight: ${theme.fontWeight.bold};
  }

  &.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background-color: ${theme.colors.accent.primary};
    border-radius: 1px;
  }

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize.md};
  }
`;

export const navActionsStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const loginPillStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  padding: 0 ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.accent.primary};
  color: #ffffff;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${theme.colors.accent.active};
  }
`;

export const profileButtonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const authPlaceholderPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// 인증 복원(bootstrapping) 중 노출되는 스켈레톤 원. 프로필 sm 아바타(2rem)와 동일 크기라
// 복원 완료 후 아바타로 전환돼도 레이아웃 시프트가 없다.
export const authPlaceholderStyle = (theme: Theme) => css`
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: ${theme.colors.border.primary};
  animation: ${authPlaceholderPulse} 1.2s ease-in-out infinite;
`;

/** 정지된 ADMIN 의 BO 탭 — 보이되 비활성. */
export const disabledTabStyle = css`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`;
