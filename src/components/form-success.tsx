import { CheckCircle2Icon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormSuccessProps {
  title?: string;
  message?: string;
}

export const FormSuccess = ({ title, message }: FormSuccessProps) => {
  if (!message) return null;

  return (
    <Alert className="bg-emerald-500/10 text-emerald-500">
      <CheckCircle2Icon />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className='text-emerald-500"'>
        <p>{message}</p>
      </AlertDescription>
    </Alert>
  );
};
