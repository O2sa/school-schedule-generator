import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
import { redirect } from 'react-router-dom';

export const action =
  (queryClient) =>
  async ({ params }) => {
    try {
      await customFetch.delete(`/levels/${params.id}`);
      queryClient.invalidateQueries(['levels']);

      toast.success('تم حذف المستوى بنجاح');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
    return redirect('..');
  };
