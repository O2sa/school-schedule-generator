import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useContext, createContext } from "react";
import { MantineProvider } from "@mantine/core";

import {
  MantineReactTable,
  // createRow,
} from "mantine-react-table";

export default function Schedule({ _id, schedule = {} }) {
  const daysEn = [
    "السبت",
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
  ];


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

  const columns = useMemo(() => colms, []);

  const [tableData, setTableData] = useState(schedule.schedule);
  const handleSaveRow = async ({ table, row, values }) => {
    delete values.index;
    let tempArr = tableData;
    tempArr[row.index] = values;
    try {
      await customFetch.patch(`/schedules/${schedule._id}`, {
        schedule: tempArr,
      });
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

  return (
      <MantineReactTable
        columns={columns}
        data={tableData}
        editDisplayMode="row" //default
        enableEditing
        onEditingRowSave={handleSaveRow}
        enableBottomToolbar={false}
      />
  );
}
