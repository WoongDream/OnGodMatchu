import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import TermsAgreementCheckboxes from './TermsAgreementCheckboxes';
import type { TermsAgreementState } from './TermsAgreementCheckboxes.type';

const meta: Meta<typeof TermsAgreementCheckboxes> = {
  title: 'Components/TermsAgreementCheckboxes',
  component: TermsAgreementCheckboxes,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TermsAgreementCheckboxes>;

const Demo = ({ initial }: { initial: TermsAgreementState }) => {
  const [value, setValue] = useState(initial);
  return <TermsAgreementCheckboxes value={value} onChange={setValue} />;
};

export const AllUnchecked: Story = {
  render: () => <Demo initial={{ agreedToTerms: false, agreedToPrivacy: false }} />,
};

export const AllChecked: Story = {
  render: () => <Demo initial={{ agreedToTerms: true, agreedToPrivacy: true }} />,
};

export const Disabled: Story = {
  render: () => (
    <div>
      <TermsAgreementCheckboxes
        value={{ agreedToTerms: true, agreedToPrivacy: true }}
        onChange={() => {}}
        disabled
      />
    </div>
  ),
};
