import { useMemo, useEffect, useState } from "react";
import {
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { toast } from "react-toastify";
import { useLoaderData, useNavigate, useParams ,Link} from "react-router-dom";

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
// import MyTable from "./AdminDetail";

//CREATE hook (post new admin to api)
// function useCreateAdmin() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (admin) => {
//       //send api update request here

//       console.log(admin);
//       try {
//         await customFetch.post("/users/admins", {
//           name: admin.name,
//           workDays: admin.workDays,
//         }); // Adjust this URL as per your API route
//         toast.success("Job edited successfully");
//       } catch (error) {
//         toast.error(error?.response?.data?.msg);
//         return error;
//       }
//     },
//     //client side optimistic update
//     onMutate: (newAdminInfo) => {
//       queryClient.setQueryData(["admins"], (prevAdmins) => [
//         ...prevAdmins,
//         {
//           ...newAdminInfo,
//         },
//       ]);
//     },
//     onSettled: () => queryClient.invalidateQueries({ queryKey: ["admins"] }), //refetch admins after mutation, disabled for demo
//   });
// }

//READ hook (get admins from api)
function useGetAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      //send api request here
      const { data } = await customFetch.get(`/users/admins`); // Adjust this URL as per your API route
      console.log("data", data);
      return data.admins; // Assuming your API response cont
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put admin in api)
function useUpdateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (admin) => {
      //send api update request here
      console.log(admin);
      await customFetch.patch(`/users/admins/${admin._id}`, {
        name: admin.name,
        workDays: admin.workDays,
      }); // Adjust this URL as per your API route
    },
    //client side optimistic update
    onMutate: (newAdminInfo) => {
      queryClient.setQueryData(["admins"], (prevAdmins) =>
        prevAdmins?.map((prevAdmin) =>
          prevAdmin._id === newAdminInfo._id ? newAdminInfo : prevAdmin
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admins"] }), //refetch admins after mutation, disabled for demo
  });
}

//DELETE hook (delete admin in api)
function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adminsId) => {
      //send api update request here
      await customFetch.delete(`/users/admins/${adminsId}`); // Adjust this URL as per your API route
    },
    //client side optimistic update
    onMutate: (adminsId) => {
      queryClient.setQueryData(["admins"], (prevAdmins) =>
        prevAdmins?.filter((admin) => admin._id !== adminsId)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admins"] }), //refetch admins after mutation, disabled for demo
  });
}
const queryClient = new QueryClient();

const AdminsManagement = () => {

 

  // const { mutateAsync: createAdmin, isLoading: isCreatingAdmin } =
  //   useCreateAdmin();


  const {
    data: admins = [],
    isError: isLoadingAdminsError,
    isFetching: isFetchingAdmins,
    isLoading: isLoadingAdmins,
  } = useGetAdmins(); //call READ hook

  //call UPDATE hook
  const { mutateAsync: updateAdmin, isLoading: isUpdatingAdmin } =
    useUpdateAdmin();
  //call DELETE hook
  const { mutateAsync: deleteAdmin, isLoading: isDeletingAdmin } =
    useDeleteAdmin();

  //CREATE action
  const handleCreateAdmin = async ({
    values,
    row,
    table,
    exitCreatingMode,
  }) => {
    await createAdmin(values);
    exitCreatingMode();
  };

  //UPDATE action
  const handleSaveAdmin = async ({ values, row, table }) => {
    console.log("values", values);
    console.log("table", table);
    console.log("row", row.id);

    await updateAdmin({ ...values, _id: row.id });
    table.setEditingRow(null); //exit editing mode
  };
  //DELETE action
  const openDeleteConfirmModal = (row) => deleteAdmin(row.id);

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
        header: "الإيميل",
      },
      {
        id: "_id",
        accessorFn: (row) => row._id,
        enableEditing: false,
        header: "المعرف",
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns: columns,
    data: admins, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableGrouping: true,
    // enablePinning: true,
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
    mantineToolbarAlertBannerProps: isLoadingAdminsError
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
    // onCreatingRowSave: handleCreateAdmin,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveAdmin,
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
      <Link to="new-admin" className="member-btn">
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
      isLoading: isLoadingAdmins,
      isSaving: isUpdatingAdmin || isDeletingAdmin,
      showAlertBanner: isLoadingAdminsError,
      showProgressBars: isFetchingAdmins,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ModalsProvider> */}
      <MantineReactTable table={table} />;{/* </ModalsProvider> */}
    </QueryClientProvider>
  );
};

export default AdminsManagement;
