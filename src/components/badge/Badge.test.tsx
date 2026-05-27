import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import Badge from './Badge';

describe('Badge', () => {
  describe('children rendering', () => {
    it('renders string children', () => {
      renderWithTheme(<Badge>성공</Badge>);
      expect(screen.getByText('성공')).toBeInTheDocument();
    });

    it('renders ReactNode children (nested element)', () => {
      renderWithTheme(
        <Badge>
          <span data-testid="inner">inner</span>
        </Badge>,
      );
      expect(screen.getByTestId('inner')).toBeInTheDocument();
    });
  });

  describe('variant prop', () => {
    it('renders with default variant "info" when variant is omitted', () => {
      renderWithTheme(<Badge>정보</Badge>);
      expect(screen.getByText('정보')).toBeInTheDocument();
    });

    it('renders with variant "success"', () => {
      renderWithTheme(<Badge variant="success">성공</Badge>);
      expect(screen.getByText('성공')).toBeInTheDocument();
    });

    it('renders with variant "info"', () => {
      renderWithTheme(<Badge variant="info">정보</Badge>);
      expect(screen.getByText('정보')).toBeInTheDocument();
    });

    it('renders with variant "warning"', () => {
      renderWithTheme(<Badge variant="warning">경고</Badge>);
      expect(screen.getByText('경고')).toBeInTheDocument();
    });

    it('renders with variant "neutral"', () => {
      renderWithTheme(<Badge variant="neutral">공지</Badge>);
      expect(screen.getByText('공지')).toBeInTheDocument();
    });

    it('renders with variant "danger"', () => {
      renderWithTheme(<Badge variant="danger">보안</Badge>);
      expect(screen.getByText('보안')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('has displayName "Badge"', () => {
      expect(Badge.displayName).toBe('Badge');
    });
  });
});
