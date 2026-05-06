import { memo } from 'react';
import LegalDocument from '@/components/legal';
import { pageWrapperStyle } from '@/styles/layout';
import privacyMarkdown from '@/content/legal/privacy.md?raw';

const PrivacyPage = memo(() => {
  return (
    <div css={pageWrapperStyle()}>
      <LegalDocument source={privacyMarkdown} />
    </div>
  );
});

PrivacyPage.displayName = 'PrivacyPage';
export default PrivacyPage;
