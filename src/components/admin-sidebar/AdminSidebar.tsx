import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  navStyle,
  headerStyle,
  itemStyle,
  disabledItemStyle,
  soonStyle,
} from './AdminSidebar.style';

type Menu = { key: string; label: string; to?: string };

/** 8개 BO 메뉴 — 공지사항만 활성, 나머지는 추후(placeholder). */
const MENUS: Menu[] = [
  { key: 'notices', label: '공지사항 관리', to: '/admin/notices' },
  { key: 'users', label: '유저 관리', to: '/admin/users' },
  { key: 'quizzes', label: '퀴즈 관리' },
  { key: 'categories', label: '카테고리 관리' },
  { key: 'comments', label: '댓글 관리' },
  { key: 'banned-words', label: '금지어 관리' },
  { key: 'nicknames', label: '닉네임 관리', to: '/admin/nicknames' },
  { key: 'inquiries', label: '문의사항 관리', to: '/admin/inquiries' },
];

const AdminSidebar = memo(() => (
  <nav css={navStyle} aria-label="백오피스 메뉴">
    <p css={headerStyle}>관리자 · BACK OFFICE</p>
    {MENUS.map((menu) =>
      menu.to ? (
        <NavLink
          key={menu.key}
          to={menu.to}
          css={itemStyle}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {menu.label}
        </NavLink>
      ) : (
        <span key={menu.key} css={disabledItemStyle}>
          {menu.label}
          <span css={soonStyle}>추후</span>
        </span>
      ),
    )}
  </nav>
));

AdminSidebar.displayName = 'AdminSidebar';
export default AdminSidebar;
