import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { ProfileSidebarProps } from './ProfileSidebar.type';
import {
  navStyle,
  linkStyle,
  childLinkStyle,
  countStyle,
  groupHeaderStyle,
  groupLabelStyle,
  groupChevronStyle,
} from './ProfileSidebar.style';
import {
  PROFILE_MENU_ITEMS,
  PROFILE_MENU_GROUPS,
  buildBaseTo,
  resolveTo,
  type MenuGroupId,
  type MenuItem,
} from './menuItems';

const renderLink = (item: MenuItem, base: string, count: number | undefined, indented: boolean) => {
  const to = resolveTo(base, item);
  return (
    <NavLink
      key={item.key}
      to={to}
      end={item.to === ''}
      css={indented ? childLinkStyle : linkStyle}
    >
      <span>{item.label}</span>
      {count !== undefined && <span css={countStyle}>{count}</span>}
    </NavLink>
  );
};

const ProfileSidebar = memo(({ isMe, userId, stats }: ProfileSidebarProps) => {
  const base = buildBaseTo(userId);
  const location = useLocation();

  const items = useMemo(() => PROFILE_MENU_ITEMS.filter((item) => isMe || !item.myOnly), [isMe]);

  const isGroupActive = useCallback(
    (groupId: MenuGroupId) =>
      items.some((i) => i.groupId === groupId && location.pathname === resolveTo(base, i)),
    [items, location.pathname, base],
  );

  const [open, setOpen] = useState<Record<MenuGroupId, boolean>>(() => ({
    quiz: isGroupActive('quiz'),
  }));

  useEffect(() => {
    (Object.keys(PROFILE_MENU_GROUPS) as MenuGroupId[]).forEach((id) => {
      if (isGroupActive(id)) {
        setOpen((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
      }
    });
  }, [isGroupActive]);

  const toggle = (id: MenuGroupId) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rendered: React.ReactNode[] = [];
  const seenGroups = new Set<MenuGroupId>();

  for (const item of items) {
    const count = item.countKey && stats ? stats[item.countKey] : undefined;

    if (!item.groupId) {
      rendered.push(renderLink(item, base, count, false));
      continue;
    }

    if (seenGroups.has(item.groupId)) {
      continue;
    }
    seenGroups.add(item.groupId);

    const groupId = item.groupId;
    const group = PROFILE_MENU_GROUPS[groupId];
    const children = items.filter((i) => i.groupId === groupId);
    const isOpen = open[groupId];

    rendered.push(
      <div key={`group-${group.id}`}>
        <button
          type="button"
          onClick={() => toggle(groupId)}
          aria-expanded={isOpen}
          css={groupHeaderStyle}
        >
          <span css={groupLabelStyle}>{group.label}</span>
          <span css={groupChevronStyle(isOpen)} aria-hidden="true">
            ›
          </span>
        </button>
        {isOpen &&
          children.map((child) =>
            renderLink(
              child,
              base,
              child.countKey && stats ? stats[child.countKey] : undefined,
              true,
            ),
          )}
      </div>,
    );
  }

  return (
    <nav css={navStyle} aria-label="프로필 메뉴">
      {rendered}
    </nav>
  );
});

ProfileSidebar.displayName = 'ProfileSidebar';
export default ProfileSidebar;
