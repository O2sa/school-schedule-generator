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
import _ from "lodash-es";
import {
  countLevelLectures,
  getAllArrayCombinations,
  getAllCombinations,
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
} from "./utils.js";

// import { checkAvaliableOrderAndAllocat } from "./generator.js";
import { daysOfWeek, teachers } from "./mockData.js";
import {
  checkNumOfEmptySlots,
  clearCombinations,
  countEveryLevel,
  countLeveles,
  getLargestEmptyDay,
  getLevelsTotalLecturs,
  getTeacherAverageLectures,
  getTeacherDayByLength,
  getTeachersLevels,
  getTeachersOrderedByOffLectures,
  groupTeachersByLevels,
  groupTeachersByUnavailableDays,
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

import { getAllLevels, getSchoolInfo } from "./setupData.js";
import { fullDays, fullDays_1 } from "./daysWithFullLectures.js";
import { DAYS_OF_WEEK_EN, WEEK_DAYS } from "../utils/constants.js";
import { time } from "console";
import { exit } from "process";
dotenv.config();

await mongoose.connect(
  "mongodb+srv://osama:2xhUSV7GXYU40pwn@expressnodejsprojects.e9u9qiv.mongodb.net/school_scheduler?retryWrites=true&w=majority"
);

function getUnavailableDays(teachers, daysOfWeek) {
  let sharedOffLectures = {};

  for (let dayIndex = 0; dayIndex < daysOfWeek.length; dayIndex++) {
    // console.log(daysOfWeek[dayIndex])
    const unavailableday = getTeachersByUnavailableDay(
      daysOfWeek[dayIndex],
      teachers
    );

    console.log(unavailableday);
    let tempArr = [];
    if (unavailableday.length > 1) {
      for (let i = 0; i < unavailableday.length; i++) {
        tempArr.push(unavailableday[i].id);
      }
    }

    sharedOffLectures[daysOfWeek[dayIndex]] = tempArr;
  }
  return sharedOffLectures;
}

function getTeachersBlockedLectures(teachers, day) {
  let teachersBolckedLectures = {};
  for (const teacher of teachers) {
    const offDay = teacher.offDaysAndLectures.find((ele) => ele.day == day);
    teachersBolckedLectures[teacher._id] = offDay ? offDay.offLectures : [];
  }

  return teachersBolckedLectures;
}

export const checkAvaliableOrderAndAllocat = (
  levelsSchedule,
  dayCombination,
  dayIndex,
  blockedLectures
) => {
  let levelsCounts = countLeveles(dayCombination);
  // console.log(levelsCounts);
  // console.log(dayCombination)

  let mainMatrix = copyLevelsDay(levelsSchedule, levelsCounts, dayIndex);
  // console.log(levelsSchedule);

  // for (let i = 0; i < mainMatrix.length; i++) {
  //   if (!mainMatrix[i].every((value) => value === "empty"))
  //     throw new Error("day is full");
  // }

  let dayKeys = Object.keys(dayCombination);

  // let tempMtx = matrix;

  // console.log(dayKeys);
  // console.log(shuffledDayComb);

  const allOrders = getPermutations(dayKeys);
  // console.log(allOrders);
  for (let x = 0; x < allOrders.length; x++) {
    let counter = 0;
    const currentOrder = allOrders[x];
    // console.log(`current comb`, currentOrder);
    let tempSchedule = JSON.parse(JSON.stringify(levelsSchedule));

    // console.log("new try");
    for (let h = 0; h < currentOrder.length; h++) {
      const daySlots = countEveryLevel(dayCombination[currentOrder[h]]);
      // console.log("teacher", dayCombination[currentOrder[h]][0].name);
      // console.log("day", daysOfWeek[dayIndex]);
      let matrix = copyLevelsDay(tempSchedule, daySlots, dayIndex);
      // try {
      const result = checkAbilityToInsert(
        matrix,
        daySlots,
        dayCombination[currentOrder[h]],
        0,
        false,
        blockedLectures[currentOrder[h]]
      );

      if (result.valid) {
        tempSchedule = replaceLevelsDay(
          tempSchedule,
          result.matrix,
          daySlots,
          dayIndex
        );

        counter++;
      } else break;
      // } catch (error) {
      //   console.log("Task failed:", error.message);
      //   console.error("Task failed:", error.message);
      //   break;
      // }
    }

    if (counter == dayKeys.length) {
      console.log(`done !`);
      return { valid: true, schedule: tempSchedule };

      break;
    }
  }
  return { valid: false, schedule: levelsSchedule };
};

function checkAbilityToInsert(
  matrix,
  daySlots,
  teacherId,
  startIndex,
  goldenDay = false,
  blockedLectures
) {
  const keys = Object.keys(daySlots);
  // console.log("startIndex", startIndex);
  // console.log("daySlots", daySlots);
  // console.log("matrix", matrix);
  let levelsFreeIndexes;

  levelsFreeIndexes = goldenDay
    ? checkEmptySlots(matrix, startIndex, teacherId.length, blockedLectures)
    : checkEmptySlots(matrix, startIndex, null, blockedLectures);
  // console.log("levelsFreeIndexes", levelsFreeIndexes);

  let allPossiableInsertIndexesPerLeve = [];
  for (let i = 0; i < levelsFreeIndexes.length; i++) {
    allPossiableInsertIndexesPerLeve.push(
      getAllCombinations(levelsFreeIndexes[i], daySlots[keys[i]])
    );
  }
  // console.log(
  //   "allPossiableInsertIndexesPerLeve:",
  //   allPossiableInsertIndexesPerLeve
  // );
  const allPossiableInsertIndexesAllLevels = getAllArrayCombinations(
    allPossiableInsertIndexesPerLeve,
    keys.length
  );

  // console.log(
  //   "allPossiableInsertIndexesAllLevels:",
  //   allPossiableInsertIndexesAllLevels
  // );
  // if (
  //   allPossiableInsertIndexesAllLevels.every((arr) => arr.length == 0) ||
  //   allPossiableInsertIndexesAllLevels.length == 0
  // )
  //   return { valid: false, matrix: matrix };

  const selectedInsertIndxes = getMatrixWithDifferentNumbers(
    allPossiableInsertIndexesAllLevels
  );
  if (selectedInsertIndxes === null) return { valid: false, matrix: matrix };

  // console.log("selectedInsertIndxes", selectedInsertIndxes);
  matrix = insertIntoMatrix(matrix, selectedInsertIndxes, teacherId);
  return { valid: true, matrix: matrix };
}

function insertIntoMatrix(matrix, selectedInsertIndxes, lectures) {
  let index = 0;
  for (let i = 0; i < selectedInsertIndxes.length; i++) {
    for (let h = 0; h < selectedInsertIndxes[i].length; h++) {
      matrix[i][selectedInsertIndxes[i][h]] = lectures[index].name;
      index++;
    }
  }
  return matrix;
}

function copyLevelsDay(levels, levelsKeys, dayIndex) {
  const keys = Object.keys(levelsKeys);
  let matrix = [];
  // console.log(levels, levelsKeys, dayIndex);
  for (let h = 0; h < keys.length; h++) {
    // matrix.push(levels[keys[h]][dayIndex]);
    matrix.push(JSON.parse(JSON.stringify(levels[keys[h]][dayIndex])));
  }
  return matrix;
}

function replaceLevelsDay(levels, matrix, levelsKeys, dayIndex) {
  const keys = Object.keys(levelsKeys);
  for (let h = 0; h < keys.length; h++) {
    matrix.push(JSON.parse(JSON.stringify(levels[keys[h]][dayIndex])));
    levels[keys[h]][dayIndex] = JSON.parse(JSON.stringify(matrix[h]));
  }
  return levels;
}

function checkEmptySlots(matrix, startIndex = 0, endIndex, blockedLectures) {
  const levelsFreeIndexes = [];

  for (let i = 0; i < matrix.length; i++) {
    endIndex = endIndex == null ? matrix[i].length : endIndex;
    let tempArr = [];
    for (let h = startIndex; h < endIndex; h++) {
      if (matrix[i][h] == "empty" && !blockedLectures?.includes(h)) {
        tempArr.push(h);
      }
    }
    levelsFreeIndexes.push(tempArr);
  }
  // console.log("blocked lectures:", blockedLectures);
  // console.log("fre slots:", levelsFreeIndexes);

  return levelsFreeIndexes;
}

function* getAllCombinationsGenerator(arrays) {
  const stack = [];
  const currentSelection = [];

  function* iterate(currentIndex) {
    if (currentIndex === arrays.length) {
      yield currentSelection.slice();
      return;
    }

    for (let i = 0; i < arrays[currentIndex].length; i++) {
      currentSelection.push(arrays[currentIndex][i]);
      yield* iterate(currentIndex + 1);
      currentSelection.pop();
    }

    yield* iterate(currentIndex + 1); // Include empty selection for the current array
  }

  yield* iterate(0);
}
function setupTeachersLectures(teachLecs) {
  const teachers = Object.keys(teachLecs);
  let levelsPerDay = {};
  let lecturesCompinations_all = {};
  let teachersKeys = {};

  for (let i = 0; i < teachers.length; i++) {
    let days = Object.keys(teachLecs[teachers[i]]);
    let temp = [];

    for (let h = 0; h < days.length; h++) {
      if (teachLecs[teachers[i]][days[h]].length == 0) continue;
      lecturesCompinations_all[`${teachers[i]}_${days[h]}`] =
        teachLecs[teachers[i]][days[h]];
      temp.push(`${teachers[i]}_${days[h]}`);
      levelsPerDay[`${teachers[i]}_${days[h]}`] = getLevelsPerDay(
        teachLecs[teachers[i]][days[h]]
      );
    }
    if (temp.length !== 0) teachersKeys[teachers[i]] = temp;
  }

  return {
    teachersLectures_all: lecturesCompinations_all,
    levelsPerDay: levelsPerDay,
    teachersKeys: teachersKeys,
  };
}

function getLevelsPerDay(day) {
  let levelCounts = {};

  day.forEach((obj) => {
    const { level: levelType } = obj;
    // console.log('obj',obj)
    if (levelCounts[levelType]) {
      levelCounts[levelType]++;
    } else {
      levelCounts[levelType] = 1;
    }
  });

  return levelCounts;
}
function getLevelsCounts(keys, levelsPerDay, levels) {
  let levelCounts = {};
  // console.log('keys',keys)
  // console.log('arr',arr)
  // console.log(keys);

  for (let i = 0; i < keys.length; i++) {
    const currTeacherDay = levelsPerDay[keys[i]];
    for (const level in currTeacherDay) {
      if (levelCounts[level]) {
        levelCounts[level] += currTeacherDay[level];
      } else {
        levelCounts[level] = currTeacherDay[level];
      }
    }
  }

  for (const level in levelCounts) {
    if (
      levelCounts[level] !== levels[level] ||
      Object.keys(levelCounts).length != Object.keys(levels).length
    ) {
      return { valid: false, levelCounts: levelCounts };
    }
  }

  return { valid: true, levelCounts: levelCounts };
}

function setupGoldenDays(
  teachersLectures,
  teachersKeys,
  levelsSchedule,
  schoolInfo,
  teachers,
  usedDays,
  daysLectures,
  numOfDailyLectures
) {
  for (const teacher in teachersLectures) {
    const currentTeacher = teachersLectures[teacher];

    const smallestDay = getTeacherDayByLength(currentTeacher, true);
    let done = false;
    for (let i = 0; i < schoolInfo.workDays; i++) {
      const daySlots = countEveryLevel(currentTeacher[smallestDay.day]);

      if (
        !isBlockedTeacherDay(
          teachers[teacher],
          currentTeacher[smallestDay.day],
          DAYS_OF_WEEK_EN[i],
          numOfDailyLectures
        )
      ) {
        const freeSlots = checkNumOfEmptySlots(
          levelsSchedule,
          daySlots,
          i,
          true
        );
        if (!freeSlots) continue;

        const offLectures = getTeacherBlockDay(
          teachers[teacher],
          DAYS_OF_WEEK_EN[i]
        );

        let matrix = copyLevelsDay(levelsSchedule, daySlots, i);
        const result = checkAbilityToInsert(
          matrix,
          daySlots,
          currentTeacher[smallestDay.day],
          0,
          true,
          offLectures?.offLectures || []
        );

        if (result.valid) {
          levelsSchedule = replaceLevelsDay(
            levelsSchedule,
            result.matrix,
            daySlots,
            i
          );

          usedDays[DAYS_OF_WEEK_EN[i]].add(teacher);
          daysLectures[DAYS_OF_WEEK_EN[i]].push(
            `${teacher}_${smallestDay.day}`
          );

          teachersKeys[teacher].splice(
            teachersKeys[teacher].indexOf(`${teacher}_${smallestDay.day}`),
            1
          );
          if (teachersKeys[teacher].length == 0) delete teachersKeys[teacher];

          done = true;
          break;
        }
      }
    }

    if (done) continue;
    const daySlots = countEveryLevel(currentTeacher[smallestDay.day]);
    const smallestDayIdx = getLargestEmptyDay(
      schoolInfo,
      levelsSchedule,
      daySlots
    );

    if (
      !isBlockedTeacherDay(
        teachers[teacher],
        currentTeacher[smallestDay.day],
        DAYS_OF_WEEK_EN[smallestDayIdx],
        numOfDailyLectures
      )
    ) {
      const offLectures = getTeacherBlockDay(
        teachers[teacher],
        DAYS_OF_WEEK_EN[smallestDayIdx]
      );

      let matrix = copyLevelsDay(levelsSchedule, daySlots, smallestDayIdx);
      const result = checkAbilityToInsert(
        matrix,
        daySlots,
        currentTeacher[smallestDay.day],
        0,
        true,
        offLectures?.offLectures || []
      );

      if (result.valid) {
        levelsSchedule = replaceLevelsDay(
          levelsSchedule,
          result.matrix,
          daySlots,
          smallestDayIdx
        );

        usedDays[DAYS_OF_WEEK_EN[smallestDayIdx]].add(teacher);
        daysLectures[DAYS_OF_WEEK_EN[smallestDayIdx]].push(
          `${teacher}_${smallestDay.day}`
        );

        teachersKeys[teacher].splice(
          teachersKeys[teacher].indexOf(`${teacher}_${smallestDay.day}`),
          1
        );
        if (teachersKeys[teacher].length == 0) delete teachersKeys[teacher];
      }
    }
  }
}

function testAllOrders(data, schoolInfo, teachers) {
  // console.log("teachersLectures", teachersLectures);
  // console.log("daysLectures", daysLectures);
  // console.log("usedDays", usedDays);
  // console.log("teachersKeys", teachersKeys);
  // console.log("levelsSchedule", levelsSchedule);

  const levelsSchedule = data.levelsSchedule;
  let tempTeachersKeys;
  // const allOrdersOftempTeachersKeys = getPermutations(
  //   Object.values(teachersKeys)
  // );
  let tempLevelsSchedule;
  let tempDaysLect;
  let solveCombinations = {};
  let failedDays;
  for (let sh = 0; sh < 10; sh++) {
    let orderDays = 0;
    let counter = 0;
    // console.log(perm);

    // let currentOrder = {};
    // perm.forEach((val) => (currentOrder[val] = teachersKeys[val]));

    tempTeachersKeys = JSON.parse(JSON.stringify(data.teachersKeys));
    tempDaysLect = JSON.parse(JSON.stringify(data.daysLectures));
    tempLevelsSchedule = JSON.parse(JSON.stringify(levelsSchedule));
    failedDays = [];

    console.log("new try");
    for (let i = 0; i < schoolInfo.workDays; i++) {
      const filterdOrder = [];

      // console.log("before filter", Object.keys(tempTeachersKeys).length);

      for (const val of Object.keys(tempTeachersKeys)) {
        if (data.teachersOffDays[val][DAYS_OF_WEEK_EN[i]]) continue;
        if (data.usedDays[DAYS_OF_WEEK_EN[i]].has(val)) continue;

        filterdOrder.push(tempTeachersKeys[val]);
      }

      // console.log("before filter", filterdOrder.length);
      const combinations = getAllCombinationsGenerator(filterdOrder);

      let done = false;

      for (const com of combinations) {
        if (com.length == 0) continue;

        let currCom = {};
        com.map(
          (da) => (currCom[da.split("_")[0]] = data.teachersLectures_all[da])
        );

        const res = getLevelsCounts(
          [...com, ...tempDaysLect[DAYS_OF_WEEK_EN[i]]],
          data.levelsPerDay,
          data.levelsDailyLectures
        );

        if (res.valid) {
          // console.log("res", res);
          // console.log(
          //   `${Object.keys(currCom)} not allcote or block  ${
          //     DAYS_OF_WEEK_EN[i]
          //   }`
          // );

          // if (DAYS_OF_WEEK_EN[i] == "sun") console.log("mon's lects:", currCom);

          const isBlocked = isTeachersBlocked(
            Object.values(teachers),
            currCom,
            DAYS_OF_WEEK_EN[i],
            data.averageOfDailyLectures
          );

          if (isBlocked) {
            continue;
          }

          tempDaysLect[DAYS_OF_WEEK_EN[i]] = [
            ...tempDaysLect[DAYS_OF_WEEK_EN[i]],
            ...com,
          ];

          try {
            const combTeachers = Object.values(
              getElementsByKeys(teachers, Object.keys(currCom))
            );
            const blockedLectures = getTeachersBlockedLectures(
              combTeachers,
              DAYS_OF_WEEK_EN[i]
            );
            // console.log("blockedLectures", blockedLectures);

            const result = checkAvaliableOrderAndAllocat(
              tempLevelsSchedule,
              currCom,
              i,
              blockedLectures
            );

            if (result.valid) {
              orderDays++;
              counter++;
              tempLevelsSchedule = result.schedule;
            } else {
              failedDays.push(i);
            }

            //  else {

            //   tempDaysLect[DAYS_OF_WEEK_EN[i]].map(
            //     (da) => (currCom[da] = data.teachersLectures_all[da])
            //   );

            //   cleanTheDay(tempLevelsSchedule, i);

            //   const version_2_res = checkAvaliableOrderAndAllocat(
            //     tempLevelsSchedule,
            //     currCom,
            //     i,
            //     blockedLectures
            //   );

            //   if (version_2_res.valid) {
            //     tempLevelsSchedule = version_2_res.schedule;
            //     counter++;
            //   }

            //   // else continue;
            // }
          } catch (err) {
            console.log(err);
          }

          for (const c of com) {
            const key = c.split("_")[0];
            tempTeachersKeys[key].splice(com.indexOf(c), 1);
            if (tempTeachersKeys[key].length == 0) delete tempTeachersKeys[key];
          }

          done = true;
          break;
        } else continue;
      }

      // if (!done) break;
    }

    if (counter == schoolInfo.workDays) {
      // levelsSchedule = tempLevelsSchedule;
      console.log("tempLevelsSchedule", tempLevelsSchedule);

      return { valid: true, schedules: tempLevelsSchedule };

      break;
    }

    if (!solveCombinations.schedule) {
      solveCombinations = {
        failedDays: failedDays,
        daysLectures: tempDaysLect,
        schedule: _.cloneDeep(tempLevelsSchedule),
      };
    } 
    else if (solveCombinations.failedDays.length > failedDays.length) {
      solveCombinations = {
        failedDays: failedDays,
        daysLectures: tempDaysLect,
        schedule: _.cloneDeep(tempLevelsSchedule),
      };
    }

  }

  return { valid: false, schedules: tempLevelsSchedule };
}

function cleanTheDay(schedules, day) {
  for (const schedule in schedules) {
    schedules[schedule][day] = Array(schedules[schedule][day].length).fill(
      "empty"
    );
  }
}

function generateGroupSchedules(schoolInfo, teachers, levels) {
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
    usedDays[DAYS_OF_WEEK_EN[i]] = new Set();
    daysLectures[DAYS_OF_WEEK_EN[i]] = [];
  }

  for (let i = 0; i < 20; i++) {
    // let currentTeachersLectures = {};

    // teacherLectures.forEach(
    //   (val) =>
    //     (currentTeachersLectures[val] = JSON.parse(
    //       JSON.stringify(teachersLectures[val])
    //     ))
    // );

    // const tempTeachersLectures={...currentTeachersLectures}
    const tempTeachersKeys = _.cloneDeep(teachersKeys);
    let tempUsedDays = _.cloneDeep(usedDays);
    const tempdaysLectures = _.cloneDeep(daysLectures);
    const tempLevelsSchedule = _.cloneDeep(levelsSchedule);

    setupGoldenDays(
      _.cloneDeep(shuffleObject(teachersLectures)),
      tempTeachersKeys,
      tempLevelsSchedule,
      schoolInfo,
      teachers,
      tempUsedDays,
      tempdaysLectures,
      averageOfDailyLectures
    );

    console.log("tempLevelsSchedule", tempLevelsSchedule);
    // console.log('tempTeachersKeys',tempTeachersKeys)

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
      },
      schoolInfo,
      teachers
    );

    console.log(result);
    if (result.valid) break;
    // console.log(result);
  }
}

function setupStageData(schoolInfo, levels, teachers) {
  const levelsDailyLectures = getLevelsDailyLectures(levels);
  const averageOfDailyLectures = getSmallestPropertyValue(
    levels,
    "dailyLectures"
  );
  const levelsTotalLectures = getLevelsTotalLecturs(levels, schoolInfo);

  let teachersLectures = {};
  let teachersOffDays = {};
  for (const teacher in teachers) {
    // console.log(currTeacher.name)
    if (teachers[teacher].subjects.length == 0) continue;
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
        DAYS_OF_WEEK_EN[i],
        averageOfDailyLectures
      );
      temp[DAYS_OF_WEEK_EN[i]] = isTheDayBlocked ? true : false;
    }

    teachersOffDays[teacher] = temp;
  }

  teachersLectures = validateLevelsLectures(
    teachersLectures,
    levelsTotalLectures
  );
  teachersLectures = sortByLengthRef(teachersLectures, true).sort();
  // console.log("teachersLectures", teachersLectures);

  return {
    teachersLectures: teachersLectures,
    teachersOffDays: teachersOffDays,
    levelsDailyLectures: levelsDailyLectures,
    levelsTotalLectures: levelsTotalLectures,
    averageOfDailyLectures: averageOfDailyLectures,
  };
}

async function generateStageSchedules(data) {
  const teachers = data.teachers;
  const levels = data.levels;
  const schoolInfo = data.schoolInfo;

  const teachersLevels = getTeachersLevels(Object.values(teachers));

  const groupedTeachers = groupTeachersByLevels(teachersLevels);

  for (const group of groupedTeachers) {
    const groupLevels = getElementsByIds(levels, [...group.levels]);
    const groupedTeachers = getElementsByKeys(teachers, [...group.teachers]);

    generateGroupSchedules(schoolInfo, groupedTeachers, groupLevels);
  }

  // const data = setupTeachersLectures(teachersLectures);

  // console.log("daysLectures", daysLectures);

  // for (const day in tempDaysLect) {
  //   const levelCounts = getLevelsCounts(
  //     tempDaysLect[day],
  //     levelsPerDay,
  //     levelsDailyLectures
  //   );

  //   if (!levelCounts.valid) {
  //     console.log(`teachers on ${day} not  valid`);
  //     console.log(`levelCounts`, levelCounts);
  //     continue;
  //   }

  //   let currCom = {};
  //   tempDaysLect[day].map(
  //     (da) => (currCom[da.split("_")[0]] = teachersLectures_all[da])
  //   );
  //   const isBlocked = isTeachersBlocked(
  //     Object.values(teachers),
  //     currCom,
  //     day,
  //     numOfDailyLectures
  //   );
  //   if (isBlocked) {
  //     console.log(`teachers on ${day} blocked`);

  //     continue;
  //   }

  //   console.log(`teachers on ${day} not blocked and valid`);
  //   console.log(`levelCounts`, levelCounts);
  //   const combTeachers = getTeachersByIds(
  //     Object.values(teachers),
  //     Object.keys(currCom)
  //   );
  //   const blockedLectures = getTeachersBlockedLectures(combTeachers, day);

  //   console.log("blockedLectures", blockedLectures);
  //   const result = checkAvaliableOrderAndAllocat(
  //     tempSchedule,
  //     currCom,
  //     DAYS_OF_WEEK_EN.indexOf(day),
  //     blockedLectures
  //   );
  //   if (result.valid) tempSchedule = result.schedule;

  //   console.log("result", result);
  // }

  // console.log(tempSchedule);
  // console.log(levelsSchedule);
}

async function generator(schoolId) {
  const stages = [1, 2, 3, 4];
  const schoolInfo = await School.findById(schoolId);

  // for (const stage of stages) {
  const stageData = await initialData(schoolInfo, 3);
  stageData.schoolInfo = schoolInfo;
  await generateStageSchedules(stageData);
  // }

  console.log("Success!!!");
  process.exit(0);
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

const getTeacherBlockDay = (teacher, day) =>
  teacher.offDaysAndLectures.find((ele) => ele.day == day);

function isTeachersBlocked(teachers, combinations, day, numOfDailyLectures) {
  const combinationTeachers = getTeachersByUnavailableDay(
    day,
    getElementsByIds(teachers, Object.keys(combinations))
  );

  for (const teacher of combinationTeachers) {
    if (
      isBlockedTeacherDay(
        teacher,
        combinations[teacher._id].length,
        day,
        numOfDailyLectures
      )
    )
      return true;
  }

  if (canTeachersBeTogather(combinationTeachers, day)) return true;
  return false;
}

function canTeachersBeTogather(teachers, day) {
  for (let i = 0; i < 7; i++) {
    const blockedForSlot = new Set(); // Track blocked lectures for this slot
    let times = 0;

    for (const teacher of teachers) {
      const offDay = getTeacherBlockDay(teacher, day);
      if (offDay?.offLectures.includes(i)) {
        blockedForSlot.add(i);
        times++;
      }
    }
    if (times >= teachers.length) {
      return true; // Overlap in blocked lectures for this slot
    }
  }
  return false;
}

function isBlockedTeacherDay(teacher, averageLectures, day, totalLectures) {
  const offDay = getTeacherBlockDay(teacher, day);

  if (!offDay) return false;

  if (totalLectures - offDay?.offLectures?.length < averageLectures) {
    // console.log(`${teacher.name} can't be in ${day}`);
    return true;
  }

  return false;
}

function getLevelsDailyLectures(levels) {
  let levelsDialyLectures = {};
  for (const level of levels) {
    levelsDialyLectures[level._id] = level.dailyLectures;
  }
  return levelsDialyLectures;
}

const initialData = async (schoolInfo, stage) => {
  //intialize the levels schedules

  const tempTeachers = await Teacher.find({
    school: schoolInfo._id,
    stage: stage,
  }).populate("subjects");

  const teachers = {};
  tempTeachers.forEach((tea) => (teachers[tea._id] = tea));
  // const subjects = await Subject.find();

  const levels = await Level.find({
    school: schoolInfo._id,
    stage: 3,
  }).populate("subjects");

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
  };
};

function initialSchedules(schoolInfo, levels, teachers) {
  let levelsSchedule = {};
  let teachersSchedule = {};

  // let teachers = await getAllTeachers(schoolId);
  // console.log("schoolInfo", schoolInfo);
  const largestLevel = getLargestPropertyValue(levels, "dailyLectures");
  for (let key in levels) {
    let tempArr = Array.from({ length: schoolInfo.workDays }, () =>
      Array(levels[key].dailyLectures).fill("empty")
    );

    // console.log("level", levels[key]);

    levelsSchedule[levels[key]._id] = tempArr;
  }

  for (let key in teachers) {
    let tempArr = Array.from({ length: schoolInfo.workDays }, () =>
      Array(largestLevel).fill("empty")
    );
    teachersSchedule[teachers[key]._id] = tempArr;
  }

  return {
    levelsSchedule,
    teachersSchedule,
  };
}
function generateTeachersSchedules(teacherSchedule, levelsSchedule, subjects) {
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
async function saveSchedules(levelsSchedule, teachersSchedule) {
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

generator("662f231e95a62059e02914fd");
