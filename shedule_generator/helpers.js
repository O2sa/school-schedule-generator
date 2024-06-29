import { getElementsByIds, getObjSmallestProperty, getTeachersByUnavailableDay } from "./utils.js";

export const getTeacherDayByLength = (subjects, smallest = true) => {
  if (subjects == null || subjects == {}) return;
  // function smallest
  // Initialize the smallest array as null
  let arr = smallest ? {} : null;
  let length = Infinity;
  let key = null;

  if (smallest) {
    // Iterate over each day's array
    for (const day in subjects) {
      const currentDayArray = subjects[day];
      // Check if the current array is smaller than the smallest one found so far
      if (currentDayArray.length < length) {
        arr = currentDayArray;
        length = currentDayArray.length;
        key = day;
      }
    }
  } else {
    for (const day in subjects) {
      const currentDayArray = subjects[day];
      if (currentDayArray && (!arr || currentDayArray.length > arr.length)) {
        arr = currentDayArray;
        key = day;
      }
    }
  }

  return { arr: arr, day: key };
};

const filteredSchedule = (sch, levelId) => {
  return Object.fromEntries(
    Object.entries(sch).map(([day, subjects]) => {
      return [day, subjects.filter((subject) => subject.level === levelId)];
    })
  );
};

export function getTeacherOffLectures(teachers, teacherName, day) {
  const matchingTeacher = teachers.find(
    (teacher) => teacher.name === teacherName
  );

  if (!matchingTeacher) {
    return null; // Handle teacher not found
  }

  const offDaysAndLectures = matchingTeacher.offDaysAndLectures || []; // Handle missing offDaysAndLectures
  const unavailableDay = offDaysAndLectures.find(
    (unavailable) => unavailable.day === day
  );

  if (!unavailableDay) {
    return []; // Handle no unavailable day for the given day
  }

  return unavailableDay.offLectures || []; // Handle missing offLectures
}
// export function checkNumOfEmptySlots(matrix, levelsCounts, day, reqSlots) {
//   let levels = Object.keys(levelsCounts);
//   if (levels.length == 1) return false;

//   for (let i = 0; i < levels.length; i++) {
//     // console.log('i', i)

//     let tempArr = [];
//     let currentDay = matrix[levels[i]][day];
//     for (let h = 0; h < currentDay.length; h++) {
//       // console.log('h', h)

//       if (currentDay[h] == "empty") tempArr.push(h);
//     }
//     if (tempArr.length < reqSlots) return false;
//   }

//   return true;
// }

export function checkNumOfEmptySlots(
  matrix,
  levelsCounts,
  day,
  allEmpty = false
) {
  let levels = Object.keys(levelsCounts);
  if (levels.length == 1) return false;

  for (let i = 0; i < levels.length; i++) {
    // console.log('i', i)

    let currentDay = matrix[levels[i]][day];
    let total = currentDay.length;
    let freeSlots = 0;

    for (let h = 0; h < currentDay.length; h++) {
      // console.log('h', h)
      if (currentDay[h] == null) freeSlots++;
    }

    if (allEmpty) {
      if (freeSlots != total) return false;
    }

    if (Math.floor(total / 2) > freeSlots - levelsCounts[levels[i]])
      return false;
  }

  return true;
}
export function getLargestEmptyDay(schoolInfo, levelsSchedule, levelsCounts) {
  let levels = Object.keys(levelsCounts);
  // if (levels.length == 0) return false;

  const daysEmptySlots = {};

  for (let d = 0; d < schoolInfo.workDays; d++) {
    daysEmptySlots[d] = 0;

    for (let i = 0; i < levels.length; i++) {
      const currentDay = levelsSchedule[levels[i]][d];
      let freeSlots = 0;

      for (let h = 0; h < currentDay.length; h++) {
        if (currentDay[h] == null) freeSlots++;
      }

      daysEmptySlots[d] += freeSlots + levelsCounts[levels[i]];
    }

    daysEmptySlots[d] = Math.floor(daysEmptySlots[d] / levels.length);
  }

  // console.log("daysEmptySlots", daysEmptySlots);
  const smallestDay = getObjSmallestProperty(daysEmptySlots);
  // console.log("smallestDay", smallestDay);

  return Number(smallestDay);
}

export function groupTeachersByUnavailableDays(teachers) {
  const getAllGroubs = (teachers) => {
    const groupedTeachers = {};
    teachers.forEach((teacher) => {
      teacher.offDaysAndLectures.forEach((offDay) => {
        const day = offDay.day;
        if (!groupedTeachers[day]) {
          groupedTeachers[day] = [];
        }
        groupedTeachers[day].push(teacher);
      });
    });
    return groupedTeachers;
  };

  const calculateTotalOffLectures = (teacher, day) => {
    let totalOffLectures = 0;
    teacher.offDaysAndLectures.forEach((offDay) => {
      if (offDay.day == day) totalOffLectures += offDay.offLectures.length;
    });
    return totalOffLectures;
  };

  const allGroups = getAllGroubs(teachers);
  let sortedGroups = {};

  for (const group in allGroups) {
    const sortedTeachers = allGroups[group].sort((a, b) => {
      const totalOffLecturesA = calculateTotalOffLectures(a, group);
      const totalOffLecturesB = calculateTotalOffLectures(b, group);
      return totalOffLecturesB - totalOffLecturesA; // Compare B to A for descending order
    });

    sortedGroups[group] = sortedTeachers;
  }

  return sortedGroups;
}

export function getTeachersOrderedByOffLectures(teachers, day) {
  const matchingTeachers = teachers.filter((teacher) => {
    if (teacher.offDaysAndLectures && teacher.offDaysAndLectures.length > 0) {
      return teacher.offDaysAndLectures.some(
        (unavailableDay) => unavailableDay.day === day
      );
    }
  });

  // if (matchingTeachers.length <= 1) {
  //   return matchingTeachers; // No sorting needed for single teacher or none
  // }

  // // Group teachers by offDaysAndLectures using a Set for uniqueness
  // const teacherGroups = matchingTeachers.reduce((groups, teacher) => {
  //   const key = JSON.stringify(teacher.offDaysAndLectures.map((day) => day.day)); // Extract only day names for grouping
  //   groups.add(key);
  //   return groups;
  // }, new Set());

  // // Order teachers within each group
  // const orderedTeachers = Array.from(teacherGroups).map((key) => {
  //   const group = matchingTeachers.filter((teacher) => {
  //     return (
  //       JSON.stringify(teacher.offDaysAndLectures.map((day) => day.day)) === key
  //     );
  //   });
  //   return group.sort((a, b) => {
  //     const dayEntryA = a.offDaysAndLectures.find((day) => day.day === day);
  //     const dayEntryB = b.offDaysAndLectures.find((day) => day.day === day);
  //     if (!dayEntryA || !dayEntryB) {
  //       // Handle potential missing offDaysAndLectures for the given day
  //       return 0; // Assuming equal order if missing
  //     }
  //     return dayEntryB.offLectures.length - dayEntryA.offLectures.length;
  //   });
  // });

  // Flatten the ordered groups
  return matchingTeachers;
}

function checkAddingBalance(matrix, levelsCounts, day, reqSlots) {
  let levels = Object.keys(levelsCounts);
  if (levels.length == 1) return false;

  // console.log("levelsCounts be", levelsCounts);

  for (let i = 0; i < levels.length; i++) {
    // console.log('i', i)

    let tempArr = [];
    let currentDay = matrix[levels[i]][day];
    for (let h = 0; h < currentDay.length; h++) {
      // console.log('h', h)

      if (currentDay[h] !== null) tempArr.push(h);
    }
    levelsCounts[levels[i]] += tempArr.length;
  }

  // console.log("levelsCounts af", levelsCounts);
  // console.log("day", day);
  // console.log("matrix", matrix);

  if (
    Object.values(levelsCounts).every(
      (value) => value === levelsCounts[levels[0]]
    ) &&
    levelsCounts[levels[0]] < 7
  ) {
    // console.log("balance", true);
    return true;
  } else return false;
}

export function countLeveles(arr) {
  let levelCounts = {};
  // console.log(arr);
  for (const ele in arr) {
    arr[ele].forEach((obj) => {
      const { level: levelType } = obj;
      // console.log(levelType)
      if (levelCounts[levelType]) {
        levelCounts[levelType]++;
      } else {
        levelCounts[levelType] = 1;
      }
    });
  }
  return levelCounts;
}

export function countEveryLevel(arr, levelCounts = {}) {
  //   let levelCounts = {};

  arr.forEach((obj) => {
    const { level: levelType } = obj;
    // console.log(levelType)
    if (levelCounts[levelType]) {
      levelCounts[levelType]++;
    } else {
      levelCounts[levelType] = 1;
    }
  });

  return levelCounts;
}

export function validateLevelsLectures(teachersLectures, levelsTotalLectures) {
  // let acuur = {};
  let levelCounts = {};
  // console.log("teachersLectures before", teachersLectures);
  const keys = Object.keys(teachersLectures);

  for (let i = 0; i < keys.length; i++) {
    const currTe = teachersLectures[keys[i]];

    for (const day in currTe) {
      currTe[day].forEach((obj) => {
        const { level: levelType, name: subName } = obj;
        // console.log(levelType)
        if (levelCounts[levelType]) {
          levelCounts[levelType]++;
        } else {
          levelCounts[levelType] = 1;
        }
      });
    }
  }

  console.log("levels counts", levelCounts);

  for (const level in levelCounts) {
    if (levelCounts[level] != Number(levelsTotalLectures[level])) {
      console.log("delete", level);
      delete levelCounts[level];
    }
  }
  // [].fo

  let validLevels = Object.keys(levelCounts);
  for (let i = 0; i < keys.length; i++) {
    const currTe = teachersLectures[keys[i]];

    for (const day in currTe) {
      currTe[day].forEach((obj, idx) => {
        if (!validLevels.includes(obj.level.toString())) {
          console.log("delete", teachersLectures[keys[i]][day][idx]);
          teachersLectures[keys[i]][day].splice(idx, 1);
        }
      });
    }
  }

  console.log("levels counts", levelCounts);

  // console.log("teachersLectures after", teachersLectures);

  // console.log(acuur);
  return teachersLectures;
}

export function generateGroupsDays(teachers, groupedTeachers) {
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

export function clearCombinations(combinations) {
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

export function getLevelsTotalLecturs(levels, school) {
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

export function getTeachersLevels(teachers) {
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
function includesAny(array1, array2) {
  return array2.some((item) => array1.includes(item));
}
export function groupTeachersByLevels(teachers) {
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

export function getTeacherAverageLectures(teacher) {
  return Math.ceil(
    teacher.subjects.reduce(
      (sum, obj) => sum + (obj["weeklyLectures"] || 0),
      0
    ) / teacher.workDays
  );
}

export function copyLevelsDay(levels, levelsKeys, dayIndex) {
  const keys = Object.keys(levelsKeys);
  let matrix = [];
  // console.log(levels, levelsKeys, dayIndex);
  for (let h = 0; h < keys.length; h++) {
    // matrix.push(levels[keys[h]][dayIndex]);
    matrix.push(JSON.parse(JSON.stringify(levels[keys[h]][dayIndex])));
  }
  return matrix;
}

export const getTeacherBlockDay = (teacher, day) =>
  teacher.offDaysAndLectures.find((ele) => ele.day == day);

export function isTeachersBlocked(
  teachers,
  combinations,
  day,
  numOfDailyLectures
) {
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

export function canTeachersBeTogather(teachers, day) {
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

export function isBlockedTeacherDay(
  teacher,
  averageLectures,
  day,
  totalLectures
) {
  const offDay = getTeacherBlockDay(teacher, day);

  if (!offDay) return false;

  if (totalLectures - offDay?.offLectures?.length < averageLectures) {
    // console.log(`${teacher.name} can't be in ${day}`);
    return true;
  }

  return false;
}

export function getLevelsDailyLectures(levels) {
  let levelsDialyLectures = {};
  for (const level of levels) {
    levelsDialyLectures[level._id] = level.dailyLectures;
  }
  return levelsDialyLectures;
}
export function getUnavailableDays(teachers, daysOfWeek) {
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

export function getTeachersBlockedLectures(teachers, day) {
  let teachersBolckedLectures = {};
  for (const teacher of teachers) {
    const offDay = teacher.offDaysAndLectures.find((ele) => ele.day == day);
    teachersBolckedLectures[teacher._id] = offDay ? offDay.offLectures : [];
  }

  return teachersBolckedLectures;
}


export function setupTeachersLectures(teachLecs) {
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

export function getLevelsPerDay(day) {
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
export function getLevelsCounts(keys, levelsPerDay, levels) {
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