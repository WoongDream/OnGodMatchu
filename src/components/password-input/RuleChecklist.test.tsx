import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import RuleChecklist from './RuleChecklist';
import type { PasswordRuleStatus } from './PasswordInput.type';

const renderChecklist = (ruleStatus: PasswordRuleStatus) =>
  renderWithTheme(<RuleChecklist ruleStatus={ruleStatus} />);

describe('RuleChecklist', () => {
  describe('길이 규칙 항목 (lengthOk)', () => {
    it('lengthOk true → ✓ 아이콘을 렌더한다', () => {
      renderChecklist({ lengthOk: true, notBreached: null });
      const icons = screen.getAllByText('✓');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it('lengthOk false → ✗ 아이콘을 렌더한다', () => {
      renderChecklist({ lengthOk: false, notBreached: null });
      const icons = screen.getAllByText('✗');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it('lengthOk true → 길이 규칙 텍스트가 렌더된다', () => {
      renderChecklist({ lengthOk: true, notBreached: null });
      expect(screen.getByText(/10자 이상.*64자 이하/)).toBeInTheDocument();
    });
  });

  describe('유출 규칙 항목 (notBreached)', () => {
    it('notBreached null → • (pending) 아이콘을 렌더한다', () => {
      renderChecklist({ lengthOk: true, notBreached: null });
      // pending 상태 항목이 하나 있어야 함
      const pendingIcons = screen.getAllByText('•');
      expect(pendingIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('notBreached true → ✓ 아이콘을 렌더한다 (두 항목 모두 pass)', () => {
      renderChecklist({ lengthOk: true, notBreached: true });
      const passIcons = screen.getAllByText('✓');
      expect(passIcons).toHaveLength(2);
    });

    it('notBreached false → ✗ 아이콘을 렌더한다', () => {
      renderChecklist({ lengthOk: true, notBreached: false });
      const failIcons = screen.getAllByText('✗');
      expect(failIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('notBreached false → 유출 항목 텍스트가 렌더된다', () => {
      renderChecklist({ lengthOk: false, notBreached: false });
      expect(screen.getByText(/자주 사용되거나 유출된 비밀번호 아님/)).toBeInTheDocument();
    });
  });

  describe('길이 + 유출 조합', () => {
    it('둘 다 false → ✗ 아이콘 2개가 렌더된다', () => {
      renderChecklist({ lengthOk: false, notBreached: false });
      const failIcons = screen.getAllByText('✗');
      expect(failIcons).toHaveLength(2);
    });

    it('lengthOk false, notBreached null → ✗ 1개, • 1개가 렌더된다', () => {
      renderChecklist({ lengthOk: false, notBreached: null });
      expect(screen.getAllByText('✗')).toHaveLength(1);
      expect(screen.getAllByText('•')).toHaveLength(1);
    });
  });

  describe('규칙 텍스트', () => {
    it('두 규칙 텍스트가 모두 렌더된다', () => {
      renderChecklist({ lengthOk: null as unknown as boolean, notBreached: null });
      expect(screen.getByText(/10자 이상.*64자 이하/)).toBeInTheDocument();
      expect(screen.getByText(/자주 사용되거나 유출된 비밀번호 아님/)).toBeInTheDocument();
    });
  });
});
