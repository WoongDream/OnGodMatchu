import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TermsAgreementGate from './TermsAgreementGate';

const meta: Meta<typeof TermsAgreementGate> = {
  title: 'Components/TermsAgreementGate',
  component: TermsAgreementGate,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '레이아웃 라우트 컴포넌트. user.needsTermsAgreement === true 이고 현재 경로가 화이트리스트(/terms-agreement, /terms, /privacy)가 아니면 /terms-agreement 로 리다이렉트한다. 그 외에는 자식 라우트(Outlet)를 그대로 렌더한다.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TermsAgreementGate>;

const HomeSentinel = () => <div data-testid="home">홈 페이지 (게이트 통과)</div>;
const TermsSentinel = () => <div data-testid="terms">약관 동의 페이지</div>;

export const PassThrough: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<TermsAgreementGate />}>
          <Route path="/" element={<HomeSentinel />} />
          <Route path="/terms-agreement" element={<TermsSentinel />} />
        </Route>
      </Routes>
    </MemoryRouter>
  ),
};

export const RedirectsWhenNeedsTermsAgreement: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<TermsAgreementGate />}>
          <Route path="/" element={<HomeSentinel />} />
          <Route path="/terms-agreement" element={<TermsSentinel />} />
        </Route>
      </Routes>
    </MemoryRouter>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '실제 동작은 authStore 의 user.needsTermsAgreement 값에 의존한다. 스토리에서 분기를 보여주려면 authStore 를 모킹하거나 mock decorator 를 추가하라.',
      },
    },
  },
};
