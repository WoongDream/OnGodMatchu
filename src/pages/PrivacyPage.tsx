import { memo } from 'react';
import LegalDocument from '@/components/legal';
import { PageWrapper } from '@/styles/layout';
import privacyMarkdown from '@/content/legal/privacy.md?raw';

const PrivacyPage = memo(() => {
  return (
    <PageWrapper>
      <LegalDocument source={privacyMarkdown} />
    </PageWrapper>
  );
});

PrivacyPage.displayName = 'PrivacyPage';
export default PrivacyPage;
