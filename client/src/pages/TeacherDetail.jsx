import { ModalsProvider, modals } from "@mantine/modals";
import { IconTrash } from "@tabler/icons-react";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import Section from "../assets/wrappers/Section";
import { FormRow, FormRowSelect, SubmitBtn } from "../components";

import { useMemo, useEffect, useState } from "react";
import {
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { toast } from "react-toastify";
import { Link, useLoaderData, useParams } from "react-router-dom";

// import useTable
import {
  ActionIcon,
  Button,
  Flex,
  Text,
  Tooltip,
  Title,
  Box,
  Menu,
  MantineProvider,
  MultiSelect,
} from "@mantine/core";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import customFetch from "../utils/customFetch";

import { IconEdit } from "@tabler/icons-react";
// import MyTable from "./TeacherDetail";

import { Form, redirect } from "react-router-dom";
import {
  DAYS_OF_WEEK_AR,
  DAYS_OF_WEEK_EN,
  NUMS_ST,
  OFF_LECTURES,
  WEEK_DAYS,
  WORK_DAYS,
} from "../../../utils/constants";
import { get } from "mongoose";
import TeacherSchedule from "./TeacherSchedule";

const singleJobQuery = (id) => {
  return {
    queryKey: ["teachers", id],
    queryFn: async () => {
      const { data } = await customFetch.get(`/teachers/${id}`);
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

const OffLectures = ({ teacher }) => {
  // const offLectures = teacher.offDaysAndLectures;
  const id = teacher._id;
  const name = teacher.name;
  console.log('offDaysAndLectures af',teacher.offDaysAndLectures);

  const [offDaysAndLectures, setOffDaysAndLectures] = useState(teacher.offDaysAndLectures);
  console.log(offDaysAndLectures);

  const handleOffLectureChange = (day, selectedLectures) => {
    setOffDaysAndLectures((prevState) =>
      prevState.map((item) =>
        item.day === day
          ? { day: item.day, offLectures: selectedLectures, _id:item._id }
          : item
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    console.log('offDaysAndLectures bs',offDaysAndLectures);
    try {
      await customFetch.patch(`/teachers/${id}`, {
        offDaysAndLectures: offDaysAndLectures,
      });
      // queryClient.invalidateQueries(["teachers"]);

      toast.success("Job edited successfully");
      return redirect(".");
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };



  return (
    <Form method="post" className="form">
      <h5 className="form-title"> محاضرات الحظر </h5>
      <div className="form-center">
        {offDaysAndLectures.map((item, i) => (
          <div key={item.day} className="form-row">
            <MultiSelect
              // className="form-select"
              data={OFF_LECTURES}
              value={offDaysAndLectures[i].offLectures || []}
              label={DAYS_OF_WEEK_AR[i]}
              placeholder={"اختر من القيم التالية"}
              style={{ marginTop: "6px" }}
              defaultValue={
                OFF_LECTURES.filter((val, idx) => {
                  return item?.offLectures?.includes(val.value);
                }) ?? []
              }
              clearable
              id={item.day}
              name={item.day}
              onChange={handleOffLectureChange.bind(null, item.day)} // Bind day to function
            ></MultiSelect>
          </div>
        ))}
        <SubmitBtn formBtn onClick={handleSubmit} />
      </div>
    </Form>
  );
};

// const queryClient = new QueryClient();

const TeacherDetail = () => {
  const id = useLoaderData();
  const {
    data: { teacher },
  } = useQuery(singleJobQuery(id));

  // console.log(teacher);

  const d = {
    mon: [
      { level: "1_level", subject: "math", time: 1 },
      { level: "1_level", subject: "math", time: 2 },
    ],
    wed: [
      { level: "1_level", subject: "math", time: 3 },
      { level: "1_level", subject: "math", time: 4 },
      { level: "1_level", subject: "math", time: 5 },
    ],
  };


  const getKeys = (arr) => {
    let temp = {};
    for (let key = 0; key < arr.length; key++) {
      temp[NUMS_ST[key]] = Object.values(arr[key]).join();
    }
    return temp;
  };

  let days = [];

  Object.keys(d).map((val, idx) => {
    days.push({ day: val, ...getKeys(d[val]), id: val });
  });

  return (
    <Wrapper>
      <h4 style={{ marginBottom: "50px" }} className="form-title">
        تفاصيل المعلم - {teacher.name}
      </h4>

      <OffLectures teacher={teacher} />
      <Section>
        <h5 className="form-title"> جدول المحاضرات </h5>

        {/* <TeacherSchedule cols={cols} data={days} /> */}
      </Section>
    </Wrapper>
  );
};

function getLargestArrayFromObject(obj) {
  // Check if the object is empty
  if (Object.keys(obj).length === 0) {
    return null; // Return null if the object is empty
  }

  // Initialize variables to track the largest array
  let largestArray = [];
  let largestArrayLength = 0;

  // Iterate over each property and its value (array)
  for (const [key, value] of Object.entries(obj)) {
    // Check if the value is an array
    if (Array.isArray(value)) {
      const currentArrayLength = value.length;
      // Update largestArray if current array is longer
      if (currentArrayLength > largestArrayLength) {
        largestArray = value;
        largestArrayLength = currentArrayLength;
      }
    }
  }

  return largestArray;
}
export default TeacherDetail;
