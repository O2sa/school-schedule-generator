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
import {
  countLevelLectures,
  getAllArrayCombinations,
  getAllCombinations,
  getMatrixWithDifferentNumbers,
  getPermutations,
  getRandomInt,
  getTeachersByUnavailableDay,
  shuffle,
  shuffleObject,
  sortByLengthRef,
} from "./utils.js";
import { isLevelLecturesValid, isTeacherLecturesValid } from "./validData.js";
// import { checkAvaliableOrderAndAllocat } from "./generator.js";
import { daysOfWeek, teachers } from "./mockData.js";
import {
  countEveryLevel,
  countLevelLecturesForAllTeachers,
  countLeveles,
  getTeachersOrderedByOffLectures,
  groupTeachersByUnavailableDays,
} from "./helpers.js";

import Teacher from "../models/TeacherModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Subject from "../models/SubjectModel.js";
import Level from "../models/LevelModel.js";
import Schedule from "../models/ScheduleModel.js";
import School from "../models/SchoolModel.js";
import getDaysWithFullLectures from "./daysFuller.js";
// const fs = require("fs");

import fs from "fs";
import { getAllLevels, getSchoolInfo } from "./setupData.js";
import { fullDays, fullDays_1 } from "./daysWithFullLectures.js";
import { DAYS_OF_WEEK_EN } from "../utils/constants.js";
import { time } from "console";
dotenv.config();

await mongoose.connect(
  "mongodb+srv://osama:2xhUSV7GXYU40pwn@expressnodejsprojects.e9u9qiv.mongodb.net/school_scheduler?retryWrites=true&w=majority"
);
function includesAny(array1, array2) {
  return array2.some((item) => array1.includes(item));
}
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

  for (let i = 0; i < mainMatrix.length; i++) {
    if (!mainMatrix[i].every((value) => value === "empty"))
      throw new Error("day is full");
  }

  let dayKeys = Object.keys(dayCombination);

  // let tempMtx = matrix;

  // console.log(dayKeys);
  // console.log(shuffledDayComb);

  let tempSchedule = JSON.parse(JSON.stringify(levelsSchedule));

  const allOrders = shuffle(getPermutations(dayKeys));
  // console.log(allOrders);
  for (let x = 0; x < allOrders.length; x++) {
    let counter = 0;
    const currentOrder = allOrders[x];
    // console.log(`current comb`, currentOrder);
    levelsSchedule = JSON.parse(JSON.stringify(tempSchedule));

    // console.log("levelsSchedule", levelsSchedule);
    for (let h = 0; h < currentOrder.length; h++) {
      const daySlots = countEveryLevel(dayCombination[currentOrder[h]]);
      // console.log("teacher", dayCombination[currentOrder[h]][0].name);
      // console.log("day", daysOfWeek[dayIndex]);
      let matrix = copyLevelsDay(levelsSchedule, daySlots, dayIndex);

      try {
        const result = checkAbilityToInsert(
          matrix,
          daySlots,
          dayCombination[currentOrder[h]],
          0,
          blockedLectures[currentOrder[h]]
        );
        if (result.valid) {
          // console.log(`current matrix after insert`, matrix);
          // console.log(`done ${currentOrder[h]}`);
          // console.log(` ${day}`);
          levelsSchedule = replaceLevelsDay(
            levelsSchedule,
            result.matrix,
            daySlots,
            dayIndex
          );
          counter++;
        } else break;
      } catch (error) {
        console.error("Task failed:", error.message);
        break;
      }
    }

    if (counter == dayKeys.length) {
      console.log(`done !`);
      break;
    }
  }
  // console.log("levelsSchedule", levelsSchedule);
  return levelsSchedule;
};

function groupTeachersByLevels(teachers) {
  let groups = [];
  let ignoreIndexes = [];

  for (const ts in teachers) {
    const teacher = { teacher: ts, levels: teachers[ts] };

    // console.log(teacher)

    if (groups.length == 0) {
      groups.push({
        levels: new Set(teacher.levels),
        teachers: [teacher.teacher],
      });
      continue;
    }
    // let tempGroups = groups;
    let find = false;
    let mergeIndex;

    for (const group in groups) {
      if (ignoreIndexes.includes(group)) continue;

      if (!find && includesAny(teacher.levels, [...groups[group].levels])) {
        groups[group].levels = new Set([
          ...groups[group].levels,
          ...teacher.levels,
        ]);
        groups[group].teachers = [...groups[group].teachers, teacher.teacher];
        find = true;
        // temp = mergeIndex;
        mergeIndex = group;
        // ignoreIndexes.push(group);
        continue;
      }

      if (find && includesAny(teacher.levels, [...groups[group].levels])) {
        groups[group].levels = new Set([
          ...groups[group].levels,
          ...teacher.levels,
        ]);
        groups[mergeIndex].teachers = [
          ...groups[mergeIndex].teachers,
          teacher.teacher,
        ];
        // groups.splice(group, 1);
        ignoreIndexes.push(group);
        continue;
      }
    }
    if (!find) {
      groups.push({
        levels: new Set(teacher.levels),
        teachers: [teacher.teacher],
      });
    }
  }
  return groups;
}

function checkAbilityToInsert(
  matrix,
  daySlots,
  teacherId,
  index,
  blockedLectures,
  lectures
) {
  const keys = Object.keys(daySlots);
  let levelsFreeIndexes = checkEmptySlots(
    matrix,
    false,
    index,
    blockedLectures
  );
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

  // console.log("allPossiableInsertIndexesAllLevels:", allPossiableInsertIndexesAllLevels);
  const selectedInsertIndxes = getMatrixWithDifferentNumbers(
    allPossiableInsertIndexesAllLevels
  );
  if (selectedInsertIndxes === null) return { valid: false, matrix: matrix };

  console.log("selectedInsertIndxes", selectedInsertIndxes);
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

function checkEmptySlots(
  matrix,
  goldenDay = false,
  startIndex = 0,
  blockedLectures
) {
  const levelsFreeIndexes = [];
  // console.log("matrix checkEmptySlots", matrix);
  for (let i = startIndex; i < matrix.length; i++) {
    let tempArr = [];
    for (let h = 0; h < matrix[i].length; h++) {
      if (matrix[i][h] == "empty" && !blockedLectures.includes(h)) {
        // console.log(`index ${h}  not inclue`);
        tempArr.push(h);
      }
    }
    levelsFreeIndexes.push(tempArr);
  }
  // console.log("blocked lectures:", blockedLectures);
  // console.log("fre slots:", levelsFreeIndexes);

  return levelsFreeIndexes;
}

// function groupTeachersByLevels(teachers) {
//   const groupedTeachers = {};

//   // Iterate through each teacher
//   for (const teacherId in teachers) {
//     const teacherLevels = Array.from(teachers[teacherId]); // Convert set to array

//     let foundGroup = false;

//     // Iterate through existing groups
//     for (const levelString in groupedTeachers) {
//       const groupLevels = levelString.split(",");

//       // Check if the teacher's levels are a subset of the group's levels
//       const isSubset = teacherLevels.every((level) =>
//         groupLevels.includes(level)
//       );

//       if (isSubset) {
//         // Add the teacher to the group
//         groupedTeachers[levelString].push(teacherId);
//         foundGroup = true;
//         break;
//       }
//     }

//     if (!foundGroup) {
//       // If no matching group is found, create a new group
//       const teacherLevelsString = teacherLevels.sort().join(",");
//       groupedTeachers[teacherLevelsString] = [teacherId];
//     }
//   }

//   return groupedTeachers;
// }

function clearCombinations(combinations) {
  let clearedCombinations = [];
  for (let comb of combinations) {
    // console.log(comb)
    let tempObj = {};
    for (const day in comb) {
      //   console.log(comb[day]);
      const firstChar = day.split("_")[0];
      tempObj[firstChar] = comb[day];
    }
    clearedCombinations.push(tempObj);
  }

  return clearedCombinations;
}

async function getLevelsTotalLecturs(schoolId) {
  const levels = await Level.find({ school: schoolId });
  // .populate("subjects");
  const school = await School.findById(schoolId);

  let levelsTotalLectures = {};
  for (let i = 0; i < levels.length; i++) {
    // const subs = levels[i].subjects;

    const totalLevelLectures = school.workDays * levels[i].dailyLectures;
    // let totalCurrentLectures = 0;
    // for (let h = 0; h < subs.length; h++) {
    //   totalCurrentLectures += subs[h].weeklyLectures;
    // }
    // console.log("level:", levels[i].name);

    levelsTotalLectures[levels[i]._id] = totalLevelLectures;
  }

  // const schoolDoc = await School.findById(levelDoc.school);

  return levelsTotalLectures;
}

function getTeachersLevels(teachers) {
  let teachersLevels = {};
  for (const teacher of teachers) {
    let set = new Set();

    const subs = teacher.subjects;
    if (subs.length == 0) break;
    for (const sub of subs) {
      set.add(sub.level.toString());
    }

    teachersLevels[teacher._id] = [...set];
  }
  return teachersLevels;
}

function generateGroupsDays(teachers, groupedTeachers) {
  let teachersLectures = {};
  // for (const group in groupedTeachers) {
  // const keys = Object.keys(groupedTeachers);
  // const currGroup = groupedTeachers[keys[3]];
  // console.log(`group ${count}`);
  // const currentGroup=
  for (const teacher in groupedTeachers) {
    // const currTeacher=currGroup[teacher]

    const currTeacher = teachers.find(
      (object) => object._id == groupedTeachers[teacher]
    );

    // console.log(currTeacher.name)
    teachersLectures[currTeacher._id] = distributeTeacherLectures(
      currTeacher,
      currTeacher.subjects
    );
  }
  // }

  return teachersLectures;
}

function getTeachersByIds(teachers, teacherIds) {
  const filteredTeachers = [];

  for (const teacher of teachers) {
    // console.log(teacher._id.toString())
    // console.log(teacherIds)

    if (teacherIds.includes(teacher._id.toString())) {
      filteredTeachers.push(teacher);
    }
  }

  return filteredTeachers;
}
async function generator(schoolId) {
  // await isDataValid(schoolId);
  const teachers = await Teacher.find({ school: schoolId }).populate(
    "subjects"
  );

  const levels = await Level.find({ school: schoolId }).populate("subjects");
  const levelsDailyLectures = getLevelsDailyLectures(levels);
  console.log(levelsDailyLectures);

  const teachersLevels = getTeachersLevels(teachers);
  console.log("teachersLevels", teachersLevels);
  getTeachersByIds;

  const groupedTeachers = groupTeachersByLevels(teachersLevels);
  console.log("groupedTeachers", groupedTeachers);



  let teachersLectures = generateGroupsDays(
    teachers,
    groupedTeachers[0].teachers
  );
  console.log("teachersLectures", teachersLectures);

  // let sortedTeachersLects = sortByLengthRef(teachersLectures, false).sort();

  const levelsTotalLectures = await getLevelsTotalLecturs(schoolId);
  console.log("levelsTotalLectures", levelsTotalLectures);

  teachersLectures = countLevelLecturesForAllTeachers(
    teachersLectures,
    levelsTotalLectures
  );



  const daysWithFullLectures =
  // clearCombinations(
  // fullDays_1
  // getDaysWithFullLectures(teachersLectures,levelsDailyLectures)
  // );
  getDaysWithFullLectures(teachersLectures,levelsDailyLectures);


  console.log(daysWithFullLectures,);

  // console.log(allPossiableInsertIndexesAllLevels)
  // let levelsSchedule = await initialData(schoolId);

  // console.log(levelsSchedule);

  // const allDaysOrders = getPermutations(daysWithFullLectures);
  // let selectedOreder
  // for (const order of allDaysOrders) {
  //   const isBlocked = checkOrder(order, daysOfWeek, teachers);
  //   if (isBlocked.valid) {
  //     selectedOreder = isBlocked.combination;
  //     break;
  //   }
  // }

  // if (!selectedOreder) console.log("get new days orders");

  // const orderkeys = Object.keys(selectedOreder);
  // for (const day in selectedOreder) {
  //   try {
  //     const combTeachers = getTeachersByIds(
  //       teachers,
  //       Object.keys(selectedOreder[day])
  //     );
  //     const blockedLectures = getTeachersBlockedLectures(
  //       getTeachersByIds(teachers, Object.keys(selectedOreder[day])),
  //       day
  //     );

  //     // console.log(`day ${day}`);
  //     // console.log(te, `    TeachersBlockedLectures day ${day}`);
  //     // console.log("current com", selectedOreder[day]);
  //     // console.log("day index", daysOfWeek.indexOf(day));
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

  // for (const sche in levelsSchedule) console.log(levelsSchedule[sche]);
  // console.log(selectedOreder);

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

function isTeachersBlocked(teachers, combinations, day) {
  const combinationTeachers = getTeachersByUnavailableDay(
    day,
    getTeachersByIds(teachers, Object.keys(combinations))
  );
  const seenBlocks = new Set();

  // console.log(combinations)
  for (const teacher of combinationTeachers) {
    const offDay = teacher.offDaysAndLectures.find(
      (ele) => ele.day === day
      // return ele
    );
    // console.log("day", day);
    // console.log("combinationTeachers", combinationTeachers);
    // console.log("offDay", offDay);

    // if (offDay) {
    if (7 - offDay.offLectures.length < combinations[teacher._id].length) {
      console.log(`${teacher.name} can't be in ${day}`);
      return true;
    }
    // Check for overlap in blocked lectures
    // console.log(offDay);
    // for (const block of offDay.offLectures) {
    //   if (seenBlocks.has(block)) {
    //     let temp = [];
    //     for (const te of combinationTeachers) {
    //       temp.push({ name: te.name, off: offDay.offLectures });
    //     }
    //     console.log("teachers:", temp, ` can't be in ${day}`);

    //     return true; // Overlap found
    //   }
    //   seenBlocks.add(block);
    // }
    // }
  }

  for (let i = 0; i < 7; i++) {
    const blockedForSlot = new Set(); // Track blocked lectures for this slot
    let times = 0;

    for (const teacher of combinationTeachers) {
      const offDay = teacher.offDaysAndLectures.find((ele) => ele.day == day);
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

function getLevelsDailyLectures(levels) {
  let levelsDialyLectures = {};
  for (const level of levels) {
    levelsDialyLectures[level._id] = level.dailyLectures;
  }
  return levelsDialyLectures;
}
const initialData = async (schoolId) => {
  //intialize the levels schedules
  let levelsSchedule = {};
  // let teachersSchedule = {};

  const levels = await Level.find({ stage: 3 });
  const schoolInfo = { workDays: 6 };
  // let teachers = await getAllTeachers(schoolId);

  // console.log("schoolInfo", schoolInfo);

  for (let key in levels) {
    let tempArr = Array.from({ length: schoolInfo.workDays }, () =>
      Array(levels[key].dailyLectures).fill("empty")
    );

    // console.log("level", levels[key]);

    levelsSchedule[levels[key]._id] = tempArr;
  }
  // for (let key in teachers) {
  //   let tempArr = Array.from({ length: schoolInfo.workDays }, () =>
  //     Array(levels[0].dailyLectures).fill("empty")
  //   );
  //   teachersSchedule[teachers[key]._id] = tempArr;
  // }
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

  return levelsSchedule;

  // {
  //   teachersLectures,
  // teachersSchedule,
  // levelsSchedule,
  // teachers,
  // levels,
  // };
};

generator("662f231e95a62059e02914fd");
