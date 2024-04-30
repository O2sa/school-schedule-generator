import { FormRow, FormRowSelect, SubmitBtn } from "../components";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useOutletContext } from "react-router-dom";
import { Form, redirect } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { STAGES, WORK_DAYS } from "../../../utils/constants";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await customFetch.post('/users/admins', data);
    toast.success('Registration successful');
    return redirect('..');
  } catch (error) {
    toast.error(error?.response?.data?.msg);

    return error;
  }
};

const AddTeacher = () => {
  // const { user } = useOutletContext();
  return (
    <Wrapper>
       <Form method='post' className='form'>
        {/* <Logo /> */}
        <h4>إنشاء مدير جديد</h4>
        <FormRow labelText={'الأسم '} type='text' name='name' />
        <FormRow labelText={'الإيميل'} type='email' name='email' />
        <FormRow labelText={'كلمة السر'} type='password' name='password' />
        <SubmitBtn />
      </Form>
    </Wrapper>
  );
};
export default AddTeacher;
