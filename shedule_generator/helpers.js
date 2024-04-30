const getSubectsNum = (subjects, smallest = true) => {
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
function checkNumOfEmptySlots(matrix, levelsCounts, day, reqSlots) {
  let levels = Object.keys(levelsCounts);
  if (levels.length == 1) return false;

  for (let i = 0; i < levels.length; i++) {
    // console.log('i', i)

    let tempArr = [];
    let currentDay = matrix[levels[i]][day];
    for (let h = 0; h < currentDay.length; h++) {
      // console.log('h', h)

      if (currentDay[h] == "empty") tempArr.push(h);
    }
    if (tempArr.length < reqSlots) return false;
  }

  return true;
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

      if (currentDay[h] !== "empty") tempArr.push(h);
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

export function countLevelLecturesForAllTeachers(
  teachersLectures,
  levelsTotalLectures
) {
  // let acuur = {};
  let levelCounts = {};
  console.log("teachersLectures before", teachersLectures);
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

  for (const level in levelCounts) {
    if (levelCounts[level] !== levelsTotalLectures[level]) {
      delete levelCounts[level];
    }
  }
  // [].fo

  let validLevels = Object.keys(levelCounts);
  for (let i = 0; i < keys.length; i++) {
    const currTe = teachersLectures[keys[i]];

    for (const day in currTe) {
      currTe[day].forEach((obj, idx) => {
        if (!validLevels.includes(obj.level)) {
          teachersLectures[keys[i]][day].splice(idx, 1);
        }
      });
    }
  }
  console.log("teachersLectures after", teachersLectures);
  console.log("levels counts", levelCounts);

  // console.log(acuur);
  return teachersLectures;
}
