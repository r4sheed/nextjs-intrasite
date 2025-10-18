import { CircleCheck } from 'lucide-react';

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
} from '@/components/ui/item';

interface FormSuccessProps {
  message?: string;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;

  return (
    <Item variant="outline" size="sm" className="bg-emerald-500/10">
      <ItemMedia>
        <CircleCheck className="size-5 text-green-500" />
      </ItemMedia>
      <ItemContent>
        <ItemDescription className="text-emerald-500">
          {message}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
