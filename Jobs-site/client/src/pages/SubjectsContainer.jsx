import { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLoaderData, useParams } from "react-router-dom";

import {
  MantineReactTable,
  // createRow,
  useMantineReactTable,
} from "mantine-react-table";
import {
  ActionIcon,
  Button,
  Flex,
  Text,
  Tooltip,
  MantineProvider,
} from "@mantine/core";

import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import customFetch from "../utils/customFetch";

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      await queryClient.ensureQueryData(useGetSubjects(params.id));
      return params.id;
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      // return redirect('/dashboard/all-jobs');
    }
  };

//CREATE hook (post new subject to api)
function useCreateSubject(newSubject) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subject) => {
      //send api update request here

      // console.log(newSubject);
      try {
        await customFetch.post("/subjects", { ...subject, ...newSubject }); // Adjust this URL as per your API route
        toast.success("Job edited successfully");
      } catch (error) {
        toast.error(error?.response?.data?.msg);
        return error;
      }
    },
    //client side optimistic update
    onMutate: (newSubjectInfo) => {
      queryClient.setQueryData(["subjects"], (prevSubjects) => [
        ...prevSubjects,
        {
          ...newSubjectInfo,
        },
      ]);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }), //refetch subjects after mutation, disabled for demo
  });
}

//READ hook (get subjects from api)
function useGetSubjects(id) {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      //send api request here
      const { data } = await customFetch.get(`/subjects/classSubjects/${id}`); // Adjust this URL as per your API route
      console.log("data", data);
      return data.subjects; // Assuming your API response cont
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put subject in api)
function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subject) => {
      //send api update request here
      console.log(subject);
      await customFetch.patch(`/subjects/${subject._id}`, subject); // Adjust this URL as per your API route
    },
    //client side optimistic update
    onMutate: (newSubjectInfo) => {
      queryClient.setQueryData(["subjects"], (prevSubjects) =>
        prevSubjects?.map((prevSubject) =>
          prevSubject._id === newSubjectInfo._id ? newSubjectInfo : prevSubject
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }), //refetch subjects after mutation, disabled for demo
  });
}

//DELETE hook (delete subject in api)
function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subjectsId) => {
      //send api update request here
      await customFetch.delete(`/subjects/${subjectsId}`); // Adjust this URL as per your API route
    },
    //client side optimistic update
    onMutate: (subjectsId) => {
      queryClient.setQueryData(["subjects"], (prevSubjects) =>
        prevSubjects?.filter((subject) => subject._id !== subjectsId)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }), //refetch subjects after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const SubjectsContainer = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  useEffect(() => {
    // Fetch state options from API
    const fetchTeacherOptions = async () => {
      try {
        const response = await customFetch.get("/teachers"); // Adjust this URL as per your API route
        // console.log(response.data);
        setTeacherOptions(response.data.teachers); // Store fetched state options in state
      } catch (error) {
        console.error("Error fetching state options:", error);
      }
    };
    fetchTeacherOptions();
  }, []); // Fetch data only once when component mounts

  //call READ hook
  const id = useLoaderData();
  const newSubject = { teacher: selectedTeacher, level: id };
  //call CREATE hook
  const { mutateAsync: createSubject, isLoading: isCreatingSubject } =
    useCreateSubject(newSubject);
  console.log();
  const {
    data: subjects = [],
    isError: isLoadingSubjectsError,
    isFetching: isFetchingSubjects,
    isLoading: isLoadingSubjects,
  } = useGetSubjects(id); //call READ hook

  //call UPDATE hook
  const { mutateAsync: updateSubject, isLoading: isUpdatingSubject } =
    useUpdateSubject();
  //call DELETE hook
  const { mutateAsync: deleteSubject, isLoading: isDeletingSubject } =
    useDeleteSubject();

  //CREATE action
  const handleCreateSubject = async ({
    values,
    row,
    table,
    exitCreatingMode,
  }) => {
    // console.log(values.original._id);
    // const newValidationErrors = validateSubject(values);
    // if (Object.values(newValidationErrors).some((error) => error)) {
    //   setValidationErrors(newValidationErrors);
    //   return;
    // }
    setValidationErrors({});
    await createSubject(values);
    exitCreatingMode();
  };

  //UPDATE action
  const handleSaveSubject = async ({ values, row, table }) => {
    console.log("values", values);
    console.log("table", table);
    console.log("row", row.id);
    // console.log(row._id)
    // const newValidationErrors = validateSubject(values);
    // if (Object.values(newValidationErrors).some((error) => error)) {
    //   setValidationErrors(newValidationErrors);
    //   return;
    // }
    setValidationErrors({});
    await updateSubject({ ...values, _id: row.id });
    table.setEditingRow(null); //exit editing mode
  };
  //DELETE action
  const openDeleteConfirmModal = (row) => deleteSubject(row.id);

  const columns = useMemo(
    () => [
      {
        id: "index", // Use "index" as the accessor key
        enableEditing: false,
        // accessorKey: "_id",
        accessorFn: (row, rowIndex) => rowIndex + 1,
        header: "#", // Header label for the index column
      },
      {
        accessorKey: "name",
        header: "المادة",
        mantineEditTextInputProps: {
          // type: "email",
          required: true,
          error: validationErrors?.name,
          //remove any previous validation errors when subject focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: "weeklyLectures",
        header: "المحاضرات الأسبوعية",
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          error: validationErrors?.weeklyLectures,
          //remove any previous validation errors when subject focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              weeklyLectures: undefined,
            }),
        },
      },
      {
        accessorKey: "teacher.name",
        header: "معلم المادة",
        editVariant: "select",
        mantineEditSelectProps: {
          data: teacherOptions.map((teacher) => ({
            value: teacher._id,
            label: teacher.name,
          })),
          value: selectedTeacher,
          onChange: (value) => setSelectedTeacher(value),
          error: validationErrors?.teacher,
        },
      },
    ],
    [validationErrors]
  );
  const table = useMantineReactTable({
    columns,
    data: subjects,
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableEditing: true,
    getRowId: (row) => row._id,
    mantineToolbarAlertBannerProps: isLoadingSubjectsError
      ? {
          color: "red",
          children: "خطأ في تحميل البيانات",
        }
      : undefined,
    mantineTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSubject,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSubject,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="تعديل">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="حذف">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        className="btn edit-btn"
        style={{ backgroundColor: "var(--primary-500)" }}
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        إضافة مادة
      </Button>
    ),
    state: {
      isLoading: isLoadingSubjects,
      isSaving: isCreatingSubject || isUpdatingSubject || isDeletingSubject,
      showAlertBanner: isLoadingSubjectsError,
      showProgressBars: isFetchingSubjects,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <MantineReactTable table={table} />
        </ModalsProvider>
    </QueryClientProvider>
  );
};

export default SubjectsContainer;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

function validateSubject(subject) {
  return {
    // firstName: !validateRequired(subject.name)
    //   ? "First Name is Required"
    //   : "",
    // lastName: !validateRequired(subject.lastName)
    //   ? "Last Name is Required"
    //   : "",
    // email: !validateEmail(subject.email) ? "Incorrect Email Format" : "",
  };
}
