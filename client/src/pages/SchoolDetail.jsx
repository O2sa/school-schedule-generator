import { FormRow, FormRowSelect, SubmitBtn } from "../components";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useLoaderData, useParams, Outlet } from "react-router-dom";
import { Form, redirect } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { useQuery } from "@tanstack/react-query";
import SubjectsContainer from "./SubjectsContainer";
import { DAYS_OF_WEEK_AR, WORK_DAYS } from "../../../utils/constants";

const singleJobQuery = () => {
  return {
    queryKey: ["school"],
    queryFn: async () => {
      const { data } = await customFetch.get(`/schools`);
      return data;
    },
  };
};

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      await queryClient.ensureQueryData(singleJobQuery());
      return null;
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return redirect("..");
    }
  };

export const action =
  (queryClient) =>
  async ({ request, params }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    try {
      await customFetch.patch(`/schools`, data);
      queryClient.invalidateQueries(["school"]);
      toast.success("Job edited successfully");
      return redirect(".");
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  }

const SchoolDetail = () => {
  const id = useLoaderData();
  const {
    data: { school },
  } = useQuery(singleJobQuery(id));
  return (
    <Wrapper>
      <Form method="post" className="form">
        <h4 className="form-title">تعديل معلومات المدرسة</h4>
        <div className="form-center">
          <FormRow
            labelText={"الأسم"}
            type="text"
            name="name"
            defaultValue={school.name}
          />
          <FormRowSelect
            list={WORK_DAYS}
            name="workDays"
            labelText={"عدد أيام العمل"}
            defaultValue={school.workDays}
            
          />{" "}
          <FormRowSelect
            list={DAYS_OF_WEEK_AR}
            name="startDay"
            labelText={"بداية الأسبوع"}
            defaultValue={school.startDay}
          />
          <SubmitBtn formBtn />
        </div>
      </Form>
      <div style={{ marginTop: "8em" }}>
        {/* <SubjectsContainer schoolId={id} /> */}
      </div>
      {/* <MantineReactTable table={table} />; */}
    </Wrapper>
  );
};
export default SchoolDetail;
