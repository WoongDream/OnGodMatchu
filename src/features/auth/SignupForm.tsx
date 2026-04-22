import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/input';
import Button from '@/components/button';
import SocialLoginButtons from './SocialLoginButtons';
import {
  FormWrapper,
  FormTitle,
  LinkRow,
  LinkText,
  LinkButton,
  ErrorText,
} from './SignupForm.style';
import useSignup from '@/hooks/useSignup';

const SignupForm = memo(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { handleSendCode, handleVerify, isSending, isVerifying, emailSent, error } = useSignup();

  const canSendCode = email.trim() !== '' && nickname.trim() !== '' && password.trim() !== '';
  const canSubmit = emailSent && verificationCode.trim() !== '';

  const handleSendEmail = async () => {
    await handleSendCode(email, nickname, password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleVerify(email, verificationCode);
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
      <Input label="닉네임" value={nickname} onChange={setNickname} placeholder="닉네임 입력" />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="비밀번호 입력"
      />
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={handleSendEmail}
        disabled={!canSendCode || isSending || emailSent}
      >
        {isSending ? '발송 중...' : emailSent ? '코드 발송됨' : '인증 코드 발송'}
      </Button>
      {emailSent && (
        <Input
          label="인증 코드"
          value={verificationCode}
          onChange={setVerificationCode}
          placeholder="이메일로 받은 코드 입력"
        />
      )}
      {error && <ErrorText>{error}</ErrorText>}
      <Button fullWidth type="submit" disabled={!canSubmit || isVerifying}>
        {isVerifying ? '인증 중...' : '가입하기'}
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
