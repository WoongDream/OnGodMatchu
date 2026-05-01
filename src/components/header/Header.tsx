import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { wrapperStyle, innerStyle, logoStyle, navActionsStyle } from './Header.style';

const Header = memo(() => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuthStore();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateClick = () => {
    navigate('/quiz/create');
  };

  return (
    <header css={wrapperStyle}>
      <div css={innerStyle}>
        <span css={logoStyle} onClick={handleLogoClick}>
          OnGodMatchu
        </span>
        <div css={navActionsStyle}>
          {isLoggedIn ? (
            <>
              <button onClick={handleCreateClick}>퀴즈 만들기</button>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <button onClick={handleLoginClick}>로그인</button>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;
