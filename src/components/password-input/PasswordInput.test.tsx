import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, fireEvent } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import PasswordInput from './PasswordInput';
import type { PasswordRuleStatus, PasswordStrength } from './PasswordInput.type';

// zxcvbn 을 mock 하여 테스트를 결정론적으로 만든다
vi.mock('zxcvbn', () => ({
  default: (password: string, userInputs?: string[]) => {
    // userInputs 에 password 가 포함되면 score 0 (페널티)
    const isBreached = userInputs?.includes(password) ?? false;
    const score = isBreached ? 0 : password.length >= 10 ? 3 : 0;
    return {
      score,
      crack_times_display: {
        offline_slow_hashing_1e4_per_second: '3 hours',
      },
      feedback: {
        warning: score === 0 ? 'This is a top-10 common password' : '',
        suggestions: score === 0 ? ['Add more words'] : [],
      },
    };
  },
}));

const defaultRuleStatus: PasswordRuleStatus = {
  lengthOk: false,
  notBreached: null,
};

const renderPasswordInput = (
  props: Partial<Parameters<typeof PasswordInput>[0]> & {
    value?: string;
    onChange?: (v: string) => void;
  } = {},
) => {
  const onChange = props.onChange ?? vi.fn();
  return renderWithTheme(
    <PasswordInput
      value={props.value ?? ''}
      onChange={onChange}
      ruleStatus={props.ruleStatus ?? defaultRuleStatus}
      label={props.label ?? '비밀번호'}
      {...props}
    />,
  );
};

describe('PasswordInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더', () => {
    it('label prop 이 있으면 label 이 렌더된다', () => {
      renderPasswordInput({ label: '비밀번호' });
      expect(screen.getByText('비밀번호')).toBeInTheDocument();
    });

    it('label htmlFor 과 input id 가 연결된다', () => {
      renderPasswordInput({ label: '비밀번호' });
      const input = screen.getByLabelText('비밀번호');
      expect(input).toBeInTheDocument();
    });

    it('초기 type 은 "password" 다', () => {
      renderPasswordInput();
      const input = screen.getByLabelText('비밀번호') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('autocomplete 는 "new-password" 다', () => {
      renderPasswordInput();
      const input = screen.getByLabelText('비밀번호') as HTMLInputElement;
      expect(input).toHaveAttribute('autocomplete', 'new-password');
    });

    it('maxLength 는 64 다', () => {
      renderPasswordInput();
      const input = screen.getByLabelText('비밀번호') as HTMLInputElement;
      expect(input).toHaveAttribute('maxlength', '64');
    });
  });

  describe('onChange 호출', () => {
    it('값 입력 시 onChange 가 호출된다', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderPasswordInput({ onChange });

      await user.type(screen.getByLabelText('비밀번호'), 'a');

      expect(onChange).toHaveBeenCalled();
    });

    it('onChange 는 입력된 문자열 값을 인수로 받는다', () => {
      const onChange = vi.fn();
      renderPasswordInput({ onChange });

      fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'hello' } });

      expect(onChange).toHaveBeenCalledWith('hello');
    });
  });

  describe('보기 토글 버튼', () => {
    it('초기 aria-pressed 는 false 다', () => {
      renderPasswordInput();
      const toggle = screen.getByRole('button', { name: '비밀번호 표시' });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('토글 클릭 시 aria-pressed 가 true 로 바뀐다', async () => {
      const user = userEvent.setup();
      renderPasswordInput();

      await user.click(screen.getByRole('button', { name: '비밀번호 표시' }));

      expect(screen.getByRole('button', { name: '비밀번호 숨기기' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('토글 클릭 시 input type 이 password → text 로 바뀐다', async () => {
      const user = userEvent.setup();
      renderPasswordInput();
      const input = screen.getByLabelText('비밀번호') as HTMLInputElement;

      await user.click(screen.getByRole('button', { name: '비밀번호 표시' }));

      expect(input.type).toBe('text');
    });

    it('두 번 클릭 시 다시 password 로 돌아온다', async () => {
      const user = userEvent.setup();
      renderPasswordInput();
      const input = screen.getByLabelText('비밀번호') as HTMLInputElement;

      await user.click(screen.getByRole('button', { name: '비밀번호 표시' }));
      await user.click(screen.getByRole('button', { name: '비밀번호 숨기기' }));

      expect(input.type).toBe('password');
    });
  });

  describe('error prop', () => {
    it('error prop 이 있으면 에러 메시지가 렌더된다', () => {
      renderPasswordInput({ error: '유출된 비밀번호입니다.' });
      expect(screen.getByText('유출된 비밀번호입니다.')).toBeInTheDocument();
    });

    it('error prop 이 없으면 에러 메시지가 렌더되지 않는다', () => {
      renderPasswordInput({ error: undefined });
      expect(screen.queryByText('유출된 비밀번호입니다.')).not.toBeInTheDocument();
    });
  });

  describe('StrengthMeter 조건부 렌더', () => {
    it('value 가 비어있으면 StrengthMeter 가 렌더되지 않는다', () => {
      renderPasswordInput({ value: '' });
      // progressbar role 로 StrengthMeter 유무 판별
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('value 가 있으면 StrengthMeter 가 렌더된다', () => {
      renderPasswordInput({ value: 'somevalue' });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('showStrengthMeter=false 이면 value 가 있어도 렌더되지 않는다', () => {
      renderPasswordInput({ value: 'somevalue', showStrengthMeter: false });
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('ruleStatus 반영', () => {
    it('ruleStatus.lengthOk true → ✓ 아이콘이 보인다', () => {
      renderPasswordInput({ ruleStatus: { lengthOk: true, notBreached: null } });
      expect(screen.getAllByText('✓').length).toBeGreaterThanOrEqual(1);
    });

    it('ruleStatus.lengthOk false → ✗ 아이콘이 보인다', () => {
      renderPasswordInput({ ruleStatus: { lengthOk: false, notBreached: null } });
      expect(screen.getAllByText('✗').length).toBeGreaterThanOrEqual(1);
    });

    it('ruleStatus.notBreached false → 유출 항목이 ✗ 아이콘으로 표시된다', () => {
      renderPasswordInput({ ruleStatus: { lengthOk: true, notBreached: false } });
      // lengthOk=true(✓), notBreached=false(✗) 이므로 ✗ 가 1개 있어야 함
      expect(screen.getAllByText('✗')).toHaveLength(1);
    });

    it('ruleStatus.notBreached null → • (pending) 아이콘이 보인다', () => {
      renderPasswordInput({ ruleStatus: { lengthOk: true, notBreached: null } });
      expect(screen.getAllByText('•').length).toBeGreaterThanOrEqual(1);
    });

    it('showChecklist=false 이면 체크리스트가 렌더되지 않는다', () => {
      renderPasswordInput({ showChecklist: false });
      // RuleChecklist 의 "10자 이상 64자 이하" 항목이 없어야 함
      // HintList 에는 "10자 이상의 길이가..." 가 있으므로 규칙 항목 텍스트로 정확히 매칭
      expect(screen.queryByText(/10자 이상 64자 이하/)).not.toBeInTheDocument();
    });
  });

  describe('disabled prop', () => {
    it('disabled=true 이면 input 이 비활성화된다', () => {
      renderPasswordInput({ disabled: true });
      expect(screen.getByLabelText('비밀번호')).toBeDisabled();
    });

    it('disabled=true 이면 토글 버튼도 비활성화된다', () => {
      renderPasswordInput({ disabled: true });
      const toggle = screen.getByRole('button');
      expect(toggle).toBeDisabled();
    });
  });

  describe('onStrengthChange 콜백', () => {
    it('value 가 변경되면 onStrengthChange 가 호출된다', () => {
      const onStrengthChange = vi.fn();
      // value 를 바꿔서 재렌더링
      const { rerender } = renderPasswordInput({ value: '', onStrengthChange });

      rerender(
        <PasswordInput
          value="newvalue123"
          onChange={vi.fn()}
          ruleStatus={defaultRuleStatus}
          label="비밀번호"
          onStrengthChange={onStrengthChange}
        />,
      );

      expect(onStrengthChange).toHaveBeenCalled();
    });

    it('onStrengthChange 는 PasswordStrength 형태의 객체를 인수로 받는다', () => {
      const onStrengthChange = vi.fn<[PasswordStrength], void>();
      renderPasswordInput({ value: 'somepassword', onStrengthChange });

      expect(onStrengthChange).toHaveBeenCalledWith(
        expect.objectContaining({
          score: expect.any(Number),
          crackTimesDisplay: expect.any(String),
          feedbackWarning: expect.any(String),
          feedbackSuggestions: expect.any(Array),
        }),
      );
    });
  });

  describe('placeholder', () => {
    it('placeholder prop 이 input 에 적용된다', () => {
      renderPasswordInput({ placeholder: '비밀번호 입력' });
      expect(screen.getByPlaceholderText('비밀번호 입력')).toBeInTheDocument();
    });
  });
});
