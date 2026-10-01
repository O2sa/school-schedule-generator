import { FormRow, FormRowSelect, SubmitBtn } from "../components";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useOutletContext } from "react-router-dom";
import { Form, redirect } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { STAGES, WORK_DAYS } from "../../../utils/constants";

export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    try {
      await customFetch.post("/teachers", data);
      queryClient.invalidateQueries(["teachers"]);
      toast.success("Job added successfully ");
      // return redirect("..");
      return null
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };

const AddTeacher = () => {
  // const { user } = useOutletContext();
  return (
    <Wrapper>
      <Form method="post" className="form">
        <h4 className="form-title">إضافة معلم</h4>
        <div className="form-center">
          <FormRow labelText={"الأسم "} type="text" name="name" />
          <FormRow labelText={"الإيميل"} type="email" name="email" />
          <FormRow
            labelText={"كلمة السر"}
            type="password"
            name="password"
          />{" "}
          <FormRowSelect
            list={WORK_DAYS}
            name="workDays"
            labelText={"عدد أيام العمل"}
            // defaultValue={school.workDays}
          />{" "}
          <FormRowSelect labelText="المرحلة" name="stage" list={STAGES} />
          <SubmitBtn formBtn />
        </div>
      </Form>
    </Wrapper>
  );
};
export default AddTeacher;
