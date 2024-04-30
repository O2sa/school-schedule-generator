import {
  allStartWithDifferentStrings,
  compareSets,
  getRandomElements,
  shuffle,
} from "./utils.js";

function countLevels(arr, levels) {
  // console.log(arr);
 let levelCounts={}
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
  for (const level in levelCounts) {
    if (levelCounts[level] !== levels[level]) {
      return false;
    }
  }


  // const allFour = Object.values(levelCounts).every((value) => value === 7);
  // //  console.log(levelCounts)
  // if (allFour) {
  //   return true;
  // }

  return true;
}

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

function setupTeachersLectures(teachLecs) {
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

export default function getDaysWithFullLectures(teachersLecturesPerDays, levels) {
  const { teachersLectures, daysKeys } = setupTeachersLectures(
    teachersLecturesPerDays
  );

  console.log(teachersLectures, daysKeys, levels);
  const combinations = getAllCombinations(
    shuffle(teachersLectures),
    // 0,
    // [],
    // [],
    // [],
    levels
  );
  console.log(combinations)

  console.log(combinations.length);

  while (true) {
    let tempArr = [];
    const randomElements = shuffle(combinations);
    const mySet = new Set();
    for (let i = 0; i < randomElements.length; i++) {
      const keys = Object.keys(randomElements[i]);
      if (!keys.length == 0) {
        const has = keys.some((element) => mySet.has(element));
        if (!has) {
          tempArr.push(randomElements[i]);
          // console.log(randomElements[i]);

          keys.forEach((element) => mySet.add(element));
        }
      }
    }

    if (allStartWithDifferentStrings(compareSets(mySet, daysKeys))) {
      // console.log(compareSets(mySet, daysKeys));
      // console.log(tempArr);
      return tempArr;
    }
  }

  return tempArr;
}

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


function getAllCombinations(arrays, levels) {
  const stack = [];
  const results = [];
  stack.push({ index: 0, currentSelection: [], usedElements: [] });

  while (stack.length > 0) {
    const { index, currentSelection, usedElements } = stack.pop();

    if (index === arrays.length) {
      if (countLevels(currentSelection, levels)) {
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

// t_1: 1,2,3
// t_2: 5,4,7

// t_3: 1,3,7

// ['t_2','t_2','','t_1','t_1','t_1','',]
