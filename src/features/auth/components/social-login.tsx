'use client';

import { SocialIcons } from '@/components/icons/social-icons';
import { Button } from '@/components/ui/button';

export const SocialLogin = () => {
  return (
    <>
      <Button
        size="lg"
        variant="outline"
        onClick={() => {
          alert('Google');
        }}
        type="button"
      >
        <SocialIcons.google className="size-5" />
      </Button>
      <Button size="lg" variant="outline" onClick={() => {}} type="button">
        <SocialIcons.github className="size-5" />
      </Button>
    </>
  );
};
