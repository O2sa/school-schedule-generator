import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useContext, createContext } from "react";
import {
  ActionIcon,
  Button,
  Flex,
  MantineProvider,
  Tooltip,
} from "@mantine/core";

import {
  MantineReactTable,
  useMantineReactTable,
  // createRow,
} from "mantine-react-table";
import { ConnectionStates } from "mongoose";
import { IconEdit, IconTrash } from "@tabler/icons-react";

export default function Schedule({ data }) {
  const daysEn = [
    "السبت",
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
  ];

  const { level, schedule, columns, rows } = data;

  // const transformedData = [];
  // for (let i = 0; i < schedule.length; i++) {
  //   let tempObj = {};
  //   for (let h = 0; h < schedule.length; h++) {
  //     tempObj[daysEn[h]] = schedule[i][h];
  //   }
  //   transformedData.push(tempObj);
  // }

  let colms = [];
  colms.push({
    id: "index",
    enableEditing: false,
    accessorFn: (row, rowIndex) => rowIndex + 1,
    header: "#",
  });
  colms = [
    ...colms,
    ...daysEn.map((titl, idx) => ({
      accessorKey: `${idx}`,
      header: daysEn[idx],
    })),
  ];

  const cols = useMemo(() => columns, []);

  const [tableData, setTableData] = useState(rows);

  const getSubIds = (subs) => {
    let temp = [];
    // con
    for (const sub in subs) {
      if (sub == "day" || sub == "id") continue;
      temp.push(subs[sub].split(",")[2]);
    }

    return temp;
  };

  const handleSaveRow = async ({ table, row, values }) => {
    delete values.index;
    delete values.day;
    let tempArr = tableData;
    tempArr[row.index] = values;

    const upArr = tempArr.map((r) => {
      console.log("r", r);
      return getSubIds(r);
    });

    console.log("upArr", upArr);
    console.log("tempArr", tempArr);

    console.log("values", values);
    console.log("table", table);
    console.log("row", row);
    try {
      // await customFetch.patch(`/schedules/${schedule._id}`, {
      //   schedule: tempArr,
      // });
      setTableData([...tempArr]);
      toast.success("تم تعديل الجدول بنجاح ");
      table.setEditingRow(null); //exit editing mode
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }

    // console.log("tableData", tableData);
    // console.log("row", row);
    // console.log("values", values);
  };

  const table = useMantineReactTable({
    columns: cols,
    data: tableData,
    editDisplayMode: "row", //default
    enableEditing: true,
    onEditingRowSave: handleSaveRow,
    enableBottomToolbar: true,
    enableRowActions: true,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
  });
  return <MantineReactTable table={table} />;
}
