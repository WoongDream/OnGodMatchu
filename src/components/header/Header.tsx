import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { HeaderWrapper, HeaderInner, Logo, NavActions } from './Header.style';

const Header = () => {
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
    <HeaderWrapper>
      <HeaderInner>
        <Logo onClick={handleLogoClick}>OnGodMatchu</Logo>
        <NavActions>
          {isLoggedIn ? (
            <>
              <button onClick={handleCreateClick}>퀴즈 만들기</button>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <button onClick={handleLoginClick}>로그인</button>
          )}
        </NavActions>
      </HeaderInner>
    </HeaderWrapper>
  );
};

export default Header;
