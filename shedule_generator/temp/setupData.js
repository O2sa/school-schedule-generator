import {
  leveles,
  subjects,
  daysOfWeek,
  teachers,
  schoolData,
} from "./mockData.js";

export const getTeacherSubjects = (teacher) => {
  return teacher.subjects.reduce((tSubjects, subjectId) => {
    const subject = subjects.find((subject) => subject.id === subjectId);
    tSubjects.push(subject);
    return tSubjects;
  }, []);
};

export const getAllTeachers = () => {
  return teachers;
};
export const getAllLevels = () => {
  return leveles;
};

export const getLevelSubjects = (level) => {
  return level.subjects.reduce((leSubjects, subjectId) => {
    const subject = subjects.find((subject) => subject.id === subjectId);
    leSubjects.push(subject);
    return leSubjects;
  }, []);
};
export const getSchoolInfo = () => {
  return schoolData;
};
export const getWeekDays = () => {
  return daysOfWeek;
};

export function getLevelLecturesPerDay() {
  let levels = getAllLevels();
  let levelsLecturesPerDay = {};
  for (const level of leveles) {
    let temp = {};
   
    levelsLecturesPerDay[level.id] = new Array(6).fill(0);
  }
  return levelsLecturesPerDay;
}



export const initialData = () => {
    //intialize the levels schedules
    let levelsSchedule = {};
    let teachersSchedule = {};
  
    const  levels = getAllLevels();
    const schoolInfo = getSchoolInfo();
    const teachers = getAllTeachers();
  
    for (let key in levels) {
      let tempArr = Array.from({ length: schoolInfo.workDays }, () =>
        Array(levels[key].DailyLectures).fill("empty")
      );
      levelsSchedule[levels[key].id] = tempArr;
    }
    for (let key in teachers) {
      let tempArr = Array.from({ length: schoolInfo.workDays }, () =>
        Array(levels[0].DailyLectures).fill("empty")
      );
      teachersSchedule[teachers[key].id] = tempArr;
    }
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
    //   teachersLectures,
      teachersSchedule,
      levelsSchedule,
    };
  };