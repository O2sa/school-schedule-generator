import { FormRow, FormRowSelect, SubmitBtn } from '../components';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { useOutletContext } from 'react-router-dom';
import { Form, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';

export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    try {
      await customFetch.post('/levels', data);
      queryClient.invalidateQueries(['levels']);
      toast.success('Job added successfully ');
      return redirect('..');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };

const AddLevel = () => {
  // const { user } = useOutletContext();

  return (
    <Wrapper>
      <Form method='post' className='form'>
        <h4 className='form-title'>إضافة مستوى</h4>
        <div className='form-center'>
          <FormRow type='text' name='name' />
          <FormRow type='text' name='dailyLectures' />
   
          <SubmitBtn formBtn />
        </div>
      </Form>
    </Wrapper>
  );
};
export default AddLevel;
