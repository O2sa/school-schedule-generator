import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SchedulesContainer } from "../components";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useContext, createContext } from "react";

export const loader = async () => {
  try {
    const response = await customFetch.get("/schedules");
    return response.data;
  } catch (error) {
    toast.error("You are not authorized to view this page");
    // return redirect('/dashboard');
  }
};

const SchedulesContext = createContext();

export default function Schedules({}) {
  const data = useLoaderData();
  // const transformedData = [];
  // const schedule = d.schedules[0].schedule;
  return (
    <SchedulesContext.Provider value={{ data }}>
    <SchedulesContainer  />
  </SchedulesContext.Provider>
  );
}
export const useSchedulesContext = () => useContext(SchedulesContext);
