import Teacher from "../models/TeacherModel.js";
import Subject from "../models/SubjectModel.js";
import Level from "../models/LevelModel.js";
import Schedule from "../models/ScheduleModel.js";
import School from "../models/SchoolModel.js";
import { DAYS_OF_WEEK_EN } from "../utils/constants.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { getLargestPropertyValue } from "./utils.js";
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

export const initialData = async (schoolInfo, stage) => {
  //intialize the levels schedules
  const tempTeachers = await Teacher.find({
    school: schoolInfo._id,
    stage: stage,
    subjects: { $ne: [] },
  }).populate("subjects");

  const teachers = {};
  tempTeachers.forEach((tea) => (teachers[tea._id] = tea));
  // const subjects = await Subject.find();

  const levels = await Level.find({
    school: schoolInfo._id,
    stage: stage,
    subjects: { $ne: [] },
  }).populate("subjects");

  if (!levels || !teachers) return "invalid";

  // if (levels.length == 0) return "invalid";

  let subjects = [];
  for (const level of levels) {
    subjects = subjects.concat(level.subjects);
  }
  // get teachers lectures
  // let teachersLectures = {};
  // let teachersScheduleInfo = {};
  // teachers.forEach((ele) => {
  //   teachersLectures[`${ele.id}`] = distributeTeacherLectures(ele);
  //   teachersScheduleInfo[ele.id] = {
  //     goldenDay: false,
  //     days: {},
  //   };
  // });

  return {
    teachers,
    levels,
    subjects,
  };
};

export function initialSchedules(schoolInfo, levels, teachers) {
  let levelsSchedule = {};
  let teachersSchedule = {};

  // let teachers = await getAllTeachers(schoolId);
  // console.log("schoolInfo", schoolInfo);
  const largestLevel = getLargestPropertyValue(levels, "dailyLectures");
  for (let key in levels) {
    let tempArr = Array.from({ length: schoolInfo.workDays }, () =>
      Array(levels[key].dailyLectures).fill(null)
    );

    // console.log("level", levels[key]);

    levelsSchedule[levels[key]._id] = tempArr;
  }

  for (let key in teachers) {
    let tempArr = Array.from({ length: schoolInfo.workDays }, () =>
      Array(largestLevel).fill(null)
    );
    teachersSchedule[teachers[key]._id] = tempArr;
  }

  return {
    levelsSchedule,
    teachersSchedule,
  };
}
export function generateTeachersSchedules(teachersSchedule, levelsSchedule, subjects) {
  for (const levelSchedule in levelsSchedule) {
    for (const day in levelsSchedule[levelSchedule]) {
      for (const lecture in levelsSchedule[levelSchedule][day]) {
        const currLec = levelsSchedule[levelSchedule][day][lecture];
        const subject = subjects?.find((sub) => sub._id == currLec);
        if (subject) teachersSchedule[subject.teacher][day][lecture] = currLec;
      }
    }
  }
}



export async function saveSchedules(levelsSchedule, teachersSchedule) {
  for (const levelSchedule in levelsSchedule) {
    const schedule = await Schedule.findOneAndUpdate(
      { ownerId: levelSchedule },
      { schedule: levelsSchedule[levelSchedule] }
    );
  }


  for (const teacherSchedule in teachersSchedule) {
    const schedule = await Schedule.findOneAndUpdate(
      { ownerId: teacherSchedule },
      { schedule: teachersSchedule[teacherSchedule] }
    );
  }
}



