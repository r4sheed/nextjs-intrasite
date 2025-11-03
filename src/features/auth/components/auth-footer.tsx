import Link from 'next/link';

const AuthFooter = () => {
  return (
    <>
      By clicking continue, you agree to our{' '}
      <Link href="#">Terms of Service</Link> and{' '}
      <Link href="#">Privacy Policy</Link>.
    </>
  );
};

export { AuthFooter };
