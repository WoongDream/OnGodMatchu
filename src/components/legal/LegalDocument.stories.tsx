import type { Meta, StoryObj } from '@storybook/react-vite';
import LegalDocument from './LegalDocument';

const meta: Meta<typeof LegalDocument> = {
  title: 'Components/LegalDocument',
  component: LegalDocument,
  tags: ['autodocs'],
  argTypes: {
    source: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof LegalDocument>;

const SAMPLE_PRIVACY = `# 개인정보처리방침

**시행일자**: 2026년 4월 30일

OnGodMatchu는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수합니다.

---

## 1. 수집하는 개인정보 항목

### 1.1 회원가입 시

- 이메일 주소
- 소셜 로그인 제공자 식별자

### 1.2 자동 생성 항목

1. 서비스 이용 기록
2. 접속 일시 / 접속 IP

> 비로그인 이용 시 개인정보를 수집하지 않습니다.

---

## 2. 보관 기간

| 항목 | 보관 기간 |
| --- | --- |
| 회원 정보 | 탈퇴 시까지 |
| 접속 기록 | 3개월 |
`;

const SAMPLE_TERMS = `# 서비스 이용약관

## 제1조 (목적)

본 약관은 OnGodMatchu가 제공하는 서비스의 이용 조건을 규정합니다.

## 제2조 (용어의 정의)

1. **"서비스"**란 OnGodMatchu 가 제공하는 퀴즈 서비스를 의미합니다.
2. **"회원"**이란 소셜 계정으로 로그인한 이용자를 말합니다.
`;

export const Privacy: Story = {
  args: {
    source: SAMPLE_PRIVACY,
  },
};

export const Terms: Story = {
  args: {
    source: SAMPLE_TERMS,
  },
};

export const Empty: Story = {
  args: {
    source: '',
  },
};
