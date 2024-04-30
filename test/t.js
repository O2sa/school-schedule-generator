const levelCount = (levelLec) => {
  let totalReqSlots = 0;
  for (let key in levelLec) {
    totalReqSlots += levelLec[key];
  }
  return totalReqSlots;
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

function checkEmptySlots(matrix, goldenDay = false, startIndex = 0, endIndex) {
  // console.log("---------------------------------");
  // console.log("end checkEmptySlots");
  // console.log("-------------------------------");
  let levelsFreeIndexes = [];
  if (goldenDay) {
    // console.log('goldenDay', goldenDay)
    // console.log('endIndex', endIndex)
    // console.log('matrix', matrix)

    for (let i = 0; i < matrix.length; i++) {
      // console.log('i', i)

      let tempArr = [];
      for (let h = 0; h < endIndex; h++) {
        // console.log('h', h)

        if (matrix[i][h] == "empty") tempArr.push(h);
      }
      levelsFreeIndexes.push(tempArr);
    }
  } else {
    for (let i = 0; i < matrix.length; i++) {
      let tempArr = [];
      for (let h = 0; h < matrix[i].length; h++) {
        if (matrix[i][h] == "empty") tempArr.push(h);
      }
      levelsFreeIndexes.push(tempArr);
    }
  }
  // console.log("---------------------------------");
  // console.log("end checkEmptySlots");
  // console.log("-------------------------------");
  return levelsFreeIndexes;
}

const checkAvaliableOrderAndAllocat = (
  levelsSchedule,
  daySlots,
  dayIndex = 0
) => {
  // console.log("---------------------------------");
  // console.log("statrt checkAvaliableOrderAndAllocat");
  // console.log("-------------------------------");
  let totalReqSlots = levelCount(daySlots);

  // console.log("totalReqSlots:", totalReqSlots);

  const keys = Object.keys(daySlots);
  let matrix = [];
  for (let h = 0; h < keys.length; h++) {
    matrix.push(levelsSchedule[keys[h]][dayIndex]);
  }
  let levelsFreeIndexes;
  // if (goldenDay) {
  levelsFreeIndexes = checkEmptySlots(matrix, false, 0);

  //   console.log("levelsFreeIndexes:", levelsFreeIndexes);

  //get
  let allPossiableInsertIndexesPerLeve = [];
  for (let i = 0; i < levelsFreeIndexes.length; i++) {
    allPossiableInsertIndexesPerLeve.push(
      getAllCombinations(levelsFreeIndexes[i], daySlots[keys[i]])
    );
  }

  const allPossiableInsertIndexesAllLevels = getAllArrayCombinations(
    allPossiableInsertIndexesPerLeve,
    keys.length
  );
  // console.log(
  //   "allPossiableInsertIndexesAllLevels:",
  //   allPossiableInsertIndexesAllLevels
  // );
  const  = getMatrixWithDifferentNumbers(
    allPossiableInsertIndexesAllLevels
  );
  // return allPossiableInsertIndexesAllLevels;
  console.log("", );
};

const teachersLecturesNumbers = {
  teacher_1: { "1-sec": 1, "2-sec": 1, "3-sec": 2 },
  teacher_2: { "1-sec": 1, "2-sec": 1, "3-sec": 2 },
  teacher_3: { "1-sec": 2, "2-sec": 2 },
  teacher_4: { "1-sec": 1, "2-sec": 1, "3-sec": 1 },
  teacher_5: { "1-sec": 1, "2-sec": 1, "3-sec": 1 },
  teacher_6: { "1-sec": 1, "2-sec": 1, "3-sec": 1 },
};
const timeSlots = {
  "1-sec": [["empty", "empty", "empty", "empty", "empty", "empty", "empty"]],
  "2-sec": [["empty", "empty", "empty", "empty", "empty", "empty", "empty"]],
  "3-sec": [["empty", "empty", "empty", "empty", "empty", "empty", "empty"]],
};

let all = [];
for (const te in teachersLecturesNumbers) {
  // all = [
  //   ...all,
  //   ...
    checkAvaliableOrderAndAllocat(timeSlots, teachersLecturesNumbers[te])
  // ];
}
// console.log(all)
for (let i = 0; i < all.length; i * 100000) {
  // console.log(all[i])
}

