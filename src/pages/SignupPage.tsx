import SignupForm from '@/features/auth/SignupForm';
import { pageWrapperStyle } from '@/styles/layout';

const SignupPage = () => {
  return (
    <div css={pageWrapperStyle()}>
      <SignupForm />
    </div>
  );
};

export default SignupPage;
