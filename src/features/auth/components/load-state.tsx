import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';

interface LoadStateProps {
  title: string;
  description: string;
}

const LoadState = ({ title, description }: LoadStateProps) => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <Spinner className="size-10" />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
  </Empty>
);

export { LoadState };
