import fs from "fs";
import { DAYS_OF_WEEK_TEMP, WEEK_DAYS } from "../utils/constants.js";

export function getRandomInt(min, max) {
  min = Math.ceil(min); // Round up minimum value (inclusive)
  max = Math.floor(max); // Round down maximum value (exclusive)
  return Math.floor(Math.random() * (max - min)) + min;
}

export function hasSpecificKey(obj, key) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop) && prop === key) {
      return true;
    }
  }
  return false;
}

// export const levelCount = (levelLec) => {
//   let totalReqSlots = 0;
//   for (let key in levelLec) {
//     totalReqSlots += levelLec[key];
//   }
//   return totalReqSlots;
// };

export function getAllArrayCombinations(matrices, n) {
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

export function getAllCombinations(arr, n) {
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

export function getMatrixWithDifferentNumbers(matrices) {
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

export function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export function sortByLengthRef(obj, dsce = true) {
  let sortedKeys;
  if (dsce) {
    sortedKeys = Object.keys(obj).sort((key1, key2) => {
      return Object.keys(obj[key2]).length - Object.keys(obj[key1]).length; // Reverse the comparison order
    });
  } else {
    sortedKeys = Object.keys(obj).sort((key1, key2) => {
      return Object.keys(obj[key1]).length - Object.keys(obj[key2]).length; // Reverse the comparison order
    });
  }

  return {
    ...obj, // Spread the original object to create a copy
    sort: () => {
      const sortedObject = {};
      for (const key of sortedKeys) {
        sortedObject[key] = obj[key];
      }
      return sortedObject;
    },
  };
}

export function shuffleObject(obj) {
  const keys = Object.keys(obj);
  let currentIndex = keys.length,
    randomIndex;

  // While there are elements remaining to shuffle
  while (currentIndex !== 0) {
    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap the current element with the random element
    [keys[currentIndex], keys[randomIndex]] = [
      keys[randomIndex],
      keys[currentIndex],
    ];
  }

  const shuffledObject = {};
  for (const key of keys) {
    shuffledObject[key] = obj[key];
  }

  return shuffledObject;
}

export function calculateSum(array, property) {
  // Check if property is provided (optional)
  if (!property) {
    throw new Error("Please provide a property name to calculate the sum for.");
  }

  let totalSum = 0;
  for (const obj of array) {
    // Check if the object has the specified property
    if (obj.hasOwnProperty(property)) {
      // Ensure the value is a number before adding
      const value = obj[property];
      if (typeof value === "number") {
        totalSum += value;
      } else {
        console.warn(
          `Skipping non-numeric value for property "${property}" in object:`,
          obj
        );
      }
    } else {
      console.warn(`Property "${property}" not found in object:`, obj);
    }
  }
  return totalSum;
}

export function getRandomElements(arr, numElements) {
  if (numElements > arr.length) {
    throw new Error(
      "Number of elements to choose cannot be greater than the array length."
    );
  }

  const shuffledArr = [...arr]; // Create a copy to avoid modifying the original array

  // Shuffle the array using Fisher-Yates
  let currentIndex = shuffledArr.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [shuffledArr[currentIndex], shuffledArr[randomIndex]] = [
      shuffledArr[randomIndex],
      shuffledArr[currentIndex],
    ];
  }

  return shuffledArr.slice(0, numElements); // Select the first numElements items
}

export function hasValueGreaterThanOne(obj) {
  for (const key in obj) {
    // Check if the property exists (avoid prototype properties)
    if (obj.hasOwnProperty(key)) {
      // Check if the value is a number and greater than 1
      if (typeof obj[key] === "number" && obj[key] > 1) {
        return true;
      }
    }
  }
  return false;
}

export function compareSets(setA, setB) {
  // Difference: Elements in A but not in B
  const differenceAB = new Set([...setA].filter((x) => !setB.has(x)));

  // Difference: Elements in B but not in A
  const differenceBA = new Set([...setB].filter((x) => !setA.has(x)));

  // Combine both differences
  const combinedDifference = new Set([...differenceAB, ...differenceBA]);

  return combinedDifference;
}

export function dayLevelsCount(arr) {
  // console.log(arr);
  for (let i = 0; i < arr.length; i++) {
    let obj = arr[i];
    const { level: levelType } = obj;
    // console.log(levelType)
    if (obj[levelType]) {
      obj[levelType]++;
    } else {
      obj[levelType] = 1;
    }
    if (hasValueGreaterThanOne(obj)) return true;
  }
}

export function allStartWithDifferentStrings(mySet) {
  const firstChars = new Set();

  for (const element of mySet) {
    const firstChar = element.split("_")[0]; // Extract the first part before the underscore

    // Check if the first character is already present in the set
    if (firstChars.has(firstChar)) {
      return false; // Duplicate starting character found
    }

    firstChars.add(firstChar); // Add the first character to the set
  }

  return true; // All elements start with unique strings
}

export const countLevelLectures = (arr) => {
  // Create an object to store level counts
  const levelCounts = {};

  // Loop through the data and count occurrences
  for (const item of arr) {
    // console.log(item)
    const currentLevel = item.level;
    // Use bracket notation for dynamic property access
    levelCounts[currentLevel] = (levelCounts[currentLevel] || 0) + 1;
  }
  return levelCounts;
};

export function getTeachersByUnavailableDay(day, teachers) {
  // Step 1: Get teachers with matching unavailable day
  const matchingTeachers = teachers.filter((teacher) => {
    return (
      teacher.offDaysAndLectures.length > 0 &&
      teacher.offDaysAndLectures.some(
        (unavailableDay) => unavailableDay.day === day
      )
    );
  });

  // Step 2: Find shared offLectures among matching teachers (New)
  if (matchingTeachers.length > 1) {
    const firstUnavailableDays = matchingTeachers[0].offDaysAndLectures.filter(
      (dayEntry) => dayEntry.day === day
    )[0];

    // Get the specific unavailableDay entry for the given day
    const sharedOffLectures = firstUnavailableDays.offLectures.filter(
      (offLecture) =>
        matchingTeachers.every((teacher) => {
          const matchingDay = teacher.offDaysAndLectures.find(
            (dayEntry) => dayEntry.day === day
          );
          return matchingDay && matchingDay.offLectures.includes(offLecture);
        })
    );

    //   // Step 3: Filter teachers based on shared offLectures (New)
    //   return matchingTeachers.filter((teacher) => {
    //     const matchingDay = teacher.offDaysAndLectures.find(
    //       (dayEntry) => dayEntry.day === day
    //     );
    //     return (
    //       matchingDay &&
    //       matchingDay.offLectures.some((offLecture) =>
    //         sharedOffLectures.includes(offLecture)
    //       )
    //     );
    //   });
  }

  // Step 4: Return original matching teachers (Unmodified)

  return matchingTeachers;
}

export function getPermutations(array) {
  if (array.length === 1) {
    return [array];
  }

  const permutations = [];
  for (let i = 0; i < array.length; i++) {
    const currentElement = array[i];
    const remainingElements = array.slice(0, i).concat(array.slice(i + 1));
    const subPermutations = getPermutations(remainingElements);
    for (const subPermutation of subPermutations) {
      permutations.push(subPermutation.concat(currentElement)); // Add current element to each sub-permutation
    }
  }

  return permutations;
}

export function saveDataToFile(data, fileName = "data.json") {
  const d = JSON.stringify(data, null, 2); // Convert object to JSON string with indentation

  try {
    fs.writeFileSync(fileName, d);
    console.log("Object written to file successfully");
  } catch (error) {
    console.error("Error writing object to file:", error);
  }
}

export function getLargestPropertyValue(array, propertyName) {
  let largestValue = -Infinity; // Initialize with a negative infinity

  for (const obj of array) {
    const value = obj[propertyName];
    if (value > largestValue) {
      largestValue = value;
    }
  }
  return largestValue;
}

export function getSmallestPropertyValue(arr, property) {
  let smallestValue = Infinity; // Initialize with positive infinity
  for (const obj of arr) {
    if (property in obj && obj[property] < smallestValue) {
      smallestValue = obj[property];
    }
  }
  return smallestValue === Infinity ? null : smallestValue; // Handle case where property doesn't exist
}

export function getObjSmallestProperty(obj) {
  let smallestProp = null;
  let smallestValue = -Infinity;

  for (const property in obj) {
    if (obj[property] > smallestValue) {
      smallestProp = property;
      smallestValue = obj[property];
    }
  }
  return smallestProp; // Handle case where property doesn't exist
}

export function* permutationsGenerator(arr) {
  if (arr.length === 1) {
    yield arr;
    return;
  }

  for (let i = 0; i < arr.length; i++) {
    const firstElement = arr[i];
    const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const perm of permutationsGenerator(remaining)) {
      yield [firstElement, ...perm];
    }
  }
}

function cycleArray(array, positions) {
  // Calculate the number of positions to cycle
  const offset = positions % array.length;

  // If offset is negative, adjust it to cycle in the opposite direction
  const adjustedOffset = offset >= 0 ? offset : offset + array.length;

  // Slice the array into two parts and concatenate them in the desired order
  return array.slice(adjustedOffset).concat(array.slice(0, adjustedOffset));
}

export function getElementsByIds(elements, elementsIds) {
  const filteredElements = [];

  for (const element of elements) {
    // console.log(teacher._id.toString())
    // console.log(teacherIds)

    if (elementsIds.includes(element._id.toString())) {
      filteredElements.push(element);
    }
  }

  return filteredElements;
}

export function getElementById(elements, elementId) {
  return elements.find((val) => val._id == elementId);
}

export function getElementsByKeys(elements, elementsIds) {
  const filteredElements = [];

  for (const element in elements) {
    // console.log(teacher._id.toString())
    // console.log(teacherIds)

    if (elementsIds.includes(element.toString())) {
      filteredElements[element] = elements[element];
    }
  }

  return filteredElements;
}
export function allElementsDifferent(arr) {
  /*
  This function checks if all elements in an array are distinct (different).

  Args:
      arr: The input array.

  Returns:
      True if all elements are different, False otherwise.
  */
  return new Set(arr).size === arr.length;
}

export function* getAllCombinationsGenerator(arrays) {
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

export function cleanTheDay(schedules, day) {
  for (const schedule in schedules) {
    schedules[schedule][day] = Array(schedules[schedule][day].length).fill(
      null
    );
  }
}

export function getWeekDays(startDay, workDays) {
  let weekDays = [];
  const startDayEn = Object.keys(WEEK_DAYS).find(
    (val) => WEEK_DAYS[val] === startDay
  );
  weekDays = DAYS_OF_WEEK_TEMP.slice(
    DAYS_OF_WEEK_TEMP.indexOf(startDayEn),
    DAYS_OF_WEEK_TEMP.indexOf(startDayEn) + workDays
  );

  return weekDays;
}

export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    // Get the value of the key by which we want to group
    const groupKey = currentValue[key];

    // If the group doesn't exist yet, create it
    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    // Add the current object to the group
    result[groupKey].push(currentValue);

    return result;
  }, {});
};
// console.log(getWeekDays("الإثنين", 7));
