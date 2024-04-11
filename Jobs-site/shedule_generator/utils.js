export function getRandomInt(min, max) {
  min = Math.ceil(min); // Round up minimum value (inclusive)
  max = Math.floor(max); // Round down maximum value (exclusive)
  return Math.floor(Math.random() * (max - min)) + min;
}

export function checkEmptySlots(matrix, startIndex = 0, end = false) {
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


export function hasSpecificKey(obj, key) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop) && prop === key) {
      return true;
    }
  }
  return false;
}

export const classCount = (classLec) => {
  let totalReqSlots = 0;
  for (let key in classLec) {
    totalReqSlots += classLec[key];
  }
  return totalReqSlots;
};

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

// ... other functions remain unchanged

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
