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
  Badge,
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
import { WEEK_DAYS } from "../../../utils/constants";
import {
  useCreateElement,
  useDeleteElement,
  useGetElements,
  useUpdateElement,
} from "../utils/crud";

const Teachers = ({ queryClient }) => {
  //call CREATE hook

  // const { mutateAsync: createTeacher, isLoading: isCreatingTeacher } =
  //   useCreateElement(["teachers"]);

  const {
    data: teachers = [],
    isError: isLoadingTeachersError,
    isFetching: isFetchingTeachers,
    isLoading: isLoadingTeachers,
  } = useQuery(useGetElements(["teachers"])); //call READ hook

  //call UPDATE hook
  const { mutateAsync: updateTeacher, isLoading: isUpdatingTeacher } =
    useUpdateElement(["teachers"]);
  //call DELETE hook
  const { mutateAsync: deleteTeacher, isLoading: isDeletingTeacher } =
    useDeleteElement(["teachers"]);

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
    console.log("values", values);
    await updateTeacher({
      name: values.name,
      email: values.email,
      workDays: Number(values.workDays),
      _id: row.id,
    });

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
        accessorKey: "stage",
        enableClickToCopy: false,
        header: "المرحلة ",
      },
      // {
      //   accessorKey: "email",
      //   enableClickToCopy: true,
      //   header: "الأيميل",
      //   enableEditing: false,
      // },
      {
        accessorKey: "workDays",
        enableClickToCopy: true,
        header: "أيام العمل",
      },

      {
        id: "subjects",
        accessorFn: (row) =>
          row.subjects?.map((sub) => (
            <Badge>{`${sub.name} - ${sub.level.name} - ${sub.weeklyLectures}`}</Badge>
          )) || 0,
        enableEditing: false,
        header: "المواد",
      },
      {
        id: "offDaysAndLectures",
        enableEditing: false,
        accessorFn: (row) =>
          row.offDaysAndLectures?.map((day) =>
            day?.offLectures?.length > 0 ? (
              <Badge>
                {WEEK_DAYS[day.day]}:{" "}
                {day?.offLectures.map((lec) => `${lec + 1} `)}
              </Badge>
            ) : (
              ""
            )
          ),
        header: "أيام الحظر",
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
  const [sorting, setSorting] = useState([{ id: "stage", desc: true }]);
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
    initialState: {
      columnVisibility: { description: false },
      density: "xs",
      showGlobalFilter: true,
      sorting: [{ id: "stage", desc: true }],
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    // mantinePaginationProps: {
    //   radius: "xl",
    //   size: "lg",
    // },
    mantineToolbarAlertBannerProps: isLoadingTeachersError
      ? {
          color: "red",
          children: "خطأ في تحميل البيانات",
        }
      : undefined,

    // onCreatingRowCancel: () => setValidationErrors({}),
    // onCreatingRowSave: handleCreateTeacher,
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
      isSaving: isUpdatingTeacher || isDeletingTeacher,
      showAlertBanner: isLoadingTeachersError,
      showProgressBars: isFetchingTeachers,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ModalsProvider> */}
      <MantineReactTable table={table} />
      {/* </ModalsProvider> */}
    </QueryClientProvider>
  );
};

export default Teachers;
