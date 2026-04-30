import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';

vi.mock('@/content/legal/privacy.md?raw', () => ({
  default: '# 개인정보처리방침\n\n본 개인정보처리방침은 OnGodMatchu 의 처리 사항을 안내합니다.',
}));

vi.mock('@/components/legal', () => ({
  default: ({ source }: { source: string }) => <div data-testid="legal-document">{source}</div>,
}));

import PrivacyPage from './PrivacyPage';

describe('PrivacyPage', () => {
  it('renders LegalDocument with privacy markdown content', () => {
    renderWithTheme(<PrivacyPage />);
    const doc = screen.getByTestId('legal-document');
    expect(doc).toBeInTheDocument();
    expect(doc).toHaveTextContent('개인정보처리방침');
  });

  it('passes raw markdown source through props (not preprocessed)', () => {
    renderWithTheme(<PrivacyPage />);
    expect(screen.getByTestId('legal-document').textContent).toContain('# 개인정보처리방침');
  });

  it('renders without authentication wrapper (publicly accessible)', () => {
    const { container } = renderWithTheme(<PrivacyPage />);
    expect(container.querySelector('[data-testid="legal-document"]')).not.toBeNull();
  });
});
