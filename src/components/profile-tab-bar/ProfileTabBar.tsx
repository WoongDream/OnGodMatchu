import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { PROFILE_MENU_ITEMS, buildBaseTo, resolveTo } from '@/components/profile-sidebar';
import type { ProfileTabBarProps } from './ProfileTabBar.type';
import { tabsStyle, tabStyle, countStyle } from './ProfileTabBar.style';

const ProfileTabBar = memo(({ isMe, userId, stats }: ProfileTabBarProps) => {
  const base = buildBaseTo(userId);
  const items = PROFILE_MENU_ITEMS.filter((item) => isMe || !item.myOnly);

  return (
    <nav css={tabsStyle} aria-label="프로필 메뉴">
      {items.map((item) => {
        const to = resolveTo(base, item);
        const count = item.countKey && stats ? stats[item.countKey] : undefined;
        return (
          <NavLink key={item.key} to={to} end={item.to === ''} css={tabStyle}>
            {item.label}
            {count !== undefined && <span css={countStyle}>{count}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
});

ProfileTabBar.displayName = 'ProfileTabBar';
export default ProfileTabBar;
