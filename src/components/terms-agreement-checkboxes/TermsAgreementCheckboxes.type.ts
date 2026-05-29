export type TermsAgreementState = {
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToAge14: boolean;
};

export type TermsAgreementCheckboxesProps = {
  value: TermsAgreementState;
  onChange: (next: TermsAgreementState) => void;
  disabled?: boolean;
};
