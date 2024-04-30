const teachers = [
  {
    name: "Math-Teacher",
    id: "Ma-Te",
    workDays: 6,
    unavailableDays: [],
    subjects: ["M1", "M2", "M3"],
  },
  {
    name: "Arabic-Teacher",
    id: "Ar-Te",
    workDays: 6,
    unavailableDays: [],
    subjects: ["A1", "A2", "A3"],
  },
  {
    name: "English-Teacher",
    id: "Eng-Te",
    workDays: 5,
    unavailableDays: [],
    subjects: ["E1", "E2", "E3"],
  },
  {
    name: "Phasics-Teacher",
    id: "Ph-Te",
    workDays: 5,
    unavailableDays: [],
    subjects: ["P1", "P2", "P3"],
  },
  {
    name: "Quilting-Teacher",
    id: "Qu-Te",
    workDays: 4,
    unavailableDays: ["Mon"],
    subjects: ["Q1", "Q2", "Q3"],
  },
  {
    name: "Italian-Teacher",
    id: "It-Te",
    workDays: 6,
    unavailableDays: [],
    subjects: ["I1", "I2", "I3"],
  },
  {
    name: "Biology-Teacher",
    id: "Bi-Te",
    workDays: 4,
    unavailableDays: [],
    subjects: ["B1", "B2", "B3"],
  },
  {
    name: "history-Teacher",
    id: "hi-Te",
    workDays: 2,
    unavailableDays: ["Sat", "Tue"],
    subjects: ["H1"],
  },
  {
    name: "Chemistry-Teacher",
    id: "Ch-Te",
    workDays: 5,
    unavailableDays: [],
    subjects: ["C1", "C2", "C3"],
  },
];

const subjects = [
  //1-sec subjects
  {
    name: "Math",
    class: "1-sec",
    id: "M1",
    weeklyLectures: 6,
  },
  {
    name: "Biology",
    class: "1-sec",
    id: "B1",
    weeklyLectures: 4,
  },
  {
    name: " Quilting",
    class: "1-sec",
    id: "Q1",
    weeklyLectures: 4,
  },
  {
    name: "Isramic Culture",
    class: "1-sec",
    id: "I1",
    weeklyLectures: 4,
  },
  {
    name: "Phasics",
    class: "1-sec",
    id: "P1",
    weeklyLectures: 4,
  },
  {
    name: "History",
    class: "1-sec",
    id: "H1",
    weeklyLectures: 4,
  },
  {
    name: "English",
    class: "1-sec",
    id: "E1",
    weeklyLectures: 5,
  },
  {
    name: "Arabic",
    class: "1-sec",
    id: "A1",
    weeklyLectures: 6,
  },
  {
    name: "Chemistry",
    class: "1-sec",
    id: "C1",
    weeklyLectures: 4,
  },

  //2-sec subjects
  {
    name: "Math",
    class: "2-sec",
    id: "M2",
    weeklyLectures: 6,
  },
  {
    name: "Biology",
    class: "2-sec",
    id: "B2",
    weeklyLectures: 4,
  },
  {
    name: " Quilting",
    class: "2-sec",
    id: "Q2",
    weeklyLectures: 5,
  },
  {
    name: "Isramic Culture",
    class: "2-sec",
    id: "I2",
    weeklyLectures: 5,
  },
  {
    name: "Phasics",
    class: "2-sec",
    id: "P2",
    weeklyLectures: 5,
  },
  {
    name: "English",
    class: "2-sec",
    id: "E2",
    weeklyLectures: 5,
  },
  {
    name: "Arabic",
    class: "2-sec",
    id: "A2",
    weeklyLectures: 6,
  },
  {
    name: "Chemistry",
    class: "2-sec",
    id: "C2",
    weeklyLectures: 5,
  },

  //3-sec subjects
  {
    name: "Math",
    class: "3-sec",
    id: "M3",
    weeklyLectures: 6,
  },
  {
    name: "Biology",
    class: "3-sec",
    id: "B3",
    weeklyLectures: 5,
  },
  {
    name: " Quilting",
    class: "3-sec",
    id: "Q3",
    weeklyLectures: 5,
  },
  {
    name: "Isramic Culture",
    class: "3-sec",
    id: "I3",
    weeklyLectures: 4,
  },
  {
    name: "Phasics",
    class: "3-sec",
    id: "P3",
    weeklyLectures: 5,
  },
  {
    name: "English",
    class: "3-sec",
    id: "E3",
    weeklyLectures: 5,
  },
  {
    name: "Arabic",
    class: "3-sec",
    id: "A3",
    weeklyLectures: 6,
  },
  {
    name: "Chemistry",
    class: "3-sec",
    id: "C3",
    weeklyLectures: 5,
  },
];

const classes = [
  {
    name: "1-secondary",
    id: "1-sec",
    DailyLectures: 7,
    subjects: ["M1", "Q1", "I1", "A1", "E1", "H1", "C1", "B1", "P1"],
  },
  {
    name: "2-secondary",
    id: "2-sec",
    DailyLectures: 7,
    subjects: ["M2", "Q2", "I2", "A2", "E2", "C2", "B2", "P2"],
  },
  {
    name: "3-secondary",
    id: "3-sec",
    DailyLectures: 7,
    subjects: ["M3", "Q3", "I3", "A3", "E3", "C3", "B3", "P3"],
  },
];

const daysOfWeek = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thr"];

// Function to distribute lectures of a teacher per work days
const teacherLecturesPerWorkDays = (teacher) => {
  const teacherWorkDays = teacher.workDays;
  const totalSubjectsLectures = calculateTeacherTotalLectures(teacher);

  const baseLecturesPerDay = Math.floor(
    totalSubjectsLectures / teacherWorkDays
  ); // Calculate base lectures per day
  const remainingSubjects = totalSubjectsLectures % teacherWorkDays; // Calculate remaining subjects

  // Distribute remaining subjects evenly among the working days
  const lecturesPerWeek = Array(teacherWorkDays).fill(baseLecturesPerDay);
  for (let i = 0; i < remainingSubjects; i++) {
    lecturesPerWeek[i]++;
  }
  return lecturesPerWeek;
};

// Function to generate teacherScheduleedules for each teacher
const generateTeacherSchedule = (teacher) => {
  // Initialize teacher teacherScheduleedule object
  const teacherSchedule = {};

  const subjects = getTeacherSubjects(teacher);
  const lecturesPerWeek = teacherLecturesPerWorkDays(teacher);

  // Distribute remaining subjects evenly among the working days
  for (let i = 0; i < teacher.workDays; i++) {
    teacherSchedule[`Day${i + 1}`] = [];
  }
  const keys = Object.keys(teacherSchedule);
  for (let h = 0; h < subjects.length; h++) {
    let i = 0;
    let counter = 0;
    while (true) {
      const index = i % keys.length;
      const key = keys[index];
      if (teacherSchedule[key].length < lecturesPerWeek[index]) {
        teacherSchedule[key].push(subjects[h]);
        counter++;
      }
      if (counter == subjects[h].weeklyLectures) break;
      i++;
    }
  }
  return teacherSchedule;
};

// Function to calculate total lectures for each teacher
const calculateTeacherTotalLectures = (teacher) => {
  const tSubjects = getTeacherSubjects(teacher);
  let total = 0;

  // Loop over each key in the object
  tSubjects.forEach((element) => {
    total += element.weeklyLectures;
  });
  return total;
};

const getTeacherSubjects = (teacher) => {
  return teacher.subjects.reduce((tSubjects, subjectId) => {
    const subject = subjects.find((subject) => subject.id === subjectId);
    tSubjects.push(subject);
    return tSubjects;
  }, []);
};

// Get a random integer between a minimum (inclusive) and maximum (exclusive) value
function getRandomInt(min, max) {
  min = Math.ceil(min); // Round up minimum value (inclusive)
  max = Math.floor(max); // Round down maximum value (exclusive)
  return Math.floor(Math.random() * (max - min)) + min;
}

function checkEmptySlots(matrix, startIndex = 0, end = false) {
  let matrixWithFreeSlots = [];
  if (end) {
    for (let i = 0; i < matrix.length; i++) {
      let tempArr = [];
      for (let h = startIndex; h < matrix[i].length; h++) {
        if (matrix[i][h] == "empty") tempArr.push(h);
      }
      matrixWithFreeSlots.push(tempArr);
    }
  } else {
    for (let i = 0; i < matrix.length; i++) {
      let tempArr = [];
      for (let h = matrix[i].length; h > 0; h--) {
        if (matrix[i][h] == "empty") tempArr.push(h);
      }
      matrixWithFreeSlots.push(tempArr);
    }
  }
  return matrixWithFreeSlots;
}

const initialData = () => {
  //intialize the classes schedules
  let classesSchedule = {};
  let teachersSchedule = {};

  for (let key in classes) {
    let tempArr = Array.from({ length: daysOfWeek.length }, () =>
      Array(classes[key].DailyLectures).fill("empty")
    );
    classesSchedule[classes[key].id] = tempArr;
  }
  for (let key in teachers) {
    let tempArr = Array.from({ length: daysOfWeek.length }, () =>
      Array(classes[0].DailyLectures).fill("empty")
    );
    teachersSchedule[teachers[key].id] = tempArr;
  }

  // get teachers lectures
  let teachersLectures = {};
  let teachersScheduleInfo = {};
  teachers.forEach((ele) => {
    teachersLectures[`${ele.id}`] = generateTeacherSchedule(ele);
    teachersScheduleInfo[ele.id] = {
      goldenDay: false,
      days: {},
    };
  });

  return {
    teachersLectures,
    teachersSchedule,
    classesSchedule,
    teachersScheduleInfo,
  };
};


const getSameDayOfSchedule = () => {};
function hasSpecificKey(obj, key) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop) && prop === key) {
      return true;
    }
  }
  return false;
}

let {
  classesSchedule,
  teachersLectures,
  teachersSchedule,
  teachersScheduleInfo,
} = initialData();

const classCount = (classLec) => {
  let totalReqSlots = 0;
  for (let key in classLec) {
    totalReqSlots += classLec[key];
  }
  return totalReqSlots;
};
function generateClassSchedule(cls) {
  //assume all teachers shares those classes only
  // let classes=['1-sec','2-sec','3-sec']

  const checkAvaliableOrderAndAllocat = (
    daySlots,
    dayIndex,
    teacherId,
    startIndex,
    end
  ) => {
    let totalReqSlots = classCount(daySlots);

    // console.log("totalReqSlots:", totalReqSlots);

    const keys = Object.keys(daySlots);
    let matrix = [];
    for (let h = 0; h < keys.length; h++) {
      matrix.push(classesSchedule[keys[h]][dayIndex]);
    }
    // console.log("totalReqSlots:", totalReqSlots);

    const matrixWithFreeSlots = checkEmptySlots(matrix, startIndex, end);
    // console.log("matrixWithFreeSlots:", matrixWithFreeSlots);

    for (let h = 0; h < matrixWithFreeSlots.length; h++) {
      if (daySlots[keys[h]] > matrixWithFreeSlots[h].length) return false;
    }

    //get
    let instertingIndexes = [];
    for (let i = 0; i < matrixWithFreeSlots.length; i++) {
      instertingIndexes.push(
        getAllCombinations(matrixWithFreeSlots[i], daySlots[keys[i]])
      );
    }
    // console.log("instertingIndexes:", instertingIndexes);

    const matrixWithDifferentNumbers = getMatrixWithDifferentNumbers(
      getAllArrayCombinations(instertingIndexes, keys.length)
    );
    // console.log("matrixWithDifferentNumbers:", matrixWithDifferentNumbers);
    if (matrixWithDifferentNumbers == null) return false;

    for (let i = 0; i < matrix.length; i++) {
      for (let h = 0; h < matrixWithDifferentNumbers[i].length; h++) {
        matrix[i][matrixWithDifferentNumbers[i][h]] = teacherId;
      }
    }
    for (let h = 0; h < keys.length; h++) {
      matrix.push(classesSchedule[keys[h]][dayIndex]);
      classesSchedule[keys[h]][dayIndex] = matrix[h];
    }
    return true;
  };

  //set the golden day for every teacher
  // for (let key in teachersLectures) {
  //   let currentTeacherLec = teachersLectures[key];
  //   let currentTeInfo = teachersScheduleInfo[key];

  //   const smallestDayLecturs = getSubectsNum(currentTeacherLec);
  //   smallestClassCount = countClassLectures(smallestDayLecturs.arr);
  //   smallestDaykey = smallestDayLecturs.day;

  //   for (let i = 0; i < daysOfWeek.length; i++) {
  //     let random = getRandomInt(0, 4);
  //     if (!hasSpecificKey(currentTeInfo.days, daysOfWeek[random])) {
  //       let result = checkAvaliableOrderAndAllocat(
  //         smallestClassCount,
  //         random,
  //         key,
  //         0
  //       );
  //       if (result) {
  //         currentTeInfo["goldenDay"] = true;
  //         currentTeInfo.days[daysOfWeek[random]] =
  //           currentTeacherLec[smallestDaykey];
  //         delete currentTeacherLec[smallestDaykey];
  //         break;
  //       }
  //     }
  //   }

  //   const largestDayLecturs = getSubectsNum(currentTeacherLec, false);
  //   // console.log(largestDayLecturs);
  //   largestClassCount = countClassLectures(largestDayLecturs.arr);
  //   largestDaykey = largestDayLecturs.day;

  //   let totalLcs = classCount(classCount);
  //   for (let i = 0; i < daysOfWeek.length; i++) {
  //     let random = getRandomInt(0, 4);
  //     if (!hasSpecificKey(currentTeInfo.days, daysOfWeek[random])) {
  //       let result = checkAvaliableOrderAndAllocat(
  //         largestClassCount,
  //         random,
  //         key,
  //         totalLcs,
  //         true
  //       );
  //       if (result) {
  //         currentTeInfo.days[daysOfWeek[random]] =
  //           currentTeacherLec[largestDaykey];
  //         delete currentTeacherLec[largestDaykey];
  //         break;
  //       }
  //     }
  //   }

  //   teachersLectures[key] = currentTeacherLec;
  //   teachersScheduleInfo[key] = currentTeInfo;
  // }

  // set the golden day for every teacher
  // for (let key in teachersLectures) {
  //   let currentTeacherLec = teachersLectures[key];
  //   let currentTeInfo = teachersScheduleInfo[key];

  //   for (let day in currentTeacherLec) {
  //     let classCount = countClassLectures(currentTeacherLec[day]);
  //     const weedDays = Object(daysOfWeek);
  //     let i = 0;

  //     while (true) {
  //       const index = i % weedDays.length;
  //       const d = weedDays[index];
  //       let random = getRandomInt(4, 6);
  //       if (!hasSpecificKey(currentTeInfo.days, daysOfWeek[random])) {
  //         let result = checkAvaliableOrderAndAllocat(
  //           classCount,
  //           random,
  //           key,
  //           // 0
  //           getRandomInt(0, 7)
  //           // counter
  //         );
  //         if (result) {
  //           currentTeInfo.days[daysOfWeek[random]] = currentTeacherLec[day];
  //           delete currentTeacherLec[day];
  //           break;
  //         }
  //       }
  //       i++;
  //       console.log(classesSchedule);
  //       console.log(teachersLectures);
  //     }
  //   }
  //   teachersLectures[key] = currentTeacherLec;
  //   teachersScheduleInfo[key] = currentTeInfo;
  // }

  // for (let key in teachersScheduleInfo) {
  //   console.log(key + ":", teachersScheduleInfo[key].days);
  // }

  // console.log(classesSchedule);
  // console.log("[");
  for (let key in teachersLectures) {
    // console.log("[");
    // for (const day in teachersLectures[key]) {
    console.log(key + ":", teachersLectures[key]);
    //   console.log(",");
    // }
    // console.log("],");
  }
  // console.log("]");
}

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

const countClassLectures = (arr) => {
  // Create an object to store class counts
  const classCounts = {};

  // Loop through the data and count occurrences
  for (const item of arr) {
    const currentClass = item.class;
    // Use bracket notation for dynamic property access
    classCounts[currentClass] = (classCounts[currentClass] || 0) + 1;
  }
  return classCounts;
};

const filteredSchedule = (sch, classId) => {
  return Object.fromEntries(
    Object.entries(sch).map(([day, subjects]) => {
      return [day, subjects.filter((subject) => subject.class === classId)];
    })
  );
};

function getAllArrayCombinations(matrices, n) {
  const combinations = [];
  const usedArrays = new Set(); // Track used arrays for faster checks
  function generateCombinations(matrixIndex, currentCombination) {
    if (currentCombination.length === n) {
      combinations.push(currentCombination); // Avoid unnecessary .slice()
      return;
    }
    for (const array of matrices[matrixIndex]) {
      const arrayHash = array.join(","); // Unique representation for sets
      if (!usedArrays.has(arrayHash)) {
        usedArrays.add(arrayHash);
        generateCombinations(matrixIndex + 1, [...currentCombination, array]); // Spread for conciseness
        usedArrays.delete(arrayHash); // Backtrack for exploration
      }
    }
  }
  generateCombinations(0, []);
  return combinations;
}

// ... other functions remain unchanged

function getAllCombinations(arr, n) {
  const combinations = [];
  // Recursive function to generate combinations
  function generateCombinations(startIndex, currentCombination) {
    // Base case: if the current combination length equals n, add it to combinations
    if (currentCombination.length === n) {
      combinations.push(currentCombination.slice()); // Push a copy of the combination
      return;
    }
    // Iterate over remaining elements in the array
    for (let i = startIndex; i < arr.length; i++) {
      // Recursive call to generate combinations with the next element
      generateCombinations(i + 1, currentCombination.concat([arr[i]]));
    }
  }
  // Start the recursion with an empty combination and index 0
  generateCombinations(0, []);
  return combinations;
}

function getMatrixWithDifferentNumbers(matrices) {
  function hasDifferentNumbers(arrays) {
    const numbers = new Set();
    for (const array of arrays) {
      for (const num of array) {
        if (numbers.has(num)) {
          return false;
        }
        numbers.add(num);
      }
    }
    return true;
  }
  for (const matrix of matrices) {
    if (hasDifferentNumbers(matrix)) {
      return matrix;
    }
  }
  return null; // Return null if no matrix meets the condition
}

generateClassSchedule(classes[0]);

const jjj = [
  [
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
  ],
  [
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
  ],
  [
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
  ],
  [
    [
      { name: "Phasics", class: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    [
      { name: "Phasics", class: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    [
      { name: "Phasics", class: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    [
      { name: "Phasics", class: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    [
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
  ],
  [
    [
      { name: " Quilting", class: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    [
      { name: " Quilting", class: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    [
      { name: " Quilting", class: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    [
      { name: " Quilting", class: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
  ],
  [
    [
      {
        name: "Isramic Culture",
        class: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Isramic Culture",
        class: "3-sec",
        id: "I3",
        weeklyLectures: 4,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Isramic Culture",
        class: "3-sec",
        id: "I3",
        weeklyLectures: 4,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "3-sec",
        id: "I3",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "3-sec",
        id: "I3",
        weeklyLectures: 4,
      },
    ],
  ],
  [
    [
      { name: "Biology", class: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", class: "2-sec", id: "B2", weeklyLectures: 4 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    [
      { name: "Biology", class: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", class: "2-sec", id: "B2", weeklyLectures: 4 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    [
      { name: "Biology", class: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", class: "2-sec", id: "B2", weeklyLectures: 4 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    [
      { name: "Biology", class: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", class: "2-sec", id: "B2", weeklyLectures: 4 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
  ],
  [
    [
      { name: "History", class: "1-sec", id: "H1", weeklyLectures: 4 },
      { name: "History", class: "1-sec", id: "H1", weeklyLectures: 4 },
    ],
    [
      { name: "History", class: "1-sec", id: "H1", weeklyLectures: 4 },
      { name: "History", class: "1-sec", id: "H1", weeklyLectures: 4 },
    ],
  ],
  [
    [
      { name: "Chemistry", class: "1-sec", id: "C1", weeklyLectures: 4 },
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
    [
      { name: "Chemistry", class: "1-sec", id: "C1", weeklyLectures: 4 },
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
    [
      { name: "Chemistry", class: "1-sec", id: "C1", weeklyLectures: 4 },
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
    [
      { name: "Chemistry", class: "1-sec", id: "C1", weeklyLectures: 4 },
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
    [
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
  ],
];
