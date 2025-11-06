import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const sidebarItems = {
  children: [
    {
      $id: 'getting-started',
      name: 'Getting Started',
      type: 'folder',
      children: [
        {
          name: 'Introduction',
          url: '/docs/getting-started/introduction',
          type: 'page',
        },
        {
          name: 'Installation',
          url: '/docs/getting-started/installation',
          type: 'page',
        },
      ],
    },
    {
      $id: 'components',
      name: 'Components',
      type: 'folder',
      children: [
        {
          name: 'Button',
          url: '/docs/components/button',
          type: 'page',
        },
        {
          name: 'Input',
          url: '/docs/components/input',
          type: 'page',
        },
        {
          name: 'Card',
          url: '/docs/components/card',
          type: 'page',
        },
      ],
    },
    {
      $id: 'api',
      name: 'API Reference',
      type: 'folder',
      children: [
        {
          name: 'Authentication',
          url: '/docs/api/auth',
          type: 'page',
        },
        {
          name: 'Data Fetching',
          url: '/docs/api/data',
          type: 'page',
        },
      ],
    },
  ],
};

export type sidebarItemsType = typeof sidebarItems;

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <SidebarProvider className="3xl:fixed:container 3xl:fixed:px-3 min-h-min flex-1 items-start px-0 [--sidebar-width:220px] [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--sidebar-width:240px] lg:[--top-spacing:calc(var(--spacing)*4)]">
        <AppSidebar items={sidebarItems} />
        <div className="h-full w-full">{children}</div>
      </SidebarProvider>
    </div>
  );
}
