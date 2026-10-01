import { Form, redirect, Link } from 'react-router-dom';
import Wrapper from '../assets/wrappers/RegisterAndLoginPage';
import { FormRow, Logo, SubmitBtn } from '../components';
import customFetch from '../utils/customFetch';
import { toast } from 'react-toastify';
export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await customFetch.post('/auth/register', data);
    toast.success('Registration successful');
    return redirect('/login');
  } catch (error) {
    toast.error(error?.response?.data?.msg);

    return error;
  }
};
const Register = () => {
  return (
    <Wrapper>
      <Form method='post' className='form'>
        <Logo />
        <h4>إنشاء حساب</h4>
        <FormRow labelText={'الأسم الأول'} type='text' name='name' />
        <FormRow labelText={'الإيميل'} type='email' name='email' />
        <FormRow labelText={'كلمة السر'} type='password' name='password' />
        <SubmitBtn />
        <p>
          لديك حساب بالفعل?
          <Link to='/login' className='member-btn'>
            تسجيل الدخول
          </Link>
        </p>
      </Form>
    </Wrapper>
  );
};
export default Register;
