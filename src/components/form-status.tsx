import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormStatusBaseProps {
  title?: string;
  message?: string;
}

const FormSuccess = ({ title, message }: FormStatusBaseProps) => {
  if (!message) return null;

  return (
    <Alert className="text-emerald-700">
      <CheckCircle2Icon />
      {title && <AlertTitle className="text-emerald-700">{title}</AlertTitle>}
      <AlertDescription className="text-emerald-700">
        <p>{message}</p>
      </AlertDescription>
    </Alert>
  );
};

const FormError = ({ title, message }: FormStatusBaseProps) => {
  if (!message) return null;

  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>
        <p>{message}</p>
      </AlertDescription>
    </Alert>
  );
};

export { FormSuccess, FormError };
