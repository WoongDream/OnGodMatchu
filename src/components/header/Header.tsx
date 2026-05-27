import { memo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import ProfileImage from '@/components/profile-image';
import logoKo from '@/assets/logo/ongatmatchu-logo-horizontal-ko.svg';
import {
  wrapperStyle,
  innerStyle,
  logoStyle,
  tabsStyle,
  tabStyle,
  navActionsStyle,
  loginPillStyle,
  profileButtonStyle,
} from './Header.style';

const Header = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuthStore();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const isQuizActive = location.pathname === '/' || location.pathname.startsWith('/quiz');

  return (
    <header css={wrapperStyle}>
      <div css={innerStyle}>
        <img src={logoKo} alt="OnGodMatchu" css={logoStyle} onClick={handleLogoClick} />
        <nav css={tabsStyle} aria-label="메인 메뉴">
          <NavLink to="/quiz" css={tabStyle} className={isQuizActive ? 'active' : undefined}>
            퀴즈
          </NavLink>
          <NavLink to="/announcements" css={tabStyle}>
            공지
          </NavLink>
        </nav>
        <div css={navActionsStyle}>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleProfileClick}
              aria-label="프로필"
              css={profileButtonStyle}
            >
              <ProfileImage
                nickname={user?.nickname ?? ''}
                imageUrl={user?.profileImageUrl}
                size="sm"
              />
            </button>
          ) : (
            <button type="button" onClick={handleLoginClick} css={loginPillStyle}>
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;
