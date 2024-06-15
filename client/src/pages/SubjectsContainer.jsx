import { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useLoaderData, useParams } from "react-router-dom";

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
  Modal,
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
import { useDisclosure } from "@mantine/hooks";
import { FormRow, SubmitBtn } from "../components";

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

//READ hook (get subjects from api)
function useGetSubjects(id) {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: async () => {
      //send api request here
      const { data } = await customFetch.get(`/subjects/level-subjects/${id}`);
      console.log("data", data);
      return data.subjects;
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put subject in api)
function useUpdateSubject(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subject) => {
      //send api update request here
      console.log(subject);
      await customFetch.patch(`/subjects/${subject._id}`, {
        ...subject,
        teacher: subject.teacher._id,
      });
    },
    //client side optimistic update
    onMutate: (newSubjectInfo) => {
      queryClient.setQueryData(["subjects", id], (prevSubjects) =>
        prevSubjects?.map((prevSubject) =>
          prevSubject._id === newSubjectInfo._id ? newSubjectInfo : prevSubject
        )
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["subjects", id] }),
  });
}

//DELETE hook (delete subject in api)
function useDeleteSubject(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subjectsId) => {
      //send api update request here
      await customFetch.delete(`/subjects/${subjectsId}`); // Adjust this URL as per your API route
    },
    //client side optimistic update
    onMutate: (subjectsId) => {
      queryClient.setQueryData(["subjects", id], (prevSubjects) =>
        prevSubjects?.filter((subject) => subject._id !== subjectsId)
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["subjects", id] }), //refetch subjects after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const SubjectsContainer = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [opened, { open, close }] = useDisclosure(false);

  //call READ hook
  const id = useLoaderData();

  console.log();
  const {
    data: subjects = [],
    isError: isLoadingSubjectsError,
    isFetching: isFetchingSubjects,
    isLoading: isLoadingSubjects,
  } = useGetSubjects(id); //call READ hook

  //call UPDATE hook
  const { mutateAsync: updateSubject, isLoading: isUpdatingSubject } =
    useUpdateSubject(id);
  //call DELETE hook
  const { mutateAsync: deleteSubject, isLoading: isDeletingSubject } =
    useDeleteSubject(id);

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
    await updateSubject({ ...values, _id: row.id, level: id });
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
        accessorKey: "teacher", // Still required for internal table management
        Cell: ({ cell }) => {
          // console.log("cell", cell);
          // console.log("value", cell.value);
          // console.log("teacher", cell.getValue());
          return cell.getValue()?.name;
        }, // Display teacher name in the cell
        header: "معلم المادة", // Header text
        enableEditing: false,
      },
    ],

    [validationErrors]
  );
  const table = useMantineReactTable({
    columns,
    data: subjects || [],
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
    // onCreatingRowCancel: () => setValidationErrors({}),
    // onCreatingRowSave: handleCreateSubject,
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
      <Link to="add-subject" className="member-btn">
        <Button
          className="btn edit-btn"
          style={{ backgroundColor: "var(--primary-500)" }}
          // onClick={() => {
          //   handleClick;
          // }}
        >
          إضافة مدير
        </Button>
      </Link>
    ),
    state: {
      isLoading: isLoadingSubjects,
      isSaving: isUpdatingSubject || isDeletingSubject,
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
