import { Link, Form, redirect, useNavigate } from 'react-router-dom';
import Wrapper from '../assets/wrappers/RegisterAndLoginPage';
import { FormRow, Logo, SubmitBtn } from '../components';
import customFetch from '../utils/customFetch';
import { toast } from 'react-toastify';

export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    try {
      await customFetch.post('/auth/login', data);
      queryClient.invalidateQueries();
      toast.success('تم تسجيل الدخول');
      return redirect('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };


const Login = () => {
  const navigate = useNavigate();

  const loginDemoUser = async () => {
    const data = {
      email: 'tester@test.com',
      password: 'secret123',
    };
    try {
      await customFetch.post('/auth/login', data);
      toast.success('إ');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
  };



  return (
    <Wrapper>
      <Form method='post' className='form'>
        <Logo />
        <h4>تسجيل الدخول</h4>
        <FormRow labelText={'الإيميل'} type='email' name='email' />
        <FormRow labelText={'كلمة السر'} type='password' name='password' />
        <SubmitBtn />
        <button type='button' className='btn btn-block' onClick={loginDemoUser}>
          تصفح الموقع
        </button>
        <p>
          لا يوجد لديك حساب?
          <Link to='/register' className='member-btn'>
            إنشاء حساب
          </Link>
        </p>
      </Form>
    </Wrapper>
  );
};
export default Login;
