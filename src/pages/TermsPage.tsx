import { memo } from 'react';
import LegalDocument from '@/components/legal';
import { pageWrapperStyle } from '@/styles/layout';
import termsMarkdown from '@/content/legal/terms.md?raw';

const TermsPage = memo(() => {
  return (
    <div css={pageWrapperStyle()}>
      <LegalDocument source={termsMarkdown} />
    </div>
  );
});

TermsPage.displayName = 'TermsPage';
export default TermsPage;
