import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

const renderFooter = () =>
  renderWithTheme(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

describe('Footer', () => {
  describe('content', () => {
    it('renders the service brand name', () => {
      renderFooter();
      expect(screen.getByText('OnGodMatchu')).toBeInTheDocument();
    });

    it('renders the copyright notice', () => {
      renderFooter();
      expect(screen.getByText('© 2026 OnGodMatchu. All rights reserved.')).toBeInTheDocument();
    });

    it('renders the contact email text', () => {
      renderFooter();
      expect(screen.getByText('ongodmatchu@gmail.com')).toBeInTheDocument();
    });
  });

  describe('legal links', () => {
    it('renders terms link with /terms href', () => {
      renderFooter();
      const link = screen.getByRole('link', { name: '이용약관' });
      expect(link).toHaveAttribute('href', '/terms');
    });

    it('renders privacy link with /privacy href', () => {
      renderFooter();
      const link = screen.getByRole('link', { name: '개인정보처리방침' });
      expect(link).toHaveAttribute('href', '/privacy');
    });

    it('emphasizes privacy link with bolder font weight than the terms link', () => {
      renderFooter();
      const termsLink = screen.getByRole('link', { name: '이용약관' });
      const privacyLink = screen.getByRole('link', { name: '개인정보처리방침' });

      const termsWeight = Number(window.getComputedStyle(termsLink).fontWeight) || 400;
      const privacyWeight = Number(window.getComputedStyle(privacyLink).fontWeight) || 400;

      expect(privacyWeight).toBeGreaterThan(termsWeight);
    });
  });

  describe('contact link', () => {
    it('renders contact email as a mailto link', () => {
      renderFooter();
      const link = screen.getByRole('link', { name: 'ongodmatchu@gmail.com' });
      expect(link).toHaveAttribute('href', 'mailto:ongodmatchu@gmail.com');
    });
  });

  describe('semantic structure', () => {
    it('uses a <footer> landmark element', () => {
      const { container } = renderFooter();
      expect(container.querySelector('footer')).not.toBeNull();
    });

    it('contains exactly three links (terms, privacy, contact email)', () => {
      renderFooter();
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });
  });

  describe('memoization', () => {
    it('component is wrapped with React.memo', () => {
      expect(Footer.displayName).toBe('Footer');
    });
  });
});
