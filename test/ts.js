function arraysAreEqual(array1, array2) {
  // Check if the arrays have the same length
  if (array1.length !== array2.length) {
    return false;
  }

  // Iterate over each element of the arrays
  for (let i = 0; i < array1.length; i++) {
    // If any element differs between the arrays, return false
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  // If all elements are equal, return true
  return true;
}

function getAllMatrixCombinations(matrices) {
  const combinations = [];
  const co = [];

  // Helper function to recursively generate combinations
  function generateCombinations(matrixIndex, currentCombination) {
    // Base case: if all matrices are processed, add currentCombination to combinations
    if (matrixIndex === matrices.length) {
      // console.log('currentCombination:',currentCombination)
      combinations.push([...currentCombination]);
      return;
    }

    // Iterate over arrays in the current matrix
    for (const array of matrices[matrixIndex]) {
      // Add the current array to the combination
      currentCombination.push(array);
      // Recursively generate combinations with the next matrix
      // console.log('matrixIndex + 1:',matrixIndex + 1)
      // console.log("currentCombination after push:", currentCombination);
      let lg = 0;

      const classCounts = {};

      for (let j = 0; j < currentCombination.length; j++) {
        array.forEach((obj) => {
          // console.log(obj)
          const { class: classType } = obj;
          if (classCounts[classType]) {
            classCounts[classType]++;
          } else {
            classCounts[classType] = 1;
          }
        });
      }
      // console.log(classCounts)
      //  console.log('current length:', lg)
      let o = false;
      for (let key in classCounts) {
        if (classCounts[key] == 7) o = true;
        else o = false;
      }
      if (o) {
        co.push([...currentCombination]);
        // console.log(currentCombination)
        return;
      }

      generateCombinations(matrixIndex + 1, currentCombination);
      // Backtrack: remove the last array from the combination
      currentCombination.pop();
    }
  }

  // Start generating combinations
  generateCombinations(0, []);

  return co;
}

// Example matrices
const matrix3 = [
  [
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    [
      { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", class: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
  ],
  [
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    [
      { name: "Arabic", class: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", class: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", class: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
  ],
  [
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
    [
      { name: "English", class: "1-sec", id: "E1", weeklyLectures: 5 },
      { name: "English", class: "2-sec", id: "E2", weeklyLectures: 5 },
      { name: "English", class: "3-sec", id: "E3", weeklyLectures: 5 },
    ],
  ],
  [
    [
      { name: "Phasics", class: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    [
      { name: "Phasics", class: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    [
      { name: "Phasics", class: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    [
      { name: "Phasics", class: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    [
      { name: "Phasics", class: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", class: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
  ],
  [
    [
      { name: " Quilting", class: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    [
      { name: " Quilting", class: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    [
      { name: " Quilting", class: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    [
      { name: " Quilting", class: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", class: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", class: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
  ],
  [
    [
      {
        name: "Isramic Culture",
        class: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Isramic Culture",
        class: "3-sec",
        id: "I3",
        weeklyLectures: 4,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Isramic Culture",
        class: "3-sec",
        id: "I3",
        weeklyLectures: 4,
      },
    ],
    [
      {
        name: "Isramic Culture",
        class: "3-sec",
        id: "I3",
        weeklyLectures: 4,
      },
      {
        name: "Isramic Culture",
        class: "3-sec",
        id: "I3",
        weeklyLectures: 4,
      },
    ],
  ],
  [
    [
      { name: "Biology", class: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", class: "2-sec", id: "B2", weeklyLectures: 4 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    [
      { name: "Biology", class: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", class: "2-sec", id: "B2", weeklyLectures: 4 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    [
      { name: "Biology", class: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", class: "2-sec", id: "B2", weeklyLectures: 4 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    [
      { name: "Biology", class: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", class: "2-sec", id: "B2", weeklyLectures: 4 },
      { name: "Biology", class: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
  ],
  [
    [
      { name: "History", class: "1-sec", id: "H1", weeklyLectures: 4 },
      { name: "History", class: "1-sec", id: "H1", weeklyLectures: 4 },
    ],
    [
      { name: "History", class: "1-sec", id: "H1", weeklyLectures: 4 },
      { name: "History", class: "1-sec", id: "H1", weeklyLectures: 4 },
    ],
  ],
  [
    [
      { name: "Chemistry", class: "1-sec", id: "C1", weeklyLectures: 4 },
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
    [
      { name: "Chemistry", class: "1-sec", id: "C1", weeklyLectures: 4 },
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
    [
      { name: "Chemistry", class: "1-sec", id: "C1", weeklyLectures: 4 },
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
    [
      { name: "Chemistry", class: "1-sec", id: "C1", weeklyLectures: 4 },
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
    [
      { name: "Chemistry", class: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", class: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
  ],
];

const m = [
  [
    [3, 2, 5],
    [0, 9, 3],
  ],
  [
    ["h", "y"],
    [4, 1],
    [1, 0],
  ],
  [["gg", "gg"]],
];

// Combine matrices into an array
const matrices = matrix3;
// Get all combinations of choosing arrays from matrices

let compareArr = [
  { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
  { name: "Math", class: "1-sec", id: "M1", weeklyLectures: 7 },
  { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
  { name: "Math", class: "2-sec", id: "M2", weeklyLectures: 7 },
];

const combinations = getAllMatrixCombinations(matrices);

let classIdCounts = {};
let co = [];
// Output the result
for (let j = 0; j < combinations.length; j++) {
  const classCounts = {};

  combinations[j].forEach((array) => {
    if (arraysAreEqual(array, compareArr)) {
      console.log("trueddd");
    }
    // console.log(array)
    array.forEach((obj) => {
      const { class: classType } = obj;
      if (classCounts[classType]) {
        classCounts[classType]++;
      } else {
        classCounts[classType] = 1;
      }
      const { class: classs, id } = obj;
      if (!classIdCounts[classs]) {
        classIdCounts[classs] = {};
      }
      if (classIdCounts[classs][id]) {
        classIdCounts[classs][id]++;
      } else {
        classIdCounts[classs][id] = 1;
      }
    });
  });
  // console.log("Number of occurrences of each class type:", classCounts);
  let o = false;
  for (let key in classCounts) {
    if (classCounts[key] == 7) o = true;
    else o = false;
  }
  if (o) co.push(combinations[j]);
}

combinations.forEach((arr) => console.log(arr));

// console.log(combinations);
// Iterate through each array and extract classes

