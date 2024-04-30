function getAllCombinations(
  data,
  targetSum,
  currentCombination = [],
  currentSum = 0,
  index = 0,
  result = []
) {
  if (currentSum === targetSum) {
    result.push([...currentCombination]);
    return;
  }

  if (currentSum > targetSum || index >= data.length) {
    return;
  }

  const currentArray = data[index];

  for (const item of currentArray) {
    const sum = currentSum + item.length;
    if (sum <= targetSum) {
      currentCombination.push(item);
      getAllCombinations(
        data,
        targetSum,
        currentCombination,
        sum,
        index + 1,
        result
      );
      currentCombination.pop();
    }
  }

  getAllCombinations(
    data,
    targetSum,
    currentCombination,
    currentSum,
    index + 1,
    result
  );

  return result;
}

const matrix = [
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

const targetSum = 21;
const combinationss = getAllCombinations(matrix, targetSum);
// console.log(combinationss);

// for (let i in combinationss) console.log(combinationss[i]);



let classIdCounts = {};
let co = [];
// Output the result
for (let j = 0; j < combinationss.length; j++) {
  const classCounts = {};

  combinationss[j].forEach((array) => {
  
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
  if (o) co.push(combinationss[j]);
}

// co.forEach((arr) => console.log(arr));

console.log(co.length);

for(let i=co.length; i>0;i=i-1000){
    console.log(co[i])
}
// Iterate through each array and extract classes
