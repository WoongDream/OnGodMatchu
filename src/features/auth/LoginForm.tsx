import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/input';
import Button from '@/components/button';
import SocialLoginButtons from './SocialLoginButtons';
import { FormWrapper, FormTitle, LinkRow, LinkText, LinkButton } from './LoginForm.style';

const LoginForm = memo(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 로그인 API 연동
    alert('로그인 (API 연동 전)');
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormTitle>로그인</FormTitle>
      <Input
        label="이메일"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="example@email.com"
      />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="비밀번호 입력"
      />
      <Button fullWidth type="submit" disabled={!isValid}>
        로그인
      </Button>
      <SocialLoginButtons />
      <LinkRow>
        <LinkText>계정이 없으신가요?</LinkText>
        <LinkButton type="button" onClick={() => navigate('/signup')}>
          회원가입
        </LinkButton>
      </LinkRow>
    </FormWrapper>
  );
});

LoginForm.displayName = 'LoginForm';
export default LoginForm;
