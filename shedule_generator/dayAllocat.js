import {
  copyLevelsDay,
  countEveryLevel,
  countLeveles,
  getLargestEmptyDay,
  getLevelsCounts,
  getTeacherBlockDay,
  getTeacherDayByLength,
  getTeachersBlockedLectures,
  isBlockedTeacherDay,
  isTeachersBlocked,
} from "./helpers.js";
import {
  cleanTheDay,
  getAllArrayCombinations,
  getAllCombinations,
  getAllCombinationsGenerator,
  getElementById,
  getElementsByKeys,
  getMatrixWithDifferentNumbers,
  getPermutations,
} from "./utils.js";

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
      try {
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
      } catch (error) {
        console.log("Task failed:", error.message);
        console.error("Task failed:", error.message);
        break;
      }
    }

    if (counter == dayKeys.length) {
      // console.log(`done !`);
      return { valid: true, schedule: tempSchedule };

      break;
    }
  }
  return { valid: false, schedule: levelsSchedule };
};

export function checkAbilityToInsert(
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

export function insertIntoMatrix(matrix, selectedInsertIndxes, lectures) {
  let index = 0;
  for (let i = 0; i < selectedInsertIndxes.length; i++) {
    for (let h = 0; h < selectedInsertIndxes[i].length; h++) {
      matrix[i][selectedInsertIndxes[i][h]] = lectures[index].name;
      index++;
    }
  }
  return matrix;
}

export function replaceLevelsDay(levels, matrix, levelsKeys, dayIndex) {
  const keys = Object.keys(levelsKeys);
  for (let h = 0; h < keys.length; h++) {
    matrix.push(JSON.parse(JSON.stringify(levels[keys[h]][dayIndex])));
    levels[keys[h]][dayIndex] = JSON.parse(JSON.stringify(matrix[h]));
  }
  return levels;
}

export function checkEmptySlots(
  matrix,
  startIndex = 0,
  endIndex,
  blockedLectures
) {
  const levelsFreeIndexes = [];

  for (let i = 0; i < matrix.length; i++) {
    endIndex = endIndex == null ? matrix[i].length : endIndex;
    let tempArr = [];
    for (let h = startIndex; h < endIndex; h++) {
      if (matrix[i][h] == null && !blockedLectures?.includes(h)) {
        tempArr.push(h);
      }
    }
    levelsFreeIndexes.push(tempArr);
  }
  // console.log("blocked lectures:", blockedLectures);
  // console.log("fre slots:", levelsFreeIndexes);

  return levelsFreeIndexes;
}
export function setupGoldenDays(
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
    const daySlots = countEveryLevel(currentTeacher[smallestDay.day]);

    let done = false;
    for (let i = 0; i < schoolInfo.workDays; i++) {
      if (
        !isBlockedTeacherDay(
          teachers[teacher],
          currentTeacher[smallestDay.day],
          schoolInfo.schoolWeekDays[i],
          numOfDailyLectures
        )
      ) {
        const freeSlots = checkEmptySlots(levelsSchedule, daySlots, i, true);
        if (!freeSlots) continue;

        const offLectures = getTeacherBlockDay(
          teachers[teacher],
          schoolInfo.schoolWeekDays[i]
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

          usedDays[schoolInfo.schoolWeekDays[i]].add(teacher);
          daysLectures[schoolInfo.schoolWeekDays[i]].push(
            `${teacher}_${smallestDay.day}`
          );

          // console.log(teachersKeys[teacher])
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
    const smallestDayIdx = getLargestEmptyDay(
      schoolInfo,
      levelsSchedule,
      daySlots
    );

    if (
      !isBlockedTeacherDay(
        teachers[teacher],
        currentTeacher[smallestDay.day],
        schoolInfo.schoolWeekDays[smallestDayIdx],
        numOfDailyLectures
      )
    ) {
      const offLectures = getTeacherBlockDay(
        teachers[teacher],
        schoolInfo.schoolWeekDays[smallestDayIdx]
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

        usedDays[schoolInfo.schoolWeekDays[smallestDayIdx]].add(teacher);
        daysLectures[schoolInfo.schoolWeekDays[smallestDayIdx]].push(
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

export function testAllOrders(data, schoolInfo, teachers) {
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
  let counter;
  for (let sh = 0; sh < 1; sh++) {
    let orderDays = 0;
    counter = 0;
    // console.log(perm);

    // let currentOrder = {};
    // perm.forEach((val) => (currentOrder[val] = teachersKeys[val]));

    tempTeachersKeys = JSON.parse(JSON.stringify(data.teachersKeys));
    tempDaysLect = JSON.parse(JSON.stringify(data.daysLectures));
    tempLevelsSchedule = JSON.parse(JSON.stringify(levelsSchedule));
    failedDays = [];

    // console.log("new try");
    for (let i = 0; i < schoolInfo.workDays; i++) {
      const filterdOrder = [];

      // console.log("before filter", Object.keys(tempTeachersKeys).length);

      for (const val of Object.keys(tempTeachersKeys)) {
        if (data.teachersOffDays[val][schoolInfo.schoolWeekDays[i]]) continue;
        if (data.usedDays[schoolInfo.schoolWeekDays[i]].has(val)) continue;

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

        for (const teacher of data.teachersWithFullWorkDays) {
          if (
            ![
              ...Object.keys(currCom),
              ...data.usedDays[schoolInfo.schoolWeekDays[i]],
            ].includes(teacher)
          ) {
            continue;
          }
        }

        const res = getLevelsCounts(
          [...com, ...tempDaysLect[schoolInfo.schoolWeekDays[i]]],
          data.levelsPerDay,
          data.levelsDailyLectures
        );

        if (res.valid) {
          // console.log("res", res);
          // console.log(
          //   `${[
          //     ...com,
          //     ...tempDaysLect[schoolInfo.schoolWeekDays[i]],
          //   ]} not allcote or block  ${schoolInfo.schoolWeekDays[i]}`
          // );

          // if (schoolInfo.schoolWeekDays[i] == "sun") console.log("mon's lects:", currCom);

          const isBlocked = isTeachersBlocked(
            Object.values(teachers),
            currCom,
            schoolInfo.schoolWeekDays[i],
            data.averageOfDailyLectures
          );

          if (isBlocked) {
            continue;
          }

        //   tempDaysLect[schoolInfo.schoolWeekDays[i]] = [
        //     ...tempDaysLect[schoolInfo.schoolWeekDays[i]],
        //     ...com,
        //   ];

          try {
            const combTeachers = Object.values(
              getElementsByKeys(teachers, Object.keys(currCom))
            );
            const blockedLectures = getTeachersBlockedLectures(
              combTeachers,
              schoolInfo.schoolWeekDays[i]
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


              for (const c of com) {
                const key = c.split("_")[0];
                const deletedItem = tempTeachersKeys[key].splice(
                  tempTeachersKeys[key].indexOf(c),
                  1
                );
                if (tempTeachersKeys[key].length == 0)
                  delete tempTeachersKeys[key];
              }
              delete tempDaysLect[schoolInfo.schoolWeekDays[i]];
            } else {
              failedDays.push(i);
            }

     

            done = true;
            break;
          } catch (err) {
            console.log(err);
          }
        } else continue;
      }

      // if (!done) break;
    }

    if (counter == schoolInfo.workDays) {
      // levelsSchedule = tempLevelsSchedule;
      // console.log("tempLevelsSchedule", tempLevelsSchedule);

      return {
        valid: true,
        schedules: tempLevelsSchedule,
        counter: counter,
        teachersKeys: tempDaysLect,
      };
    }

    if (counter == schoolInfo.workDays - 1) {
      const tempDaysLectKeys = Object.keys(tempDaysLect);
 

      let restKeys = [];
      for (const key in tempTeachersKeys) {
        restKeys = [...restKeys, ...tempTeachersKeys[key]];
      }
      
      console.log('tempLevelsSchedule',tempLevelsSchedule)
      console.log('tempDaysLectKeys',tempDaysLectKeys)
      console.log('tempDaysLect',tempDaysLect)
      console.log('restKeys',restKeys)
      console.log('tempTeachersKeys',tempTeachersKeys)

      restKeys = [...restKeys, ...tempDaysLect[tempDaysLectKeys[0]]];

      console.log('restKeys',restKeys)

      let teachersLects = {};
      let teachersKeys = [];

      let blockedLectures = {};
      for (const te of restKeys) {
        const theKey = te.split("_")[0];

        blockedLectures[te] = getElementById(
          Object.values(teachers),
          tempDaysLectKeys[0]
        );
        teachersLects[te] = data.teachersLectures_all[te];
      }

      // if (!allElementsDifferent(Object.keys(teachersLects))) continue;

      // console.log("restKeys", restKeys);
      // console.log("Object.keys(teachersLects)", Object.keys(teachersLects));
      const res = getLevelsCounts(
        restKeys,
        data.levelsPerDay,
        data.levelsDailyLectures
      );

      console.log(res);

      // if (!res.valid) continue;

      const dayIndex = schoolInfo.schoolWeekDays.indexOf(tempDaysLectKeys[0]);
      cleanTheDay(tempLevelsSchedule, dayIndex);
      console.log('tempLevelsSchedule after cleaning:',tempLevelsSchedule)

      const combTeachers = Object.values(
        getElementsByKeys(teachers, Object.keys(teachersLects))
      );

      const version_2_res = checkAvaliableOrderAndAllocat(
        tempLevelsSchedule,
        teachersLects,
        dayIndex,
        blockedLectures
      );

    //   console.log("blockedLectures", blockedLectures);
    //   console.log("version_2_res", version_2_res.schedule);
      console.log("dayIndex", dayIndex);
      if (version_2_res.valid) {
        tempLevelsSchedule = version_2_res.schedule;
        return {
          valid: true,
          schedules: tempLevelsSchedule,
          counter: counter,
          teachersKeys: tempDaysLect,
        };
      }
    }

    // if (!solveCombinations.schedule) {
    //   solveCombinations = {
    //     failedDays: failedDays,
    //     daysLectures: tempDaysLect,

    //     schedules: _.cloneDeep(tempLevelsSchedule),
    //   };
    // } else if (solveCombinations.failedDays.length > failedDays.length) {
    //   solveCombinations = {
    //     failedDays: failedDays,
    //     daysLectures: tempDaysLect,
    //     schedules: _.cloneDeep(tempLevelsSchedule),
    //   };
    // }
  }

  // console.log(solveCombinations);
  return {
    valid: false,
    schedules: tempLevelsSchedule,
    counter: counter,
    teachersKeys: tempDaysLect,
    // solveCombination: solveCombinations,
  };
}
