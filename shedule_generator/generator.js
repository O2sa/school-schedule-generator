// import {
//   getAllLevels,
//   getAllTeachers,
//   getLevelLecturesPerDay,
//   getSchoolInfo,
//   getTeacherSubjects,
//   getWeekDays,
//   initialData,
// } from "./setupData.js";
import distributeTeacherLectures from "./teacherLectures.js";
import _, { includes } from "lodash-es";
import {
  allElementsDifferent,
  countLevelLectures,
  getAllArrayCombinations,
  getAllCombinations,
  getElementById,
  getElementsByIds,
  getElementsByKeys,
  getLargestPropertyValue,
  getMatrixWithDifferentNumbers,
  getPermutations,
  getRandomInt,
  getSmallestPropertyValue,
  getTeachersByUnavailableDay,
  permutationsGenerator,
  saveDataToFile,
  shuffle,
  shuffleObject,
  sortByLengthRef,
  getAllCombinationsGenerator,
  cleanTheDay,
  getWeekDays,
} from "./utils.js";

// import { checkAvaliableOrderAndAllocat } from "./generator.js";
import { daysOfWeek, subjects, teachers } from "./mockData.js";
import {
  checkNumOfEmptySlots,
  clearCombinations,
  copyLevelsDay,
  countEveryLevel,
  countLeveles,
  getLargestEmptyDay,
  getLevelsDailyLectures,
  getLevelsTotalLecturs,
  getTeacherAverageLectures,
  getTeacherDayByLength,
  getTeachersLevels,
  getTeachersOrderedByOffLectures,
  groupTeachersByLevels,
  groupTeachersByUnavailableDays,
  isBlockedTeacherDay,
  setupTeachersLectures,
  validateLevelsLectures,
} from "./helpers.js";

import Teacher from "../models/TeacherModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Subject from "../models/SubjectModel.js";
import Level from "../models/LevelModel.js";
import Schedule from "../models/ScheduleModel.js";
import School from "../models/SchoolModel.js";
import getDaysWithFullLectures from "./daysFuller.js";

import { generateTeachersSchedules, getAllLevels, getSchoolInfo, initialData, initialSchedules, saveSchedules } from "./setupData.js";
import { DAYS_OF_WEEK_EN, WEEK_DAYS } from "../utils/constants.js";
import { checkAvaliableOrderAndAllocat, setupGoldenDays, testAllOrders } from "./dayAllocat.js";

// dotenv.config();

// await mongoose.connect(
//   "mongodb+srv://osama:2xhUSV7GXYU40pwn@expressnodejsprojects.e9u9qiv.mongodb.net/school_scheduler?retryWrites=true&w=majority"
// );

async function generateGroupSchedules(schoolInfo, teachers, levels, subjects) {
  const {
    averageOfDailyLectures,
    levelsDailyLectures,
    levelsTotalLectures,
    teachersLectures,
    teachersOffDays,
  } = setupStageData(schoolInfo, levels, teachers);

  let { levelsSchedule, teachersSchedule } = initialSchedules(
    schoolInfo,
    levels,
    teachers
  );

  const { levelsPerDay, teachersKeys, teachersLectures_all } =
    setupTeachersLectures(teachersLectures);

  let usedDays = {};
  let daysLectures = {};

  for (let i = 0; i < schoolInfo.workDays; i++) {
    usedDays[schoolInfo.schoolWeekDays[i]] = new Set();
    daysLectures[schoolInfo.schoolWeekDays[i]] = [];
  }

  const teachersWithFullWorkDays = [];
  for (const te in teachersKeys) {
    if (teachersKeys[te].length == schoolInfo.workDays)
      teachersWithFullWorkDays.push(te);
  }
  // console.log("teachersWithFullWorkDays", teachersWithFullWorkDays);

  let bestRes = { counter: 0 };

  // for (let i = 0; i < 100; i++) {
  for (const perm of permutationsGenerator(Object.keys(teachersLectures))) {
    let currentTeachersLectures = {};

    perm.forEach(
      (val) =>
        (currentTeachersLectures[val] = JSON.parse(
          JSON.stringify(teachersLectures[val])
        ))
    );

    // const tempTeachersLectures={...currentTeachersLectures}
    const tempTeachersKeys = _.cloneDeep(teachersKeys);
    let tempUsedDays = _.cloneDeep(usedDays);
    const tempdaysLectures = _.cloneDeep(daysLectures);
    const tempLevelsSchedule = _.cloneDeep(levelsSchedule);

    // setupGoldenDays(
    //   // _.cloneDeep(shuffleObject(teachersLectures)),
    //   currentTeachersLectures,
    //   tempTeachersKeys,
    //   tempLevelsSchedule,
    //   schoolInfo,
    //   teachers,
    //   tempUsedDays,
    //   tempdaysLectures,
    //   averageOfDailyLectures
    // );

    // console.log('tempLevelsSchedule',tempLevelsSchedule)
    // console.log('tempdaysLectures',tempdaysLectures)

    const result = testAllOrders(
      {
        levelsPerDay: levelsPerDay,
        teachersLectures_all: teachersLectures_all,
        teachersOffDays: teachersOffDays,
        averageOfDailyLectures: averageOfDailyLectures,
        daysLectures: tempdaysLectures,
        usedDays: tempUsedDays,
        levelsDailyLectures: levelsDailyLectures,
        teachersKeys: tempTeachersKeys,
        levelsSchedule: tempLevelsSchedule,
        teachersWithFullWorkDays: teachersWithFullWorkDays,
      },
      schoolInfo,
      teachers
    );

    // // console.log(result);
    if (result.valid) {
      bestRes = result;
      break;
    }
    console.log("best result", result);

    // if (result.counter > bestRes.counter) bestRes = result;
  }

  console.log("best result", bestRes);
  console.log("best result", bestRes.schedules);

  // if (bestRes.valid) {
  //   generateTeachersSchedules(teachersSchedule, bestRes.schedules, subjects);
  //   await saveSchedules(bestRes.schedules, teachersSchedule);
  // }

  // console.log("soleve", bestRes.solveCombination);
  // console.log("soleve", bestRes.solveCombination.schedules);
  // let j = [];
  // for (const key in bestRes.teachersKeys) {
  //   j = [...j, ...bestRes.teachersKeys[key]];
  // }

  // let lastDay = {};
  // for (const day in teachersLectures_all) {
  //   if (!j.includes(day)) lastDay[day] = teachersLectures_all[day];
  // }
  // console.log("f", j);
  // const teke = getLevelsCounts(
  //   Object.keys(lastDay),
  //   levelsPerDay,
  //   levelsDailyLectures
  // );
  // console.log(teke);
}

function setupStageData(schoolInfo, levels, teachers) {
  const levelsDailyLectures = getLevelsDailyLectures(levels);
  const averageOfDailyLectures = getSmallestPropertyValue(
    levels,
    "dailyLectures"
  );
  const levelsTotalLectures = getLevelsTotalLecturs(levels, schoolInfo);

  // console.log(levels);
  let teachersLectures = {};
  let teachersOffDays = {};

  for (const teacher in teachers) {
    // console.log(currTeacher.name)
    if (teachers[teacher].subjects.length == 0) {
      delete teachers[teacher];
      continue;
    }
    teachersLectures[teachers[teacher]._id] = distributeTeacherLectures(
      teachers[teacher],
      teachers[teacher].subjects
    );

    let temp = {};
    for (let i = 0; i < schoolInfo.workDays; i++) {
      const average = getTeacherAverageLectures(teachers[teacher]);
      const isTheDayBlocked = isBlockedTeacherDay(
        teachers[teacher],
        average,
        schoolInfo.schoolWeekDays[i],
        averageOfDailyLectures
      );
      temp[schoolInfo.schoolWeekDays[i]] = isTheDayBlocked ? true : false;
    }

    teachersOffDays[teacher] = temp;
  }

  console.log("levelsTotalLectures", levelsTotalLectures);
  console.log("teachersLectures", teachersLectures);

  teachersLectures = validateLevelsLectures(
    teachersLectures,
    levelsTotalLectures
  );

  teachersLectures = sortByLengthRef(teachersLectures, true).sort();

//  console.log(getDaysWithFullLectures(teachersLectures, levelsDailyLectures)) 
  return {
    teachersLectures: teachersLectures,
    teachersOffDays: teachersOffDays,
    levelsDailyLectures: levelsDailyLectures,
    levelsTotalLectures: levelsTotalLectures,
    averageOfDailyLectures: averageOfDailyLectures,
  };
}

function generateStageSchedules(schoolInfo, data) {
  // if (data == "invalid") return "invalid data";

  const teachers = data.teachers;
  const levels = data.levels;
  generateGroupSchedules(schoolInfo, teachers, levels, data.subjects);

  // const teachersLevels = getTeachersLevels(Object.values(teachers));

  // const groupedTeachers = groupTeachersByLevels(teachersLevels);

  // for (const group of groupedTeachers) {
  //   const groupLevels = getElementsByIds(levels, [...group.levels]);
  //   const groupedTeachers = getElementsByKeys(teachers, [...group.teachers]);

  //   generateGroupSchedules(schoolInfo, groupedTeachers, groupLevels);
  // }
}

export async function generator(schoolId, stages = [1, 2, 3, 4]) {
  const schoolInfo = await School.findById(schoolId);

  const schoolWeekDays = getWeekDays(schoolInfo.startDay, schoolInfo.workDays);
  for (const stage of stages) {
    const data = await initialData(schoolInfo, stage);
    // console.log(data);

    if (data.teachers.length == 0 || data.levels.length == 0) continue;
    schoolInfo.schoolWeekDays = schoolWeekDays;
    generateStageSchedules(schoolInfo, data);
  }

  console.log("Success!!!");
  // process.exit(0);
}

function checkOrder(order, daysOfWeek, teachers) {
  console.log("try new order");
  let userdDays = new Set();
  let groupNum = 1;
  let newOrder = {};

  for (let comb in order) {
    // console.log('start parent loop')

    for (let dayIndex = 0; dayIndex < daysOfWeek.length; dayIndex++) {
      if (!userdDays.has(daysOfWeek[dayIndex])) {
        // console.log(`trying gourp ${groupNum} in ${daysOfWeek[dayIndex]}`);
        const isBlocked = isTeachersBlocked(
          teachers,
          order[comb],
          daysOfWeek[dayIndex]
        );

        // console.log(isBlocked)
        if (isBlocked) {
          // console.log(` gourp ${groupNum} failed in ${daysOfWeek[dayIndex]}`);
          continue;
        } else {
          userdDays.add(daysOfWeek[dayIndex]);
          newOrder[daysOfWeek[dayIndex]] = order[comb];
          // console.log(` gourp ${groupNum} done in ${daysOfWeek[dayIndex]}`);

          groupNum++;

          break;
        }
      }
    }
    // console.log('done parent loop')
  }
  // console.log(newOrder);
  if (userdDays.size === daysOfWeek.length) {
    return { valid: true, combination: newOrder };
  } else return { valid: false, combination: {} };
}

function generatorVersionOne() {
  // console.log("levelsTotalLectures", levelsTotalLectures);
  //  const ts = countLevelLecturesForAllTeachers(
  //     teachersLectures,
  //     levelsTotalLectures
  //   );
  // const combinations = clearCombinations(
  //   // fullDays_1
  //   getDaysWithFullLectures(teachersLectures, levelsDailyLectures)
  // );
  // console.log(combinations);
  // console.log(allPossiableInsertIndexesAllLevels)
  // const allDaysOrders = getPermutations(combinations);
  // console.log("allDaysOrders length", allDaysOrders.length);
  // let selectedOreder;
  // for (const order of allDaysOrders) {
  //   const isBlocked = checkOrder(order, daysOfWeek, teachers);
  //   if (isBlocked.valid) {
  //     selectedOreder = isBlocked.combination;
  //     break;
  //   }
  // }
  // console.log("selectedOreder", selectedOreder);
  // if (!selectedOreder) {
  //   console.log("get new days orders");
  //   exit(0);
  // }
  // for (const day in selectedOreder) {
  //   try {
  //     const combTeachers = getTeachersByIds(
  //       teachers,
  //       Object.keys(selectedOreder[day])
  //     );
  //     const blockedLectures = getTeachersBlockedLectures(combTeachers, day);
  //     levelsSchedule = checkAvaliableOrderAndAllocat(
  //       levelsSchedule,
  //       selectedOreder[day],
  //       daysOfWeek.indexOf(day),
  //       blockedLectures
  //     );
  //   } catch (error) {
  //     console.log("Task failed:", error);
  //     continue;
  //   }
  // }
  // console.log(teachersSchedule);
}

// generator("662f231e95a62059e02914fd");
