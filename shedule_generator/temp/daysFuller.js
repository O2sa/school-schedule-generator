import {
  allStartWithDifferentStrings,
  compareSets,
  getRandomElements,
  shuffle,
} from "./utils.js";

function countLeveles(arr, levelCounts = {}) {
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

function getAllCombinationsRecursive(
  arrays,
  index = 0,
  currentSelection = [],
  usedElements = [],
  results = []
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
        results
      );
      currentSelection.pop();
      usedElements.pop();
    }
  }

  getAllCombinationsRecursive(
    arrays,
    index + 1,
    currentSelection,
    usedElements,
    results
  ); // Include empty selection
  return results;
}





function setupTeachersLectures(teachLecs) {
  // console.log(teachLecs);
  const teachers = Object.keys(teachLecs);
  let daysKeys = new Set();
  let lecturesCompinations = [];



  for (let i = 0; i < teachers.length; i++) {
    let days = Object.keys(teachLecs[teachers[i]]);
    let tempObj = [];


    for (let h = 0; h < days.length; h++) {
      let ob = {};
      //   if (dayLevelsCount(teachLecs[teachers[i]][days[h]])) {
      ob[`${teachers[i]}_${days[h]}`] = teachLecs[teachers[i]][days[h]];
      daysKeys.add(`${teachers[i]}_${days[h]}`);
      tempObj.push(ob);
      //   }
    }


    lecturesCompinations.push(
      // shuffle(
      tempObj
      // )
    );
  }
  //   console.log(lecturesCompinations)
  return { teachersLectures: lecturesCompinations, daysKeys: daysKeys };
}

export default function getDaysWithFullLectures(teachersLecturesPerDays) {
  // console.log(teachersLecturesPerDays)
  const { teachersLectures, daysKeys } = setupTeachersLectures(
    teachersLecturesPerDays
  );

  console.log(teachersLectures,daysKeys);

  const combinations = getAllCombinations(shuffle(teachersLectures));
  console.log(combinations.length);



  let coms = [];

  console.log(combinations.length);

  // for (const com of combinations) {
  //   const res = countLevels(com, teachersLectures, levels);
  //   if (res) {
  //     coms.push(com);
  //   }
  // }




  while (true) {
    let tempArr = [];
    // console.log("start shuffle");

    const randomElements = shuffle(combinations);
    // console.log("done shuffle");

    const mySet = new Set();
    for (let i = 0; i < randomElements.length; i++) {
      // console.log(i);

      const keys = Object.keys(randomElements[i]);
      if (!keys.length == 0) {
        const has = keys.some((element) => mySet.has(element));
        if (!has) {
          tempArr.push(randomElements[i]);
          keys.forEach((element) => mySet.add(element));
        }
      }
    }


    if (allStartWithDifferentStrings(compareSets(mySet, daysKeys))) {
      console.log(compareSets(mySet, daysKeys));
      console.log(allStartWithDifferentStrings(compareSets(mySet, daysKeys)))
      return tempArr;
    }
  }
    return tempArr;
}


function getAllCombinations(arrays) {
  const stack = [];
  const results = [];
  stack.push({ index: 0, currentSelection: [], usedElements: [] });

  while (stack.length > 0) {
    const { index, currentSelection, usedElements } = stack.pop();

    if (index === arrays.length) {
      if (countLeveles(currentSelection)) {
        let temparr = {};
        for (let i = 0; i < currentSelection.length; i++) {
          let currKey = Object.keys(currentSelection[i])[0];
          temparr[currKey] = currentSelection[i][currKey];
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
            usedElements: newUsedElements
          });
        }
      }
      stack.push({
        index: index + 1,
        currentSelection: currentSelection.slice(),
        usedElements: usedElements.slice()
      }); // Include empty selection
    }
  }

  return results;
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
console.log(getDaysWithFullLectures(teachersLectures));
