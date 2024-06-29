import { FormRow, FormRowSelect, SubmitBtn } from "../components";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useLoaderData, useOutletContext } from "react-router-dom";
import { Form, redirect } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { STAGES, WORK_DAYS } from "../../../utils/constants";
import { useQuery } from "@tanstack/react-query";

const singleJobQuery = (id) => {
  return {
    queryKey: ["stage-teachers", id],
    queryFn: async () => {
      const { data } = await customFetch.get(`teachers/stage-teachers/${id}`);
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
  async ({ request,params }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    console.log('data',data);

    try {
      await customFetch.post("/subjects", data);
      queryClient.invalidateQueries(["subjects",'level-subjects',params.id]);
      queryClient.invalidateQueries(["teachers"]);

      toast.success("Job added successfully ");
      // return redirect("..");
      return null
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };

const AddSubject = () => {
  // const { user } = useOutletContext();

  const id = useLoaderData();
  const { data: teachers } = useQuery(singleJobQuery(id));

  // console.log(id, teachers);

  return (
    <Wrapper>
      <Form method="post" className="form">
        <h4 className="form-title">إضافة مادة</h4>
        <div className="form-center">
          <FormRow labelText={"الأسم "} type="text" name="name" />
          <FormRow
            labelText={"المحاضرات الأسبوعية"}
            type="number"
            name="weeklyLectures"
          />
          <div className="form-row">
            <input
              id={'level'}
              name={'level'}
              defaultValue={id}
              hidden={true}

            />
          </div>{" "}
          <div className="form-row">
            <label htmlFor={"teacher"} className="form-label">
              {"المعلم"}
            </label>
            <select
              name={"teacher"}
              id={"teacher"}
              className="form-select"
              // defaultValue={defaultValue}
              // disabled={disable}
            >
              {teachers.teachers.map((itemValue) => {
                return (
                  <option key={itemValue._id} value={itemValue._id}>
                    {itemValue.name}
                  </option>
                );
              })}
            </select>
          </div>
          <SubmitBtn formBtn />
        </div>
      </Form>
    </Wrapper>
  );
};
export default AddSubject;
