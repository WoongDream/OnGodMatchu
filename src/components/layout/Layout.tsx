import { memo, type ReactNode } from 'react';
import Header from '../header';
import { AppShell, PageContent } from './Layout.style';

type LayoutProps = {
  children: ReactNode;
};

const Layout = memo(({ children }: LayoutProps) => {
  return (
    <AppShell>
      <Header />
      <PageContent>{children}</PageContent>
    </AppShell>
  );
});

Layout.displayName = 'Layout';
export default Layout;
