import React from "react";
import { MdGrade, MdSchedule } from "react-icons/md";
import { FaChalkboardTeacher, FaRegUserCircle, FaUsers } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";

const links = [
  {
    text: "الجدول الدراسي",
    path: ".",
    icon: <MdSchedule />,
  },
  {
    text: "الصفوف والمراحل",
    path: "levels",
    icon: <MdGrade />,
  },
  {
    text: "المعلمون",
    path: "teachers",
    icon: <FaChalkboardTeacher />,
  },
  {
    text: "إعدادات المدرسة",
    path: "school",
    icon: <IoSettings />,
  },
  {
    text: "إدارة المسؤولين",
    path: "admins",
    icon: <FaUsers />,
  },
  {
    text: "الملف الشخصي",
    path: "profile",
    icon: <FaRegUserCircle />,
  },
];

export default links;
