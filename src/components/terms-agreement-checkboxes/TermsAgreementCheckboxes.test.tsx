import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { renderWithTheme } from '@/test/renderWithTheme';
import TermsAgreementCheckboxes from './TermsAgreementCheckboxes';
import type { TermsAgreementState } from './TermsAgreementCheckboxes.type';

vi.mock('react-router-dom', () => ({
  Link: ({ to, target, children }: { to: string; target?: string; children: React.ReactNode }) =>
    React.createElement('a', { href: to, target }, children),
}));

const allFalse: TermsAgreementState = {
  agreedToTerms: false,
  agreedToPrivacy: false,
};

const allTrue: TermsAgreementState = {
  agreedToTerms: true,
  agreedToPrivacy: true,
};

const render = (value: TermsAgreementState, onChange = vi.fn(), disabled?: boolean) =>
  renderWithTheme(
    <TermsAgreementCheckboxes value={value} onChange={onChange} disabled={disabled} />,
  );

describe('TermsAgreementCheckboxes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('displayName', () => {
    it('displayName 이 "TermsAgreementCheckboxes" 이다', () => {
      expect(TermsAgreementCheckboxes.displayName).toBe('TermsAgreementCheckboxes');
    });
  });

  describe('초기 렌더 — 모두 false', () => {
    it('체크박스 3개가 렌더된다 (전체 + 필수 2)', () => {
      render(allFalse);
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });

    it('전체 동의 체크박스가 미체크 상태다', () => {
      render(allFalse);
      expect(screen.getByRole('checkbox', { name: '전체 동의' })).not.toBeChecked();
    });

    it('이용약관 동의 체크박스가 미체크 상태다', () => {
      render(allFalse);
      expect(screen.getByRole('checkbox', { name: '이용약관 동의 (필수)' })).not.toBeChecked();
    });

    it('개인정보처리방침 동의 체크박스가 미체크 상태다', () => {
      render(allFalse);
      expect(
        screen.getByRole('checkbox', { name: '개인정보처리방침 동의 (필수)' }),
      ).not.toBeChecked();
    });

    it('마케팅 수신 동의 체크박스가 렌더되지 않는다', () => {
      render(allFalse);
      expect(screen.queryByRole('checkbox', { name: /마케팅 수신 동의/ })).not.toBeInTheDocument();
    });
  });

  describe('초기 렌더 — 모두 true', () => {
    it('전체 동의 체크박스가 체크 상태다', () => {
      render(allTrue);
      expect(screen.getByRole('checkbox', { name: '전체 동의' })).toBeChecked();
    });

    it('이용약관 동의 체크박스가 체크 상태다', () => {
      render(allTrue);
      expect(screen.getByRole('checkbox', { name: '이용약관 동의 (필수)' })).toBeChecked();
    });

    it('개인정보처리방침 동의 체크박스가 체크 상태다', () => {
      render(allTrue);
      expect(screen.getByRole('checkbox', { name: '개인정보처리방침 동의 (필수)' })).toBeChecked();
    });
  });

  describe('개별 체크박스 토글', () => {
    it('이용약관 체크박스 클릭 시 agreedToTerms=true 로 onChange 호출된다', () => {
      const onChange = vi.fn();
      render(allFalse, onChange);
      fireEvent.click(screen.getByRole('checkbox', { name: '이용약관 동의 (필수)' }));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith({
        agreedToTerms: true,
        agreedToPrivacy: false,
      });
    });

    it('개인정보처리방침 체크박스 클릭 시 agreedToPrivacy=true 로 onChange 호출된다', () => {
      const onChange = vi.fn();
      render(allFalse, onChange);
      fireEvent.click(screen.getByRole('checkbox', { name: '개인정보처리방침 동의 (필수)' }));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith({
        agreedToTerms: false,
        agreedToPrivacy: true,
      });
    });

    it('체크된 이용약관 체크박스 클릭 시 agreedToTerms=false 로 onChange 호출된다', () => {
      const onChange = vi.fn();
      render(allTrue, onChange);
      fireEvent.click(screen.getByRole('checkbox', { name: '이용약관 동의 (필수)' }));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith({
        agreedToTerms: false,
        agreedToPrivacy: true,
      });
    });
  });

  describe('전체 동의 체크박스', () => {
    it('전체 동의 클릭 시 onChange({필수 2 true}) 가 호출된다', () => {
      const onChange = vi.fn();
      render(allFalse, onChange);
      fireEvent.click(screen.getByRole('checkbox', { name: '전체 동의' }));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith({
        agreedToTerms: true,
        agreedToPrivacy: true,
      });
    });

    it('모두 true 상태에서 전체 동의 클릭 시 onChange({필수 2 false}) 가 호출된다', () => {
      const onChange = vi.fn();
      render(allTrue, onChange);
      fireEvent.click(screen.getByRole('checkbox', { name: '전체 동의' }));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith({
        agreedToTerms: false,
        agreedToPrivacy: false,
      });
    });
  });

  describe('약관 보기 링크', () => {
    it('이용약관 "보기" 링크가 /terms 로 연결된다', () => {
      render(allFalse);
      const links = screen.getAllByRole('link', { name: '보기' });
      const termsLink = links.find((l) => l.getAttribute('href') === '/terms');
      expect(termsLink).toBeDefined();
    });

    it('이용약관 "보기" 링크가 target="_blank" 를 가진다', () => {
      render(allFalse);
      const links = screen.getAllByRole('link', { name: '보기' });
      const termsLink = links.find((l) => l.getAttribute('href') === '/terms');
      expect(termsLink).toHaveAttribute('target', '_blank');
    });

    it('개인정보처리방침 "보기" 링크가 /privacy 로 연결된다', () => {
      render(allFalse);
      const links = screen.getAllByRole('link', { name: '보기' });
      const privacyLink = links.find((l) => l.getAttribute('href') === '/privacy');
      expect(privacyLink).toBeDefined();
    });

    it('개인정보처리방침 "보기" 링크가 target="_blank" 를 가진다', () => {
      render(allFalse);
      const links = screen.getAllByRole('link', { name: '보기' });
      const privacyLink = links.find((l) => l.getAttribute('href') === '/privacy');
      expect(privacyLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('disabled prop', () => {
    it('disabled=true 이면 전체 동의 체크박스가 disabled 다', () => {
      render(allFalse, vi.fn(), true);
      expect(screen.getByRole('checkbox', { name: '전체 동의' })).toBeDisabled();
    });

    it('disabled=true 이면 이용약관 동의 체크박스가 disabled 다', () => {
      render(allFalse, vi.fn(), true);
      expect(screen.getByRole('checkbox', { name: '이용약관 동의 (필수)' })).toBeDisabled();
    });

    it('disabled=true 이면 개인정보처리방침 동의 체크박스가 disabled 다', () => {
      render(allFalse, vi.fn(), true);
      expect(screen.getByRole('checkbox', { name: '개인정보처리방침 동의 (필수)' })).toBeDisabled();
    });

    it('disabled 미전달 시 체크박스들이 disabled 가 아니다', () => {
      render(allFalse);
      screen.getAllByRole('checkbox').forEach((cb) => {
        expect(cb).not.toBeDisabled();
      });
    });
  });
});
