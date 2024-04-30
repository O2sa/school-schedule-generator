import {
  getAllLevels,
  getAllTeachers,
  getLevelLecturesPerDay,
  getSchoolInfo,
  getTeacherSubjects,
  getWeekDays,
  initialData,
} from "./setupData.js";
import distributeTeacherLectures from "./teacherLectures.js";
import {
  countLevelLectures,
  getAllArrayCombinations,
  getAllCombinations,
  getMatrixWithDifferentNumbers,
  getTeachersByUnavailableDay,
  shuffle,
  shuffleObject,
  sortByLengthRef,
} from "./utils.js";
import { isLevelLecturesValid, isTeacherLecturesValid } from "./validData.js";
import { allCombinations, leveles } from "./mockData.js";
// import { checkAvaliableOrderAndAllocat } from "./generator.js";
import { daysOfWeek } from "./mockData.js";
import {
  countEveryLevel,
  countLeveles,
  groupTeachersByUnavailableDays,
} from "./helpers.js";
import getDaysWithFullLectures from "./daysFuller.js";

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

function insertDay(levelsSchedule, comb, dayIndex) {
  let tempLevelsSchedule = levelsSchedule;

  let sortedDays = shuffleObject(comb);
  for (const day in sortedDays) {
  }
}

export const checkAvaliableOrderAndAllocat = (
  levelsSchedule,
  dayCombination,
  dayIndex
) => {
  const insertTeacherLects = (matrix, daySlots, teacherId) => {
    for (const slot in daySlots) if (daySlots[slot] == 0) delete daySlots[slot];
    const checkFreeIndexes = checkAbilityToInsert(matrix, daySlots);
    let selectedInsertIndxes;
    if (checkFreeIndexes.valid == false) throw new Error("no vlid indexes");
    if (checkFreeIndexes.valid == true)
      selectedInsertIndxes = checkFreeIndexes.indexes;

    console.log("selectedInsertIndxes", selectedInsertIndxes);
    // console.log("matrix", matrix);
    matrix = insertIntoMatrix(matrix, selectedInsertIndxes, teacherId);
    return matrix;
  };

  let levelsCounts = countLeveles(dayCombination);
  console.log(levelsCounts);
  // console.log(dayCombination)
  let matrix = copyLevelsDay(levelsSchedule, levelsCounts, dayIndex);
  // console.log(matrix);

  for (let i = 0; i < matrix.length; i++) {
    console.log(matrix[i]);
    if (matrix[i].every((value) => value !== "empty"))
      throw new Error("day is full");
  }

  let dayKeys = Object.keys(dayCombination);

  const shuffledDayComb = sortByLengthRef(dayCombination).sort();
  // let tempMtx = matrix;

  // console.log(dayKeys);
  // console.log(shuffledDayComb);

  let counter = 0;
  for (const day in shuffledDayComb) {
    const tempSlots = levelsCounts;
    for (const slot in tempSlots) tempSlots[slot] = 0;
    const daySlots = countEveryLevel(shuffledDayComb[day], tempSlots);
    console.log(daySlots);
    // counter++;

    try {
      matrix = insertTeacherLects(matrix, daySlots, day);
      counter++;
    } catch (error) {
      console.log(counter);
      console.error("Task failed:", error.message);
      if (counter == dayKeys.length - 1) {
        console.log("the last");
        console.log("mateix before", matrix);

        const all = Object.getOwnPropertyNames(daySlots);
        const teKeys = all.map((key) => daySlots[key]);
        let index = 0;
        console.log(teKeys);
        for (let i = 0; i < teKeys.length; i++) {
          console.log("daySlots[teKeys[i]]", teKeys[i], "i", i);
          if (matrix[i].includes("empty")) {
            let lectures = new Array(teKeys[i]).fill(day);
            index += teKeys[i];
            matrix[i].splice(index, 0, ...lectures);
            matrix[i] = matrix[i].filter((item) => item !== "empty");
          }
        }
        console.log("mateix after", matrix);
      }
      break;
    }
  }

  levelsSchedule = replaceLevelsDay(
    levelsSchedule,
    matrix,
    levelsCounts,
    dayIndex
  );

  // console.log("levels after inserting", levelsSchedule);

  // console.log("---------------------------------");
  // console.log("end checkAvaliableOrderAndAllocat");
  // console.log("-------------------------------");
  return levelsSchedule;
};

function checkAbilityToInsert(matrix, daySlots) {
  const keys = Object.keys(daySlots);
  let levelsFreeIndexes = checkEmptySlots(matrix, false, 0);
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
  if (selectedInsertIndxes === null) return { valid: false, indexes: [] };

  return { valid: true, indexes: selectedInsertIndxes };
}

function insertIntoMatrix(matrix, selectedInsertIndxes, teacherId) {
  for (let i = 0; i < selectedInsertIndxes.length; i++) {
    for (let h = 0; h < selectedInsertIndxes[i].length; h++) {
      matrix[i][selectedInsertIndxes[i][h]] = teacherId;
    }
  }
  return matrix;
}
function copyLevelsDay(levels, levelsKeys, dayIndex) {
  const keys = Object.keys(levelsKeys);
  let matrix = [];
  for (let h = 0; h < keys.length; h++) {
    matrix.push(levels[keys[h]][dayIndex]);
  }
  return matrix;
}

function replaceLevelsDay(levels, matrix, levelsKeys, dayIndex) {
  const keys = Object.keys(levelsKeys);
  for (let h = 0; h < keys.length; h++) {
    matrix.push(levels[keys[h]][dayIndex]);
    levels[keys[h]][dayIndex] = matrix[h];
  }
  return levels;
}

function checkEmptySlots(matrix, goldenDay = false, startIndex = 0, endIndex) {
  // console.log("---------------------------------");
  // console.log("end checkEmptySlots");
  // console.log("-------------------------------");
  let levelsFreeIndexes = [];
  if (goldenDay) {
    // console.log('goldenDay', goldenDay)
    // console.log('endIndex', endIndex)
    // console.log('matrix', matrix)

    for (let i = 0; i < matrix.length; i++) {
      // console.log('i', i)

      let tempArr = [];
      for (let h = 0; h < endIndex; h++) {
        // console.log('h', h)

        if (matrix[i][h] == "empty") tempArr.push(h);
      }
      levelsFreeIndexes.push(tempArr);
    }
  } else {
    for (let i = 0; i < matrix.length; i++) {
      let tempArr = [];
      for (let h = 0; h < matrix[i].length; h++) {
        if (matrix[i][h] == "empty") tempArr.push(h);
      }
      levelsFreeIndexes.push(tempArr);
    }
  }
  // console.log("---------------------------------");
  // console.log("end checkEmptySlots");
  // console.log("-------------------------------");
  return levelsFreeIndexes;
}

function generator() {
  let teachersLectures = {};
  const teachers = getAllTeachers();
  let { levelsSchedule, teachersSchedule } = initialData();

  // const teachersOffDays =groupTeachersByUnavailableDays(teachers)
  // console.log("teachersOffDays", teachersOffDays);

  console.log(levelsSchedule);

  //generate teacher lectures
  for (const teacher of teachers) {
    const subjects = getTeacherSubjects(teacher);
    teachersLectures[teacher.id] = distributeTeacherLectures(teacher, subjects);
  }
  // let sortedTeachersLects = sortByLengthRef(teachersLectures, false).sort();

  // for (const f in teachersLectures) console.log(teachersLectures[f],',');
  let daysWithFullLectures =
    //  allCombinations;
    getDaysWithFullLectures(teachersLectures);

  console.log(daysWithFullLectures);
  // let clearedCombinations = [];
  //clear compinations
  // for (let comb of daysWithFullLectures) {
  //   // console.log(comb)
  //   let tempObj = {};
  //   for (const day in comb) {
  //     //   console.log(comb[day]);
  //     const firstChar = day.split("_")[0];
  //     tempObj[firstChar] = comb[day];
  //   }
  //   clearedCombinations.push(tempObj);
  // }

  // for(const com of clearedCombinations)
  // console.log(com);

  // console.log(allPossiableInsertIndexesAllLevels)
  // let schedules = {};

  // console.log(daysWithFullLectures);
  // for (let comb of daysWithFullLectures) {
  // console.log("---------------------------------");
  // console.log("start combination");
  // console.log("-------------------------------");

  //   for (let dayIndex = 0; dayIndex < daysOfWeek.length; dayIndex++) {
  //     try {
  //       levelsSchedule = checkAvaliableOrderAndAllocat(
  //         levelsSchedule,
  //         comb,
  //         dayIndex
  //       );
  //       break;
  //     } catch (error) {
  //       console.log("Task failed:", error.message, error);
  //       continue;
  //     }
  //   }
  // }
  // console.log(levelsSchedule);
}

generator();
