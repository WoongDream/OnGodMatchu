export type TermsAgreementState = {
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToMarketing: boolean;
};

export type TermsAgreementCheckboxesProps = {
  value: TermsAgreementState;
  onChange: (next: TermsAgreementState) => void;
  disabled?: boolean;
};
