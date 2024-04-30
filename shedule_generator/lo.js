// import { shuffle } from "./utils";
import { fakeData } from "./mockData.js";
import {
  allStartWithDifferentStrings,
  compareSets,
  getPermutations,
  shuffle,
  shuffleObject,
} from "./utils.js";

function* generateCombinations(arrays) {
  const stack = [];
  const indexes = new Array(arrays.length).fill(0);

  while (true) {
    let result = [];
    for (let i = 0; i < arrays.length; i++) {
      result.push(arrays[i][indexes[i]]);
    }
    yield result;

    let next = arrays.length - 1;
    while (next >= 0 && indexes[next] + 1 >= arrays[next].length) {
      next--;
    }

    if (next < 0) {
      return;
    }

    indexes[next]++;
    for (let i = next + 1; i < arrays.length; i++) {
      indexes[i] = 0;
    }
  }
}

function getAllCombinations(arrays, levelsPerDay, levels) {
  const stack = [];
  const results = [];
  stack.push({ index: 0, currentSelection: [], usedElements: [] });

  while (stack.length > 0) {
    const { index, currentSelection, usedElements } = stack.pop();

    if (index === arrays.length) {
      if (getLevelsCounts(currentSelection, levelsPerDay, levels)) {
        let temparr = [];
        for (let i = 0; i < currentSelection.length; i++) {
          temparr.push(currentSelection[i]);
        }
        results.push(temparr);
      }
    } else {
      for (let i = 0; i < arrays[index].length; i++) {
        const object = arrays[index][i];
        const key = JSON.stringify(object); // Unique key for object comparison
        if (!usedElements.includes(key)) {
          const newCurrentSelection = currentSelection.slice();
          const newUsedElements = usedElements.slice();
          newCurrentSelection.push(object);
          newUsedElements.push(key);
          stack.push({
            index: index + 1,
            currentSelection: newCurrentSelection,
            usedElements: newUsedElements,
          });
        }
      }
      stack.push({
        index: index + 1,
        currentSelection: currentSelection.slice(),
        usedElements: usedElements.slice(),
      }); // Include empty selection
    }
  }

  return results;
}

function getAllCombinationsArr(arr) {
  const results = [];

  function helper(subset = [], startIndex = 0) {
    results.push(subset.slice()); // Add current subset to results

    // Loop through remaining elements from startIndex
    for (let i = startIndex; i < arr.length; i++) {
      helper([...subset, arr[i]], i + 1); // Include current element, move to next index
    }
  }

  helper();
  return results;
}

function countLevels_1(arr, levelCounts = {}) {
  // console.log(arr);
  for (let i = 0; i < arr.length; i++) {
    arr[i][Object.keys(arr[i])[0]].forEach((obj) => {
      const { level: levelType } = obj;
      // console.log(levelType)
      if (levelCounts[levelType]) {
        levelCounts[levelType]++;
      } else {
        levelCounts[levelType] = 1;
      }
    });
  }
  const allFour = Object.values(levelCounts).every((value) => value === 7);
  //  console.log(levelCounts)
  if (allFour) {
    return true;
  }
  return false;
}

// Example arrays
function cycleArray(array, positions) {
  // Calculate the number of positions to cycle
  const offset = positions % array.length;

  // If offset is negative, adjust it to cycle in the opposite direction
  const adjustedOffset = offset >= 0 ? offset : offset + array.length;

  // Slice the array into two parts and concatenate them in the desired order
  return array.slice(adjustedOffset).concat(array.slice(0, adjustedOffset));
}

// [].sl
function getLevelsCounts(keys, levelsPerDay, levels) {
  let levelCounts = {};
  // console.log('keys',keys)
  // console.log('arr',arr)

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
  console.log(levelCounts);

  for (const level in levelCounts) {
    if (levelCounts[level] !== levels[level]) {
      return false;
    }
  }

  return true;
}

function setupTeachersLectures(teachLecs) {
  const teachers = Object.keys(teachLecs);
  let levelsPerDay = {};
  let lecturesCompinations_all = {};
  let teachersKeys = [];
  let lecturesCompinations = [];

  for (let i = 0; i < teachers.length; i++) {
    let days = Object.keys(teachLecs[teachers[i]]);
    let temp = [];
    let tempObj = [];

    for (let h = 0; h < days.length; h++) {
      let ob = {};
      ob[`${teachers[i]}_${days[h]}`] = teachLecs[teachers[i]][days[h]];

      lecturesCompinations_all[`${teachers[i]}_${days[h]}`] =
        teachLecs[teachers[i]][days[h]];
      temp.push(`${teachers[i]}_${days[h]}`);
      levelsPerDay[`${teachers[i]}_${days[h]}`] = getLevelsPerDay(
        teachLecs[teachers[i]][days[h]]
      );
      tempObj.push(ob);
    }

    teachersKeys.push(temp);
    lecturesCompinations.push(tempObj);
  }

  return {
    teachersLectures: lecturesCompinations,
    teachersLectures_all: lecturesCompinations_all,
    levelsPerDay: levelsPerDay,
    teachersKeys: teachersKeys,
  };
}

function getLevelsPerDay(day) {
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

function getDaysWithFullLectures(teachersLecturesPerDays, levels) {
  const { teachersLectures, levelsPerDay, teachersKeys, teachersLectures_all } =
    setupTeachersLectures(teachersLecturesPerDays);

  // console.log("levelsPerDay", levelsPerDay);
  // console.log("teachersLectures", teachersLectures);
  // console.log("teachersKeys", teachersKeys);
  console.log("teachersLectures_all", teachersLectures_all);
  const daysKeys=new Set(Object.keys(levelsPerDay))

  
  let combinations = getAllCombinations(
    // shuffle(teachersLectures),
    shuffle(teachersKeys),
    levelsPerDay,
    levels
  );
  // let coms = [];
  console.log(combinations.length);

  // for (const com of combinations) {
  //   const res = countLevels(com, teachersLectures, levels);
  //   if (res) {
  //     coms.push(com);
  //   }
  // }

  // console.log(coms);


  while (true) {
    const mySet = new Set();
    let newComs = [];
    combinations = shuffle(combinations);

    for (let com of combinations) {
      if (com.length ==0) continue;
      const has = com.some((element) => mySet.has(element));
      if (!has) {
        newComs.push(com);
        com.forEach((element) => mySet.add(element));
      }
    }
    // console.log(newComs);
    if (allStartWithDifferentStrings(compareSets(mySet, daysKeys))) {
      console.log(compareSets(mySet, daysKeys));
      console.log(newComs);
      break;
    }
  }


}

const teachersLectures = {
  history_te: {
    Day_1: [
      {
        name: "تأريخ",
        level: "1_level",
      },
      {
        name: "تأريخ",
        level: "1_level",
      },
    ],
    Day_2: [
      {
        name: "تأريخ",
        level: "1_level",
      },
      {
        name: "تأريخ",
        level: "1_level",
      },
    ],
  },
  sport_te: {
    Day_1: [
      {
        name: "رياضة",
        level: "2_level",
      },
      {
        name: "رياضة",

        level: "3_level",
      },
      {
        name: "رياضة",

        level: "1_level",
      },
    ],
    Day_2: [
      {
        name: "رياضة",
        level: "2_level",
      },
      {
        name: "رياضة",
        level: "3_level",
      },
      {
        name: "رياضة",
        level: "1_level",
      },
    ],
  },
  islam_te: {
    Day_1: [
      {
        name: "سيرة نبوية",
        level: "2_level",
      },
      {
        name: "سيرة نبوية",

        level: "2_level",
      },
      {
        name: "سيرة نبوية",

        level: "3_level",
      },
      {
        name: "سيرة نبوية",

        level: "2_level",
      },
      {
        name: "سيرة نبوية",

        level: "1_level",
      },
    ],
    Day_2: [
      {
        name: "سيرة نبوية",

        level: "2_level",
      },
      {
        name: "سيرة نبوية",

        level: "3_level",
      },
      {
        name: "سيرة نبوية",

        level: "2_level",
      },
      {
        name: "سيرة نبوية",

        level: "1_level",
      },
    ],
    Day_3: [
      {
        name: "سيرة نبوية",

        level: "2_level",
      },
      {
        name: "سيرة نبوية",

        level: "3_level",
      },
      {
        name: "سيرة نبوية",

        level: "1_level",
      },
      {
        name: "سيرة نبوية",

        level: "1_level",
      },
    ],
  },
  phasic_te: {
    Day_1: [
      {
        name: "فيزياء",

        level: "2_level",
      },
      {
        name: "فيزياء",

        level: "2_level",
      },
      {
        name: "فيزياء",

        level: "3_level",
      },
      {
        name: "فيزياء",

        level: "2_level",
      },
    ],
    Day_2: [
      {
        name: "فيزياء",

        level: "2_level",
      },
      {
        name: "فيزياء",

        level: "3_level",
      },
      {
        name: "فيزياء",

        level: "1_level",
      },
      {
        name: "فيزياء",

        level: "1_level",
      },
    ],
    Day_3: [
      {
        name: "فيزياء",

        level: "2_level",
      },
      {
        name: "فيزياء",

        level: "3_level",
      },
      {
        name: "فيزياء",

        level: "1_level",
      },
    ],
    Day_4: [
      {
        name: "فيزياء",

        level: "2_level",
      },
      {
        name: "فيزياء",

        level: "3_level",
      },
      {
        name: "فيزياء",

        level: "1_level",
      },
    ],
  },
  biology_te: {
    Day_1: [
      {
        name: "أحياء",
        level: "3_level",
      },
      {
        name: "أحياء",
        level: "2_level",
      },
      {
        name: "أحياء",
        level: "1_level",
      },
    ],
    Day_2: [
      {
        name: "أحياء",
        level: "2_level",
      },
      {
        name: "أحياء",

        level: "1_level",
      },
      {
        name: "أحياء",
        level: "1_level",
      },
    ],
    Day_3: [
      {
        name: "أحياء",
        level: "3_level",
      },
      {
        name: "أحياء",
        level: "1_level",
      },
    ],
    Day_4: [
      {
        name: "أحياء",
        level: "3_level",
      },
      {
        name: "أحياء",
        level: "1_level",
      },
    ],
  },
  qura_te: {
    Day_1: [
      {
        name: "قرآن كريم",
        level: "2_level",
      },
      {
        name: "قرآن كريم",
        level: "2_level",
      },
      {
        name: "قرآن كريم",
        level: "3_level",
      },
      {
        name: "قرآن كريم",

        level: "1_level",
      },
      {
        name: "قرآن كريم",

        level: "3_level",
      },
    ],
    Day_2: [
      {
        name: "قرآن كريم",

        level: "2_level",
      },
      {
        name: "قرآن كريم",

        level: "3_level",
      },

      {
        name: "قرآن كريم",

        level: "1_level",
      },
      {
        name: "قرآن كريم",
        level: "3_level",
      },
    ],
    Day_3: [
      {
        name: "قرآن كريم",
        level: "2_level",
      },
      {
        name: "قرآن كريم",

        level: "3_level",
      },

      {
        name: "قرآن كريم",

        level: "1_level",
      },
      {
        name: "قرآن كريم",

        level: "3_level",
      },
    ],
    Day_4: [
      {
        name: "قرآن كريم",
        level: "2_level",
      },
      {
        name: "قرآن كريم",

        level: "3_level",
      },

      {
        name: "قرآن كريم",

        level: "1_level",
      },
      {
        name: "قرآن كريم",

        level: "3_level",
      },
    ],
  },
  chemistry_te: {
    Day_1: [
      {
        name: "كيمياء",

        level: "2_level",
      },
      {
        name: "كيمياء",

        level: "3_level",
      },
      {
        name: "كيمياء",

        level: "1_level",
      },
    ],
    Day_2: [
      {
        name: "كيمياء",

        level: "2_level",
      },
      {
        name: "كيمياء",

        level: "3_level",
      },
      {
        name: "كيمياء",

        level: "1_level",
      },
    ],
    Day_3: [
      {
        name: "كيمياء",

        level: "2_level",
      },
      {
        name: "كيمياء",

        level: "3_level",
      },
      {
        name: "كيمياء",

        level: "1_level",
      },
    ],
    Day_4: [
      {
        name: "كيمياء",

        level: "2_level",
      },
      {
        name: "كيمياء",

        level: "3_level",
      },
    ],
    Day_5: [
      {
        name: "كيمياء",

        level: "3_level",
      },
      {
        name: "كيمياء",

        level: "1_level",
      },
    ],
  },
  sarf_te: {
    Day_1: [
      {
        name: "صرف",

        level: "2_level",
      },
      {
        name: "صرف",

        level: "3_level",
      },
      {
        name: "صرف",

        level: "1_level",
      },
    ],
    Day_2: [
      {
        name: "صرف",

        level: "2_level",
      },
      {
        name: "صرف",

        level: "3_level",
      },
      {
        name: "صرف",

        level: "1_level",
      },
    ],
    Day_3: [
      {
        name: "صرف",

        level: "2_level",
      },
      {
        name: "صرف",

        level: "3_level",
      },
      {
        name: "صرف",

        level: "1_level",
      },
    ],
    Day_4: [
      {
        name: "صرف",

        level: "2_level",
      },
      {
        name: "صرف",

        level: "3_level",
      },
      {
        name: "صرف",

        level: "1_level",
      },
    ],
    Day_5: [
      {
        name: "صرف",

        level: "2_level",
      },
      {
        name: "صرف",

        level: "3_level",
      },
      {
        name: "صرف",

        level: "1_level",
      },
    ],
  },
  algibra_te: {
    Day_1: [
      {
        name: "جبر",

        level: "2_level",
      },
      {
        name: "جبر",

        level: "3_level",
      },
      {
        name: "جبر",

        level: "1_level",
      },
    ],
    Day_2: [
      {
        name: "جبر",

        level: "2_level",
      },
      {
        name: "جبر",

        level: "3_level",
      },
      {
        name: "جبر",

        level: "1_level",
      },
    ],
    Day_3: [
      {
        name: "جبر",

        level: "2_level",
      },
      {
        name: "جبر",

        level: "3_level",
      },
      {
        name: "جبر",

        level: "1_level",
      },
    ],
    Day_4: [
      {
        name: "جبر",

        level: "2_level",
      },
      {
        name: "جبر",

        level: "3_level",
      },
      {
        name: "جبر",

        level: "1_level",
      },
    ],
    Day_5: [
      {
        name: "جبر",

        level: "2_level",
      },
      {
        name: "جبر",

        level: "3_level",
      },
      {
        name: "جبر",

        level: "1_level",
      },
    ],
    Day_6: [
      {
        name: "جبر",

        level: "2_level",
      },
      {
        name: "جبر",

        level: "3_level",
      },
      {
        name: "جبر",

        level: "1_level",
      },
    ],
  },
  naho_te: {
    Day_1: [
      {
        name: "نحو",

        level: "2_level",
      },
      {
        name: "نحو",

        level: "3_level",
      },
      {
        name: "نحو",

        level: "1_level",
      },
    ],
    Day_2: [
      {
        name: "نحو",

        level: "2_level",
      },
      {
        name: "نحو",

        level: "3_level",
      },
      {
        name: "نحو",

        level: "1_level",
      },
    ],
    Day_3: [
      {
        name: "نحو",

        level: "2_level",
      },
      {
        name: "نحو",

        level: "3_level",
      },
      {
        name: "نحو",

        level: "1_level",
      },
    ],
    Day_4: [
      {
        name: "نحو",

        level: "2_level",
      },
      {
        name: "نحو",

        level: "3_level",
      },
      {
        name: "نحو",

        level: "1_level",
      },
    ],
    Day_5: [
      {
        name: "نحو",

        level: "2_level",
      },
      {
        name: "نحو",

        level: "3_level",
      },
    ],
    Day_6: [
      {
        name: "نحو",
        level: "2_level",
      },
      {
        name: "نحو",

        level: "3_level",
      },
    ],
  },
};

getDaysWithFullLectures(fakeData.data.teachersLectures, fakeData.data.levelsDailyLectures);

// ;getDaysWithFullLectures(teachefrsLectures, {
//   "1_level": 7,
//   "2_level": 7,
//   "3_level": 7,
// });

// Generate combinations
// const combinations = generateCombinations(kj);
// console.log(combinations.length);
// Output combinations
// for (let combination of combinations) {
//   console.log(combination);
// }



function* getAllCombinationsGenerator(arrays) {
  const stack = [];
  const currentSelection = [];

  function* iterate(currentIndex) {
    if (currentIndex === arrays.length) {
      yield currentSelection.slice();
      return;
    }

    for (let i = 0; i < arrays[currentIndex].length; i++) {
      currentSelection.push(arrays[currentIndex][i]);
      yield* iterate(currentIndex + 1);
      currentSelection.pop();
    }

    yield* iterate(currentIndex + 1); // Include empty selection for the current array
  }

  yield* iterate(0);
}
