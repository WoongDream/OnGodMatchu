import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { articleStyle } from './LegalDocument.style';

interface LegalDocumentProps {
  source: string;
}

const LegalDocument = memo(({ source }: LegalDocumentProps) => {
  return (
    <article css={articleStyle}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </article>
  );
});

LegalDocument.displayName = 'LegalDocument';
export default LegalDocument;
