import {
  getLevelLecturesPerDay,
  getLevelSubjects,
  getSchoolInfo,
} from "./setupData.js";
import distributeTeacherLectures from "./teacherLectures.js";
import { calculateSum } from "./utils.js";

export function isLevelLecturesValid(level) {
  const totalLectures = calculateSum(getLevelSubjects(level), "weeklyLectures");
  if (totalLectures <= level.DailyLectures * getSchoolInfo().workDays)
    console.log(`${level.name} have valid lectures`);
  else console.log(`${level.name} have not valid lectures`);
}

export function isTeacherLecturesValid(teacher, levelsDays) {
  const teacherLectures = distributeTeacherLectures(teacher);
  const levelsCounts = countLeveles(teacherLectures);

  console.log(teacherLectures);

  console.log(levelsCounts);
  let booleanArray = new Array(levelsCounts.length).fill(true);

  for (let i = 0; i < levelsCounts.length; i++) {
    let currentTeD = levelsCounts[i];
    for (let h = 0; h < 6; h++) {
      for (const level in currentTeD) {
        if (currentTeD[level] + levelsDays[level][h] <= 7 && booleanArray[h]) {
          levelsDays[level][h] += currentTeD[level];
          currentTeD[level] = 0;
          booleanArray[h] = false;
        //   break;
        }
      }
      levelsCounts[i] = currentTeD;
      if(allEqual(levelsCounts[0]))
      break

    }
    if (allEqual(levelsCounts[i])) {
      console.log(`${teacher.name} is valid in day${i + 1}`);
    } else console.log(`${teacher.name} is not valid in day${i + 1}`);

    console.log(levelsDays);
  }
  return levelsDays;
}



function getValidSlots(){

}
function allEqual(obj) {
  for (const key in obj) {
    // Check if the property exists (avoid prototype properties)
    if (obj.hasOwnProperty(key)) {
      // Use strict comparison (===) to check for equality with 4
      if (obj[key] !== 0) {
        return false;
      }
    }
  }
  return true;
}
function validSpace() {}

function countLeveles(arr) {
  // console.log(arr);
  let keys = Object.keys(arr);
  let tempArr = [];
  for (let i = 0; i < keys.length; i++) {
    let tempObj = {};
    arr[keys[i]].forEach((obj) => {
      const { level: levelType } = obj;
      // console.log(levelType)
      if (tempObj[levelType]) {
        tempObj[levelType]++;
      } else {
        tempObj[levelType] = 1;
      }
    });
    tempArr.push(tempObj);
  }
  return tempArr;
}
