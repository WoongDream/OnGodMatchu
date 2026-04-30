import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import RuleChecklist from './RuleChecklist';
import type { PasswordRuleStatus } from './PasswordInput.type';

const renderChecklist = (ruleStatus: PasswordRuleStatus) =>
  renderWithTheme(<RuleChecklist ruleStatus={ruleStatus} />);

describe('RuleChecklist', () => {
  describe('길이 규칙 항목 (lengthOk)', () => {
    it('lengthOk true → ✓ 아이콘을 렌더한다', () => {
      renderChecklist({ lengthOk: true });
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('lengthOk false → ✗ 아이콘을 렌더한다', () => {
      renderChecklist({ lengthOk: false });
      expect(screen.getByText('✗')).toBeInTheDocument();
    });

    it('길이 규칙 텍스트가 렌더된다', () => {
      renderChecklist({ lengthOk: true });
      expect(screen.getByText(/10자 이상.*64자 이하/)).toBeInTheDocument();
    });
  });
});
