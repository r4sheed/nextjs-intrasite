'use client';

import { useState } from 'react';

import {
  User,
  Shield,
  Bell,
  Palette,
  Settings,
  Save,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { OpenInV0Cta } from '@/components/open-in-v0-cta';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldSet,
  FieldLabel,
  FieldGroup,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { PasswordInput } from '@/features/auth/components/password-input';

import { SettingsSidebar } from './settings-sidebar';

const sidebarGroups = [
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
] as const;

type SettingsSectionId = (typeof sidebarGroups)[number]['items'][number]['id'];

const ProfileSection = () => {
  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/abstract-geometric-shapes.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              {/* TODO: A modal where the user can select or remove avatar */}
              <Button variant="outline" size="sm">
                Change Avatar
              </Button>
              <p className="text-muted-foreground text-xs">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <Field>
              <FieldContent>
                <FieldTitle>First Name</FieldTitle>
                <Input placeholder="John" defaultValue="John" />
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldTitle>Last Name</FieldTitle>
                <Input placeholder="Doe" defaultValue="Doe" />
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldContent>
              <FieldTitle>Email Address</FieldTitle>
              <FieldDescription>
                We'll use this email for account notifications
              </FieldDescription>
              <Input
                type="email"
                placeholder="john@example.com"
                defaultValue="john@example.com"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <FieldTitle>Bio</FieldTitle>
              <FieldDescription>
                Write a short introduction about yourself
              </FieldDescription>
              <Textarea
                placeholder="Tell us about yourself"
                className="min-h-24 resize-none"
                defaultValue="Product designer and developer passionate about creating intuitive interfaces."
              />
            </FieldContent>
          </Field>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button>
            <Save />
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const SecuritySection = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldContent>
              <FieldTitle>Current Password</FieldTitle>
              <FieldDescription>Enter your current password</FieldDescription>
              <PasswordInput autoComplete="current-password" required />
            </FieldContent>
          </Field>

          <div className="grid gap-6 md:grid-cols-2">
            <Field>
              <FieldContent>
                <FieldTitle>New Password</FieldTitle>
                <PasswordInput autoComplete="new-password" required />
              </FieldContent>
            </Field>
            <Field>
              <FieldContent>
                <FieldTitle>Confirm Password</FieldTitle>
                <PasswordInput autoComplete="new-password" required />
              </FieldContent>
            </Field>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button>
            <RefreshCw /> Update Password
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Enable 2FA</FieldTitle>
              <FieldDescription>
                Use an authenticator app for additional security
              </FieldDescription>
            </FieldContent>
            <Switch />
          </Field>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button>
            <Save /> Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices that are currently logged into your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">MacBook Pro - Chrome</p>
              <p className="text-muted-foreground text-xs">
                Last active: 2 minutes ago
              </p>
            </div>
            <Button variant="outline" size="sm">
              Revoke
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">iPhone 15 - Safari</p>
              <p className="text-muted-foreground text-xs">
                Last active: 3 hours ago
              </p>
            </div>
            <Button variant="outline" size="sm">
              Revoke
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const NotificationsSection = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Account Activity</FieldTitle>
              <FieldDescription>
                Receive alerts about your account activity and security
              </FieldDescription>
            </FieldContent>
            <Switch defaultChecked />
          </Field>

          <Separator />

          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Product Updates</FieldTitle>
              <FieldDescription>
                Get notified about new features and product updates
              </FieldDescription>
            </FieldContent>
            <Switch defaultChecked />
          </Field>

          <Separator />

          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Marketing Emails</FieldTitle>
              <FieldDescription>
                Receive promotional content and special offers
              </FieldDescription>
            </FieldContent>
            <Switch />
          </Field>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Manage push notifications on your devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Desktop Notifications</FieldTitle>
              <FieldDescription>
                Show notifications on your desktop browser
              </FieldDescription>
            </FieldContent>
            <Switch defaultChecked />
          </Field>

          <Separator />

          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Mobile Notifications</FieldTitle>
              <FieldDescription>
                Receive push notifications on your mobile device
              </FieldDescription>
            </FieldContent>
            <Switch defaultChecked />
          </Field>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const AppearanceSection = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Select your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <RadioGroup defaultValue="light">
                <div className="items-between flex justify-between gap-4">
                  <FieldLabel>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="light" id="theme-light" />
                      <FieldContent>
                        <FieldTitle>Light</FieldTitle>
                      </FieldContent>
                    </Field>
                  </FieldLabel>

                  <FieldLabel>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <FieldContent>
                        <FieldTitle>Dark</FieldTitle>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                </div>
              </RadioGroup>
            </FieldSet>
          </FieldGroup>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button>Save Theme</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>
            Customize your display and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldContent>
              <FieldTitle>Language</FieldTitle>
              <FieldDescription>
                Select your preferred language for the interface
              </FieldDescription>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <FieldTitle>Time Zone</FieldTitle>
              <FieldDescription>
                Choose your local time zone for accurate timestamps
              </FieldDescription>
              <Select defaultValue="utc-5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="utc+0">UTC</SelectItem>
                  <SelectItem value="utc+1">
                    Central European Time (UTC+1)
                  </SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const AdvancedSection = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Developer Settings</CardTitle>
          <CardDescription>Advanced options for developers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>API Access</FieldTitle>
              <FieldDescription>
                Enable API access for programmatic integration
              </FieldDescription>
            </FieldContent>
            <Switch />
          </Field>

          <Separator />

          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Debug Mode</FieldTitle>
              <FieldDescription>
                Show detailed error messages and debugging information
              </FieldDescription>
            </FieldContent>
            <Switch />
          </Field>

          <Separator />

          <Field>
            <FieldContent>
              <FieldTitle>API Key</FieldTitle>
              <FieldDescription>
                Your unique API key for authentication
              </FieldDescription>
              <div className="flex gap-2">
                <code className="bg-muted flex-1 rounded-md px-3 py-2 text-sm">
                  test_4eC39HqLyjWDarjtT1zdp7dc
                </code>
                <Button variant="outline" size="sm">
                  Regenerate
                </Button>
              </div>
            </FieldContent>
          </Field>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or clear your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Export Data</FieldTitle>
              <FieldDescription>
                Download all your account data in JSON format
              </FieldDescription>
            </FieldContent>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </Field>

          <Separator />

          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Clear Cache</FieldTitle>
              <FieldDescription>
                Clear all cached data to free up storage
              </FieldDescription>
            </FieldContent>
            <Button variant="outline" size="sm">
              Clear
            </Button>
          </Field>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>Permanently delete your account</CardDescription>
        </CardHeader>
        <Separator />
        <CardFooter className="justify-between">
          <div className="text-destructive text-sm">
            <p>Please be certain. This action cannot be undone!</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive dark:bg-destructive/60 hover:bg-destructive focus-visible:ring-destructive text-white"
                  onClick={() => {
                    toast.loading('Deleting account');

                    setTimeout(() => {
                      toast.dismiss();
                      toast.success('Account deleted successfully.');
                    }, 2500);
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

const SettingsPage = () => {
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>('profile');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'security':
        return <SecuritySection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'advanced':
        return <AdvancedSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                  Profile Settings
                </h1>
                <div className="docs-nav bg-background/80 border-border/50 fixed inset-x-0 bottom-0 isolate z-50 flex items-center gap-2 border-t px-6 py-4 backdrop-blur-sm sm:static sm:z-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-1.5 sm:backdrop-blur-none" />
              </div>
              <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                Manage your profile information and preferences
              </p>
            </div>
          </div>
          <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
            {renderContent()}
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--footer-height)+2rem)] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 md:flex">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="no-scrollbar overflow-y-auto px-8">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionSelect={sectionId =>
              setActiveSection(sectionId as SettingsSectionId)
            }
            groups={sidebarGroups}
          />
          <div className="h-12" />
        </div>
        <div className="flex flex-1 flex-col gap-12 px-6">
          <OpenInV0Cta />
        </div>
      </div>
    </div>
  );
};

export { SettingsPage };
