import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import LegalDocument from './LegalDocument';

describe('LegalDocument', () => {
  it('renders heading from markdown source', () => {
    renderWithTheme(<LegalDocument source="# 개인정보처리방침" />);
    expect(screen.getByRole('heading', { level: 1, name: '개인정보처리방침' })).toBeInTheDocument();
  });

  it('renders paragraph text', () => {
    renderWithTheme(<LegalDocument source="본 약관은 OnGodMatchu의 이용 조건을 규정합니다." />);
    expect(screen.getByText('본 약관은 OnGodMatchu의 이용 조건을 규정합니다.')).toBeInTheDocument();
  });

  it('renders multi-level headings', () => {
    const source = `# 제목

## 1. 첫째

### 1.1 세부

## 2. 둘째`;
    renderWithTheme(<LegalDocument source={source} />);
    expect(screen.getByRole('heading', { level: 1, name: '제목' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '1. 첫째' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '1.1 세부' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '2. 둘째' })).toBeInTheDocument();
  });

  it('renders bullet lists', () => {
    const source = `- 이메일 주소
- 닉네임
- 식별자`;
    renderWithTheme(<LegalDocument source={source} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('이메일 주소');
    expect(items[1]).toHaveTextContent('닉네임');
    expect(items[2]).toHaveTextContent('식별자');
  });

  it('renders ordered lists', () => {
    const source = `1. 첫째
2. 둘째
3. 셋째`;
    renderWithTheme(<LegalDocument source={source} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders bold text via strong element', () => {
    renderWithTheme(<LegalDocument source="**시행일자**: 2026년 4월 30일" />);
    const strong = screen.getByText('시행일자');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders horizontal rules from ---', () => {
    const { container } = renderWithTheme(
      <LegalDocument
        source={`섹션 1

---

섹션 2`}
      />,
    );
    expect(container.querySelector('hr')).not.toBeNull();
  });

  it('renders empty source without crashing', () => {
    const { container } = renderWithTheme(<LegalDocument source="" />);
    expect(container.querySelector('article')).not.toBeNull();
  });

  it('wraps content in article element for semantic structure', () => {
    const { container } = renderWithTheme(<LegalDocument source="# 제목" />);
    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article?.querySelector('h1')).not.toBeNull();
  });

  it('renders GFM tables (remark-gfm enabled)', () => {
    const source = `| 항목 | 보관 기간 |
| --- | --- |
| 회원 정보 | 탈퇴 시까지 |
| 접속 기록 | 3개월 |`;
    renderWithTheme(<LegalDocument source={source} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '항목' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '회원 정보' })).toBeInTheDocument();
  });
});
