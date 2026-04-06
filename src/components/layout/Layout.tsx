import type { ReactNode } from 'react';
import Header from '../header';
import { AppShell, PageContent } from './Layout.style';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <AppShell>
      <Header />
      <PageContent>{children}</PageContent>
    </AppShell>
  );
};

export default Layout;
