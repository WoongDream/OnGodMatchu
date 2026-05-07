import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';

vi.mock('@/content/legal/terms.md?raw', () => ({
  default: '# 서비스 이용약관\n\n본 약관은 OnGodMatchu 서비스의 이용 조건을 규정합니다.',
}));

vi.mock('@/components/legal', () => ({
  default: ({ source }: { source: string }) => <div data-testid="legal-document">{source}</div>,
}));

import TermsPage from './TermsPage';

describe('TermsPage', () => {
  it('renders LegalDocument with terms markdown content', () => {
    renderWithTheme(<TermsPage />);
    const doc = screen.getByTestId('legal-document');
    expect(doc).toBeInTheDocument();
    expect(doc).toHaveTextContent('서비스 이용약관');
  });

  it('passes raw markdown source through props (not preprocessed)', () => {
    renderWithTheme(<TermsPage />);
    expect(screen.getByTestId('legal-document').textContent).toContain('# 서비스 이용약관');
  });

  it('renders without authentication wrapper (publicly accessible)', () => {
    const { container } = renderWithTheme(<TermsPage />);
    expect(container.querySelector('[data-testid="legal-document"]')).not.toBeNull();
  });
});
