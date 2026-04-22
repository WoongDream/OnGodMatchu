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
} from './LoginForm.style';
import useLogin from '@/hooks/useLogin';

const LoginForm = memo(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, isLoading, error } = useLogin();

  const isValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
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
      {error && <ErrorText>{error}</ErrorText>}
      <Button fullWidth type="submit" disabled={!isValid || isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
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
