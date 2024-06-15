import React from "react";

import { IoBarChartSharp, IoSettings } from "react-icons/io5";
import { MdAccountBox, MdGrade, MdQueryStats, MdSchedule } from "react-icons/md";
import { FaChalkboardTeacher, FaRegUserCircle, FaUsers, FaWpforms } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { MdAdminPanelSettings } from "react-icons/md";

const links = [
  {
    text: "الجداول",
    path: ".",
    icon: <MdSchedule />,
  },
  {
    text: "المستويات",
    path: "levels",
    icon: <MdGrade />,
  },
  {
    text: "المعلمون",
    path: "teachers",
    icon: <FaChalkboardTeacher />,
  },
  {
    text: "الإعدادت",
    path: "school",
    icon: <IoSettings />,
  },
  {
    text: "إدارة المستخدمين",
    path: "admins",
    icon: <FaUsers />,
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
    icon: <FaRegUserCircle />,
  },
  // {
  //   text: "admin",
  //   path: "admin",
  //   icon: <MdAdminPanelSettings />,
  // },
];

export default links;
