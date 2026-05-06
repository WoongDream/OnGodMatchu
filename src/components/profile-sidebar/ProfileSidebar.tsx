import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import type { ProfileSidebarProps } from './ProfileSidebar.type';
import { navStyle, linkStyle, countStyle } from './ProfileSidebar.style';
import { PROFILE_MENU_ITEMS, buildBaseTo, resolveTo } from './menuItems';

const ProfileSidebar = memo(({ isMe, userId, stats }: ProfileSidebarProps) => {
  const base = buildBaseTo(userId);
  const items = PROFILE_MENU_ITEMS.filter((item) => isMe || !item.myOnly);

  return (
    <nav css={navStyle} aria-label="프로필 메뉴">
      {items.map((item) => {
        const to = resolveTo(base, item);
        const count = item.countKey && stats ? stats[item.countKey] : undefined;
        return (
          <NavLink key={item.key} to={to} end={item.to === ''} css={linkStyle}>
            <span>{item.label}</span>
            {count !== undefined && <span css={countStyle}>{count}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
});

ProfileSidebar.displayName = 'ProfileSidebar';
export default ProfileSidebar;
