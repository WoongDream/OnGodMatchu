import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin-sidebar';
import { wrapperStyle, sideStyle, mainStyle } from './AdminLayout.style';

/** 백오피스 셸 — 좌측 LNB + 우측 콘텐츠(Outlet). 라우트 가드(RoleRoute)는 App 에서 적용. */
const AdminLayout = memo(() => (
  <div css={wrapperStyle}>
    <aside css={sideStyle}>
      <AdminSidebar />
    </aside>
    <div css={mainStyle}>
      <Outlet />
    </div>
  </div>
));

AdminLayout.displayName = 'AdminLayout';
export default AdminLayout;
