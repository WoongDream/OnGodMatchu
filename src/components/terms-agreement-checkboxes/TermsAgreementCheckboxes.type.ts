export type TermsAgreementState = {
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
};

export type TermsAgreementCheckboxesProps = {
  value: TermsAgreementState;
  onChange: (next: TermsAgreementState) => void;
  disabled?: boolean;
};
