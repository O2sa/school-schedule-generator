import {
  allStartWithDifferentStrings,
  compareSets,
  getRandomElements,
  saveDataToFile,
  shuffle,
} from "./utils.js";

const mySet = new Set();
function getAllCombinationsRecursive(
  arrays,
  index = 0,
  currentSelection = [],
  usedElements = [],
  results = [],
  daysKeys
) {
  if (index === arrays.length) {
    if (countLeveles(currentSelection)) {
      let temparr = {};
      for (let i = 0; i < currentSelection.length; i++) {
        let currKey = Object.keys(currentSelection[i])[0];
        temparr[currKey] = currentSelection[i][currKey];
      }
      // console.log(temparr);

      results.push(temparr);

      // const keys = Object.keys(temparr);
      // if (!keys.length == 0) {
      //   const has = keys.some((element) => mySet.has(element));
      //   if (!has) {
      //     results.push(temparr);
      //     console.log(results)
      //     keys.forEach((element) => mySet.add(element));
      //   }
      // }

      // if (allStartWithDifferentStrings(compareSets(mySet, daysKeys))) {
      //   console.log(
      //     results // console.log(compareSets(mySet, daysKeys));
      //   );
      //   return results
      // }
    }
    return;
  }

  for (let i = 0; i < arrays[index].length; i++) {
    const object = arrays[index][i];
    const key = JSON.stringify(object); // Unique key for object comparison
    if (!usedElements.includes(key)) {
      currentSelection.push(object);
      usedElements.push(key);
      getAllCombinationsRecursive(
        arrays,
        index + 1,
        currentSelection,
        usedElements,
        results,
        daysKeys
      );
      currentSelection.pop();
      usedElements.pop();
    }
  }
  // console.log(index);

  getAllCombinationsRecursive(
    arrays,
    index + 1,
    currentSelection,
    usedElements,
    results,
    daysKeys
  ); // Include empty selection
  return results;
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
function getLevelsCounts(keys, levelsPerDay, levels) {
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
      levelCounts[level] !== levels[level] 
      ||
      Object.keys(levelCounts).length != Object.keys(levels).length
    ) {
      return false;
    }
  }

  return true;
}

export default function getDaysWithFullLectures(
  teachersLecturesPerDays,
  levels
) {
  const { teachersLectures, levelsPerDay, teachersKeys, teachersLectures_all } =
    setupTeachersLectures(teachersLecturesPerDays);

  // console.log("levelsPerDay", levelsPerDay);
  // console.log("levels", levels);
  // console.log("teachersLectures", teachersLectures);
  // console.log("teachersKeys", teachersKeys);
  // console.log("teachersLectures_all", teachersLectures_all);
  const daysKeys = new Set(Object.keys(levelsPerDay));
  let combinations = getAllCombinations(
    // shuffle(teachersLectures),
    shuffle(teachersKeys),
    levelsPerDay,
    levels
  );

  // let coms = [];
  console.log("combinations.length", combinations.length);

  // for (const com of combinations) {
  //   const res = countLevels(com, teachersLectures, levels);
  //   if (res) {
  //     coms.push(com);
  //   }
  // }

  // console.log(coms);
  // saveDataToFile(teachersLectures_all, "tes.json");
  while (true) {
    const mySet = new Set();
    let newComs = [];
    combinations = shuffle(combinations);

    for (let com of combinations) {
      if (com.length == 0) continue;
      const has = com.some((element) => mySet.has(element));
      if (!has) {
        newComs.push(com);
        com.forEach((element) => mySet.add(element));
      }
    }
    // console.log(newComs);
    if (allStartWithDifferentStrings(compareSets(mySet, daysKeys))) {
      let newCombinations = [];
      for (const com of newComs) {
        let temp = {};
        for (const c of com) {
          temp[c] = teachersLectures_all[c];
        }
        newCombinations.push(temp);
      }
      return newCombinations;
    }
    // if (newComs.length > 3)
    // console.log(newComs);
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

// getDaysWithFullLectures(teachersLectures, {
//   "1_level": 7,
//   "2_level": 7,
//   "3_level": 7,
// });

function getAllCombinationsIterative(arrays) {
  let results = [];
  let combinations = [];

  // Loop through each array
  for (let i = 0; i < arrays.length; i++) {
    let currentArray = arrays[i];

    // Handle empty selection for the first array
    if (i === 0) {
      combinations.push([]); // Add empty selection for first iteration
    }

    let newCombinations = [];
    // Loop through elements in the current array
    for (let j = 0; j < currentArray.length; j++) {
      let object = currentArray[j];

      // Loop through existing combinations
      for (let k = 0; k < combinations.length; k++) {
        const existingCombination = combinations[k];
        const newCombination = [...existingCombination, object]; // Clone and add object
        newCombinations.push(newCombination);
      }
    }
    combinations = newCombinations; // Update combinations for next iteration
  }

  // Process and convert results (optional)
  for (const combination of combinations) {
    const temparr = {};
    for (let i = 0; i < combination.length; i++) {
      const currKey = Object.keys(combination[i])[0];
      temparr[currKey] = combination[i][currKey];
    }
    results.push(temparr);
  }

  return results;
}
