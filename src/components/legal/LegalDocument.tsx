import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Article } from './LegalDocument.style';

interface LegalDocumentProps {
  source: string;
}

const LegalDocument = memo(({ source }: LegalDocumentProps) => {
  return (
    <Article>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </Article>
  );
});

LegalDocument.displayName = 'LegalDocument';
export default LegalDocument;
