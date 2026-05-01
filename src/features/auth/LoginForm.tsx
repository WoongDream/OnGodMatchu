import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/input';
import Button from '@/components/button';
import SocialLoginButtons from './SocialLoginButtons';
import {
  formStyle,
  titleStyle,
  linkRowStyle,
  linkTextStyle,
  linkButtonStyle,
  errorTextStyle,
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
    <form css={formStyle} onSubmit={handleSubmit}>
      <h1 css={titleStyle}>로그인</h1>
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
      {error && <p css={errorTextStyle}>{error}</p>}
      <Button fullWidth type="submit" disabled={!isValid || isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>
      <SocialLoginButtons />
      <div css={linkRowStyle}>
        <span css={linkTextStyle}>계정이 없으신가요?</span>
        <button type="button" css={linkButtonStyle} onClick={() => navigate('/signup')}>
          회원가입
        </button>
      </div>
    </form>
  );
});

LoginForm.displayName = 'LoginForm';
export default LoginForm;
