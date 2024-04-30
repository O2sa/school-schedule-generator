import React from "react";

import { IoBarChartSharp } from "react-icons/io5";
import { MdQueryStats } from "react-icons/md";
import { FaWpforms } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { MdAdminPanelSettings } from "react-icons/md";

const links = [
  {
    text: "الجداول",
    path: ".",
    icon: <MdQueryStats />,
  },
  {
    text: "المستويات",
    path: "levels",
    icon: <IoBarChartSharp />,
  },
  {
    text: "المعلمون",
    path: "teachers",
    icon: <ImProfile />,
  },
  {
    text: "الإعدادت",
    path: "school",
    icon: <ImProfile />,
  },
  {
    text: "إدارة المستخدمين",
    path: "admins",
    icon: <ImProfile />,
  },

  // {
  //   text: "add job",
  //   path: "add-job",
  //   icon: <FaWpforms />,
  // },
  // {
  //   text: "all jobs",
  //   path: "all-jobs",
  //   icon: <MdQueryStats />,
  // },
  // {
  //   text: "stats",
  //   path: "stats",
  //   icon: <IoBarChartSharp />,
  // },
  {
    text: "الحساب",
    path: "profile",
    icon: <ImProfile />,
  },
  // {
  //   text: "admin",
  //   path: "admin",
  //   icon: <MdAdminPanelSettings />,
  // },
];

export default links;
