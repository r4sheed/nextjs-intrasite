import { TriangleAlert } from 'lucide-react';

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from '@/components/ui/item';

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <Item variant="outline" size="sm" className="bg-destructive/10">
      <ItemMedia>
        <TriangleAlert className="text-destructive size-5" />
      </ItemMedia>
      <ItemContent>
        <ItemDescription className="text-destructive">
          {message}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
