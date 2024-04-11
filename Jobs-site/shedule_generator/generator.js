import {
  classCount,
  checkEmptySlots,
  hasSpecificKey,
  getAllArrayCombinations,
  getRandomInt,
  getMatrixWithDifferentNumbers,
} from "./utils.js";

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
