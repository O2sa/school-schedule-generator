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

  const unavailableDays = matchingTeacher.unavailableDays || []; // Handle missing unavailableDays
  const unavailableDay = unavailableDays.find(
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
export function countEveryLevel(arr, levelCounts={}) {
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
