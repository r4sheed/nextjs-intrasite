import { AlertCircleIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormErrorProps {
  title?: string;
  message?: string;
}

export const FormError = ({ title, message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="border-destructive">
      <AlertCircleIcon />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>
        <p>{message}</p>
      </AlertDescription>
    </Alert>
  );
};
