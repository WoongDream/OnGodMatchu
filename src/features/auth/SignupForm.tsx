import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/input';
import Button from '@/components/button';
import SocialLoginButtons from './SocialLoginButtons';
import { FormWrapper, FormTitle, LinkRow, LinkText, LinkButton } from './SignupForm.style';

const SignupForm = memo(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const isValid =
    email.trim() !== '' &&
    nickname.trim() !== '' &&
    password.trim() !== '' &&
    (!emailSent || verificationCode.trim() !== '');

  const handleSendEmail = () => {
    // TODO: 이메일 인증 API 연동
    setEmailSent(true);
    alert('인증 코드가 발송됐어요! (API 연동 전)');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 회원가입 API 연동
    alert('회원가입 (API 연동 전)');
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormTitle>회원가입</FormTitle>
      <Input
        label="이메일"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="example@email.com"
      />
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={handleSendEmail}
        disabled={email.trim() === ''}
      >
        인증 코드 발송
      </Button>
      {emailSent && (
        <Input
          label="인증 코드"
          value={verificationCode}
          onChange={setVerificationCode}
          placeholder="이메일로 받은 코드 입력"
        />
      )}
      <Input label="닉네임" value={nickname} onChange={setNickname} placeholder="닉네임 입력" />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="비밀번호 입력"
      />
      <Button fullWidth type="submit" disabled={!isValid}>
        가입하기
      </Button>
      <SocialLoginButtons />
      <LinkRow>
        <LinkText>이미 계정이 있으신가요?</LinkText>
        <LinkButton type="button" onClick={() => navigate('/login')}>
          로그인
        </LinkButton>
      </LinkRow>
    </FormWrapper>
  );
});

SignupForm.displayName = 'SignupForm';
export default SignupForm;
