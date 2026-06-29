import { memo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { hasRole, isSuspended } from '@/lib/auth/role';
import ProfileImage from '@/components/profile-image';
import VisitorBlock from '@/components/visitor-block';
import useVisitorSummary from '@/hooks/useVisitorSummary';
import logoKo from '@/assets/logo/ongatmatchu-logo-horizontal-ko.svg';
import {
  wrapperStyle,
  innerStyle,
  leftSlotStyle,
  logoStyle,
  tabsStyle,
  tabStyle,
  disabledTabStyle,
  navActionsStyle,
  loginPillStyle,
  profileButtonStyle,
  authPlaceholderStyle,
} from './Header.style';

const Header = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, status } = useAuthStore();
  const { data: visitors } = useVisitorSummary();

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
  const showBackOffice = hasRole(user, 'ADMIN');
  const boSuspended = isSuspended(user);

  return (
    <header css={wrapperStyle}>
      <div css={innerStyle}>
        <div css={leftSlotStyle}>
          <img src={logoKo} alt="OnGodMatchu" css={logoStyle} onClick={handleLogoClick} />
          {visitors ? (
            <VisitorBlock
              today={visitors.today}
              total={visitors.total}
              daily={visitors.daily.map((d) => d.visitorCount)}
            />
          ) : null}
        </div>
        <nav css={tabsStyle} aria-label="메인 메뉴">
          <NavLink to="/quiz" css={tabStyle} className={isQuizActive ? 'active' : undefined}>
            퀴즈
          </NavLink>
          <NavLink to="/announcements" css={tabStyle}>
            공지
          </NavLink>
          {showBackOffice &&
            (boSuspended ? (
              <span css={[tabStyle, disabledTabStyle]} aria-disabled="true">
                BO
              </span>
            ) : (
              <NavLink to="/admin" css={tabStyle}>
                BO
              </NavLink>
            ))}
        </nav>
        <div css={navActionsStyle}>
          {status === 'bootstrapping' ? (
            <div
              css={authPlaceholderStyle}
              aria-hidden="true"
              data-testid="header-auth-placeholder"
            />
          ) : isLoggedIn ? (
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
