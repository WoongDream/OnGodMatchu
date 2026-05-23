import { memo } from 'react';
import { Link } from 'react-router-dom';
import type {
  TermsAgreementCheckboxesProps,
  TermsAgreementState,
} from './TermsAgreementCheckboxes.type';
import {
  wrapperStyle,
  allRowStyle,
  itemRowStyle,
  itemLabelStyle,
  checkboxInputStyle,
  labelTextStyle,
  allLabelTextStyle,
  requiredTagStyle,
  optionalTagStyle,
  linkStyle,
} from './TermsAgreementCheckboxes.style';

const TermsAgreementCheckboxes = memo(
  ({ value, onChange, disabled = false }: TermsAgreementCheckboxesProps) => {
    const allChecked = value.agreedToTerms && value.agreedToPrivacy && value.agreedToMarketing;

    const handleAllToggle = (next: boolean) => {
      const updated: TermsAgreementState = {
        agreedToTerms: next,
        agreedToPrivacy: next,
        agreedToMarketing: next,
      };
      onChange(updated);
    };

    const handleItemToggle = (key: keyof TermsAgreementState, next: boolean) => {
      onChange({ ...value, [key]: next });
    };

    return (
      <div css={wrapperStyle}>
        <label css={allRowStyle}>
          <input
            css={checkboxInputStyle}
            type="checkbox"
            checked={allChecked}
            onChange={(e) => handleAllToggle(e.target.checked)}
            disabled={disabled}
            aria-label="전체 동의"
          />
          <span css={allLabelTextStyle}>전체 동의</span>
        </label>

        <div css={itemRowStyle}>
          <label css={itemLabelStyle}>
            <input
              css={checkboxInputStyle}
              type="checkbox"
              checked={value.agreedToTerms}
              onChange={(e) => handleItemToggle('agreedToTerms', e.target.checked)}
              disabled={disabled}
              aria-label="이용약관 동의 (필수)"
            />
            <span css={labelTextStyle}>
              <span css={requiredTagStyle}>(필수)</span> 이용약관 동의
            </span>
          </label>
          <Link to="/terms" css={linkStyle} target="_blank" rel="noopener noreferrer">
            보기
          </Link>
        </div>

        <div css={itemRowStyle}>
          <label css={itemLabelStyle}>
            <input
              css={checkboxInputStyle}
              type="checkbox"
              checked={value.agreedToPrivacy}
              onChange={(e) => handleItemToggle('agreedToPrivacy', e.target.checked)}
              disabled={disabled}
              aria-label="개인정보처리방침 동의 (필수)"
            />
            <span css={labelTextStyle}>
              <span css={requiredTagStyle}>(필수)</span> 개인정보처리방침 동의
            </span>
          </label>
          <Link to="/privacy" css={linkStyle} target="_blank" rel="noopener noreferrer">
            보기
          </Link>
        </div>

        <div css={itemRowStyle}>
          <label css={itemLabelStyle}>
            <input
              css={checkboxInputStyle}
              type="checkbox"
              checked={value.agreedToMarketing}
              onChange={(e) => handleItemToggle('agreedToMarketing', e.target.checked)}
              disabled={disabled}
              aria-label="마케팅 수신 동의 (선택)"
            />
            <span css={labelTextStyle}>
              <span css={optionalTagStyle}>(선택)</span> 마케팅 수신 동의
            </span>
          </label>
        </div>
      </div>
    );
  },
);

TermsAgreementCheckboxes.displayName = 'TermsAgreementCheckboxes';
export default TermsAgreementCheckboxes;
