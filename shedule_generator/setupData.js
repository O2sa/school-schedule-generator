import Teacher from "../models/TeacherModel.js";
import Subject from "../models/SubjectModel.js";
import Level from "../models/LevelModel.js";
import Schedule from "../models/ScheduleModel.js";
import School from "../models/SchoolModel.js";
import { DAYS_OF_WEEK_EN } from "../utils/constants.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
await mongoose.connect(
  "mongodb+srv://osama:2xhUSV7GXYU40pwn@expressnodejsprojects.e9u9qiv.mongodb.net/school_scheduler?retryWrites=true&w=majority"
);
// import {
//   leveles,
//   subjects,
//   daysOfWeek,
//   teachers,
//   schoolData,
// } from "./mockData.js";

export const getTeacherSubjects = async (teacherId) => {
  const subjects = await Subject.find({ teacher: teacherId });
  return subjects;
};

export const getAllTeachers = async (schoolId) => {
  const teachers = await Teacher.find({ school: schoolId }).populate(
    "subjects"
  );
  return teachers;
};
export const getAllLevels = async (schoolId) => {
  const levels = await Level.find({ school: schoolId });

  return levels;
};

export const getLevelSubjects = async (levelId) => {
  const subjects = await Level.find({ level: levelId });

  return subjects;
};
export const getSchoolInfo = async (schoolId) => {
  const schoolData = await School.findById(schoolId);

  return schoolData;
};

export const getWeekDays = () => {
  return DAYS_OF_WEEK_EN;
};

export function getLevelLecturesPerDay() {
  let levels = getAllLevels();
  let levelsLecturesPerDay = {};
  for (const level of leveles) {
    let temp = {};

    levelsLecturesPerDay[level.id] = new Array(6).fill(0);
  }
  return levelsLecturesPerDay;
}


