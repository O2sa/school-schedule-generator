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
  Anchor,
} from "@mantine/core";
import { IconUserCircle, IconSend } from "@tabler/icons-react";
import { data } from "./makeData";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import customFetch from "../utils/customFetch";

import { IconEdit, IconTrash } from "@tabler/icons-react";
// import MyTable from "./TeacherDetail";

//CREATE hook (post new teacher to api)
function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teacher) => {
      //send api update request here

      console.log(teacher);
      try {
        await customFetch.post("/teachers", {
          name: teacher.name,
          workDays: teacher.workDays,
        }); // Adjust this URL as per your API route
        toast.success("Job edited successfully");
      } catch (error) {
        toast.error(error?.response?.data?.msg);
        return error;
      }
    },
    //client side optimistic update
    onMutate: (newTeacherInfo) => {
      queryClient.setQueryData(["teachers"], (prevTeachers) => [
        ...prevTeachers,
        {
          ...newTeacherInfo,
        },
      ]);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["teachers"] }), //refetch teachers after mutation, disabled for demo
  });
}

//READ hook (get teachers from api)
function useGetTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      //send api request here
      const { data } = await customFetch.get(`/teachers`); // Adjust this URL as per your API route
      console.log("data", data);
      return data.teachers; // Assuming your API response cont
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put teacher in api)
function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teacher) => {
      //send api update request here
      console.log(teacher);
      await customFetch.patch(`/teachers/${teacher._id}`, {
        name: teacher.name,
        workDays: teacher.workDays,
      }); // Adjust this URL as per your API route
    },
    //client side optimistic update
    onMutate: (newTeacherInfo) => {
      queryClient.setQueryData(["teachers"], (prevTeachers) =>
        prevTeachers?.map((prevTeacher) =>
          prevTeacher._id === newTeacherInfo._id ? newTeacherInfo : prevTeacher
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["teachers"] }), //refetch teachers after mutation, disabled for demo
  });
}

//DELETE hook (delete teacher in api)
function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teachersId) => {
      //send api update request here
      await customFetch.delete(`/teachers/${teachersId}`); // Adjust this URL as per your API route
    },
    //client side optimistic update
    onMutate: (teachersId) => {
      queryClient.setQueryData(["teachers"], (prevTeachers) =>
        prevTeachers?.filter((teacher) => teacher._id !== teachersId)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["teachers"] }), //refetch teachers after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const Teachers = () => {
  //call CREATE hook

  const { mutateAsync: createTeacher, isLoading: isCreatingTeacher } =
    useCreateTeacher();
  const {
    data: teachers = [],
    isError: isLoadingTeachersError,
    isFetching: isFetchingTeachers,
    isLoading: isLoadingTeachers,
  } = useGetTeachers(); //call READ hook

  //call UPDATE hook
  const { mutateAsync: updateTeacher, isLoading: isUpdatingTeacher } =
    useUpdateTeacher();
  //call DELETE hook
  const { mutateAsync: deleteTeacher, isLoading: isDeletingTeacher } =
    useDeleteTeacher();

  //CREATE action
  const handleCreateTeacher = async ({
    values,
    row,
    table,
    exitCreatingMode,
  }) => {
    await createTeacher(values);
    exitCreatingMode();
  };

  //UPDATE action
  const handleSaveTeacher = async ({ values, row, table }) => {
   

    await updateTeacher({ ...values, _id: row.id });
    table.setEditingRow(null); //exit editing mode
  };



  //DELETE action
  const openDeleteConfirmModal = (row) => deleteTeacher(row.id);

  const columns = useMemo(
    () => [
      {
        id: "index", // Use "index" as the accessor key
        enableEditing: false,
        accessorFn: (row, rowIndex) => rowIndex + 1,
        header: "#", // Header label for the index column
      },
      {
        accessorFn: (row) => `${row.name}`,
        id: "name",
        header: "الأسم",
        // filterVariant: 'autocomplete',
        // Cell: ({ renderedCellValue, row }) => (
        //   <Box
        //     sx={{
        //       display: "flex",
        //       alignItems: "center",
        //       gap: "16px",
        //     }}
        //   >
        //     <img
        //       alt="avatar"
        //       height={30}
        //       src={row.original.avatar}
        //       style={{ borderRadius: "50%" }}
        //     />
        //     <span>{renderedCellValue}</span>
        //   </Box>
        // ),
      },
      {
        accessorKey: "email", //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        enableClickToCopy: true,
        header: "الأيميل",
        enableEditing: false,
      },
      {
        accessorKey: "workDays", //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        enableClickToCopy: true,
        header: "أيام العمل",
      },      {
        accessorKey: "stage", //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        enableClickToCopy: false,
        header: "المرحلة ",
      },
      {
        id: "subjects",
        accessorFn: (row) => row.subjects?.length || 0,
        enableEditing: false,
        header: "المواد",
      },
      {
        id: "offDaysAndLectures",
        enableEditing: false,

        accessorFn: (row) =>
          row.offDaysAndLectures
            ? Object.keys(row.offDaysAndLectures).join(" ")
            : "لم يحدد",
        //hey a simple column for once
        header: "أيام الحظر",
        // Edit: ()=>MultiChoiceCell(),
      },
      {
        id: "details",
        enableEditing: false,
        //hey a simple column for once
        header: "التفاصيل",
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Link to={"teacher-details/" + row.original._id}>
              <Anchor
                // href="https://mantine.dev/"
                // target="_blank"
                // underline="always"
              >
                استعراض التفاصيل
              </Anchor>
            </Link>
          </Box>
        ),
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns: columns,
    data: teachers, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enablePinning: true,
    enableEditing: true,
    editDisplayMode: "row",
    enableRowActions: true,
    getRowId: (row) => row._id,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "lg",
    },
    mantineToolbarAlertBannerProps: isLoadingTeachersError
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
    onCreatingRowSave: handleCreateTeacher,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveTeacher,
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
      <Link to={"add-teacher"}>
        <Button
          className="btn edit-btn"
          style={{ backgroundColor: "var(--primary-500)" }}
          onClick={() => {}}
        >
          إضافة معلم
        </Button>
      </Link>
    ),
    renderRowActionMenuItems: ({ row }) => (
      <Box>
        <ActionIcon onClick={() => console.info("Edit")}>
          <IconEdit />
        </ActionIcon>
        <ActionIcon onClick={() => console.info("Delete")}>
          {/* <DeleteI /> */}
        </ActionIcon>
      </Box>
    ),
    state: {
      isLoading: isLoadingTeachers,
      isSaving: isCreatingTeacher || isUpdatingTeacher || isDeletingTeacher,
      showAlertBanner: isLoadingTeachersError,
      showProgressBars: isFetchingTeachers,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ModalsProvider> */}
      <MantineReactTable table={table} />;{/* </ModalsProvider> */}
    </QueryClientProvider>
  );
};

export default Teachers;
