'use client';

import { User, Shield, Bell, Palette, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';

type SettingsSidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type SettingsSidebarGroup = {
  title: string;
  items: readonly SettingsSidebarItem[];
};

const defaultNavItems: readonly SettingsSidebarGroup[] = [
  {
    title: 'General',
    items: [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    title: 'Personalization',
    items: [{ id: 'appearance', label: 'Appearance', icon: Palette }],
  },
  {
    title: 'System',
    items: [{ id: 'advanced', label: 'Advanced', icon: Settings }],
  },
];

type SettingsSidebarProps = {
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
  groups?: readonly SettingsSidebarGroup[];
  className?: string;
};

const SettingsSidebar = ({
  activeSection,
  onSectionSelect,
  groups = defaultNavItems,
  className,
}: SettingsSidebarProps) => {
  return (
    <div className={cn('flex flex-col gap-2 p-4 pt-0 text-sm', className)}>
      <div className="bg-background sticky">
        <h2 className="text-foreground text-lg font-semibold">Settings</h2>
        <p className="text-muted-foreground top-0 h-6 text-xs">
          Manage your account settings
        </p>
      </div>

      {groups.map(section => (
        <div key={section.title}>
          <h3 className="text-muted-foreground mb-2 text-xs font-medium">
            {section.title}
          </h3>
          <ul className="space-y-1">
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = item.id === activeSection;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[0.8rem] no-underline transition-colors',
                      isActive
                        ? 'bg-accent text-foreground'
                        : 'text-foreground hover:text-foreground'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSectionSelect(item.id)}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export { SettingsSidebar };
