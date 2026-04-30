import { memo } from 'react';
import LegalDocument from '@/components/legal';
import { PageWrapper } from '@/styles/layout';
import termsMarkdown from '@/content/legal/terms.md?raw';

const TermsPage = memo(() => {
  return (
    <PageWrapper>
      <LegalDocument source={termsMarkdown} />
    </PageWrapper>
  );
});

TermsPage.displayName = 'TermsPage';
export default TermsPage;
