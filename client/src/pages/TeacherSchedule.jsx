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
import { Link, redirect, useLoaderData, useParams } from "react-router-dom";

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
import { NUMS_ST } from "../../../utils/constants";

function useUpdateSchedule(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (days) => {
      //send api update request here
      //   await customFetch.patch(`/teachers/cancel-day${teacher._id}`, days); // Adjust this URL as per your API route
      console.log("done");
      console.log(days, id);
    },
    //client side optimistic update
    onMutate: (canceledDay) => {
      queryClient.setQueryData(["cancel-day", id], (prevTeachers) => {
        console.log(prevTeachers);
        return prevTeachers?.filter(
          (subject) => !canceledDay.incldues(subject.day)
        );
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["cancel-day", id] }), //refetch teachers after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();
const TeacherSchedule = ({ data, cols }) => {
  //call CREATE hook
  const id = useLoaderData();

  const [selectedRow, setSelectedRow] = useState(null);
  const [days, setDays] = useState(data);

  // const {
  //   data: teachers = [],
  //   isError: isLoadingTeachersError,
  //   isFetching: isFetchingTeachers,
  //   isLoading: isLoadingTeachers,
  // } = useGetTeachers(); //call READ hook

  //call UPDATE hook
  const { mutateAsync: updateSchedule, isLoading: isDeleting } =
    useUpdateSchedule(id);
  //call DELETE hook

  const handleCancelLectures = async (d) => {
    const sele = Object.keys(d);
    console.log("days", days);
    updateSchedule(days);
    setDays(days?.filter((f) => !sele.includes(f.day)));
  };
  console.log(selectedRow);

  const columns = useMemo(() => [...cols], []);

  const table = useMantineReactTable({
    columns: columns,
    data: days, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    // enablePinning: true,
    enableSelectAll: false,
    enableRowSelection: true,
    getRowId: (row) => row.day,

    // onS: (row) => {
    //     setSelectedRow(row);
    //   },
    renderBottomToolbarCustomActions: ({ table }) => (
      <Button
        color="blue"
        onClick={() => {
          handleCancelLectures(table.getState().rowSelection);
          //   setSelectedRow(table.getState().rowSelection)
        }}
        // disabled={!selectedRow}
        // loading={isUpdatingUser}
      >
        Save
      </Button>
    ),
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "lg",
    },
    // mantineToolbarAlertBannerProps: isLoadingTeachersError
    // ? {
    //     color: "red",
    //     children: "خطأ في تحميل البيانات",
    //   }
    // : undefined,
    mantineTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },

    // onCreatingRowCancel: () => setValidationErrors({}),
    // onEditingRowCancel: () => setValidationErrors({}),
    // onEditingRowSave: handleSaveTeacher,
    // renderRowActionMenuItems: ({ row }) => (
    //   <Box>

    // </Box>
    // ),
    state: {
      //   isLoading: is,
      isSaving: isDeleting,
      //   showProgressBars: isFetchingTeachers,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ModalsProvider> */}
      <MantineReactTable table={table} />;{/* </ModalsProvider> */}
    </QueryClientProvider>
  );
};

export default TeacherSchedule;
