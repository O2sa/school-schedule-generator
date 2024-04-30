import { FormRow, FormRowSelect, SubmitBtn } from "../components";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useLoaderData, useParams, Outlet } from "react-router-dom";
import { Form, redirect } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { useQuery } from "@tanstack/react-query";
import SubjectsContainer from "./SubjectsContainer";
import { STAGES } from "../../../utils/constants";

const singleJobQuery = (id) => {
  return {
    queryKey: ["level", id],
    queryFn: async () => {
      const { data } = await customFetch.get(`/levels/${id}`);
      return data;
    },
  };
};

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      await queryClient.ensureQueryData(singleJobQuery(params.id));
      return params.id;
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
      await customFetch.patch(`/levels/${params.id}`, data);
      queryClient.invalidateQueries(["levels"]);

      toast.success("Job edited successfully");
      return redirect(".");
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };

const LevelInfo = () => {
  const id = useLoaderData();
  const {
    data: { level, teachers },
  } = useQuery(singleJobQuery(id));

  return (
    <Wrapper>
      <Form method="post" className="form">
        <h4 className="form-title">تعديل المستوى</h4>
        <div className="form-center">
          <FormRow
            labelText={"الأسم"}
            type="text"
            name="name"
            defaultValue={level.name}
          />
          <FormRow
            type="text"
            name="dailyLectures"
            labelText={"المحاضرات اليومية"}
            defaultValue={level.dailyLectures}
          />
          <FormRowSelect
            labelText="المرحلة"
            name="stage"
            list={STAGES}
            disable={false}
            defaultValue={level.stage}
          />
          <SubmitBtn formBtn />
        </div>
      </Form>
      <div style={{ marginTop: "8em" }}>
        <SubjectsContainer teachers={teachers} levelId={id} />
      </div>
      {/* <MantineReactTable table={table} />; */}
    </Wrapper>
  );
};
export default LevelInfo;
