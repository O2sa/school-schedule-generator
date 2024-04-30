
const classesDailyLecturs = {
    "1_sec": 7,
    "2_sec": 7,
    "3_sec": 7,
  };
  
  function countClasses(arr, classCounts = {}) {
      
    // console.log(arr);
    for(let i=0;i<arr.length;i++){
    arr[i][Object.keys(arr[i])[0]].forEach((obj) => {
      const { class: classType } = obj;
      // console.log(classType)
      if (classCounts[classType]) {
        classCounts[classType]++;
      } else {
        classCounts[classType] = 1;
      }
    });
  }
   const allFour = Object.values(classCounts).every(value => value === 1);
           console.log(classCounts)
  
      if (allFour) {
        return true;
      }
      return false
      
  }
  
  function getAllCombinationsRecursive(arrays, targetLength, index = 0, currentSelection = [], usedElements = [], results = []) {
    if (index === arrays.length) {
      if (countClasses(currentSelection)) {
  
          let temparr={}
          for(let i=0;i<currentSelection.length;i++){
              let currKey=Object.keys(currentSelection[i])[0]
          temparr[currKey]=currentSelection[i][currKey]
          }
                      // console.log(temparr);
  
          
        results.push(temparr); // Shallow copy to avoid mutation
      }
      return;
    }
  
    for (let i = 0; i < arrays[index].length; i++) {
      const object = arrays[index][i];
      const key = JSON.stringify(object); // Unique key for object comparison
      if (!usedElements.includes(key)) {
        currentSelection.push(object);
        usedElements.push(key);
        getAllCombinationsRecursive(arrays, targetLength, index + 1, currentSelection, usedElements, results);
        currentSelection.pop();
        usedElements.pop();
      }
    }
  
    getAllCombinationsRecursive(arrays, targetLength, index + 1, currentSelection, usedElements, results); // Include empty selection
    return results;
  }
  
  // Example usage
  const array1 = [{ day_1:[1,2] }, { day_2:[3,2,5] }];
  const array2 = [{ day_1:[1,1,1] }, { day_2:[2] }, { day_3:[3,3] }];
  const targetLength = 3;
  
  
  
  
  
  
  
  
  
  const obj = [
    {
      Ma_Te_Day1: [
        { name: "Math", class: "1_sec", id: "M1", weeklyLectures: 7 },
        { name: "Math", class: "1_sec", id: "M1", weeklyLectures: 7 },
        { name: "Math", class: "2_sec", id: "M2", weeklyLectures: 7 },
        { name: "Math", class: "2_sec", id: "M2", weeklyLectures: 7 },
      ],
    },
    {
      Ma_Te_Day2: [
        { name: "Math", class: "1_sec", id: "M1", weeklyLectures: 7 },
        { name: "Math", class: "2_sec", id: "M2", weeklyLectures: 7 },
        { name: "Math", class: "3_sec", id: "M3", weeklyLectures: 7 },
        { name: "Math", class: "3_sec", id: "M3", weeklyLectures: 7 },
      ],
    },
    {
      Ma_Te_Day4: [
        { name: "Math", class: "1_sec", id: "M1", weeklyLectures: 7 },
        { name: "Math", class: "2_sec", id: "M2", weeklyLectures: 7 },
        { name: "Math", class: "3_sec", id: "M3", weeklyLectures: 7 },
      ],
    },
    [
      {
        Ar_Te_Day1: [
          { name: "Arabic", class: "1_sec", id: "A1", weeklyLectures: 6 },
          { name: "Arabic", class: "2_sec", id: "A2", weeklyLectures: 6 },
          { name: "Arabic", class: "3_sec", id: "A3", weeklyLectures: 6 },
        ],
      },
      {
        Ar_Te_Day2: [
          { name: "Arabic", class: "1_sec", id: "A1", weeklyLectures: 6 },
          { name: "Arabic", class: "2_sec", id: "A2", weeklyLectures: 6 },
          { name: "Arabic", class: "3_sec", id: "A3", weeklyLectures: 6 },
        ],
      },
      {
        Ar_Te_Day3: [
          { name: "Arabic", class: "1_sec", id: "A1", weeklyLectures: 6 },
          { name: "Arabic", class: "2_sec", id: "A2", weeklyLectures: 6 },
          { name: "Arabic", class: "3_sec", id: "A3", weeklyLectures: 6 },
        ],
      },
    ],
    [
      {
        Eng_Te_Day1: [
          { name: "English", class: "1_sec", id: "E1", weeklyLectures: 5 },
          { name: "English", class: "2_sec", id: "E2", weeklyLectures: 5 },
          { name: "English", class: "3_sec", id: "E3", weeklyLectures: 5 },
        ],
      },
      {
        Eng_Te_Day2: [
          { name: "English", class: "1_sec", id: "E1", weeklyLectures: 5 },
          { name: "English", class: "2_sec", id: "E2", weeklyLectures: 5 },
          { name: "English", class: "3_sec", id: "E3", weeklyLectures: 5 },
        ],
      },
    ],
    [
      {
        Ph_Te_Day1: [
          { name: "Phasics", class: "1_sec", id: "P1", weeklyLectures: 4 },
          { name: "Phasics", class: "2_sec", id: "P2", weeklyLectures: 5 },
          { name: "Phasics", class: "3_sec", id: "P3", weeklyLectures: 5 },
        ],
      },
      {
        Ph_Te_Day2: [
          { name: "Phasics", class: "1_sec", id: "P1", weeklyLectures: 4 },
          { name: "Phasics", class: "2_sec", id: "P2", weeklyLectures: 5 },
          { name: "Phasics", class: "3_sec", id: "P3", weeklyLectures: 5 },
        ],
      },
    ],
  
    [
      {
        Qu_Te_Day1: [
          { name: " Quilting", class: "1_sec", id: "Q1", weeklyLectures: 4 },
          { name: " Quilting", class: "2_sec", id: "Q2", weeklyLectures: 5 },
          { name: " Quilting", class: "2_sec", id: "Q2", weeklyLectures: 5 },
          { name: " Quilting", class: "3_sec", id: "Q3", weeklyLectures: 5 },
        ],
      },
      {
        Qu_Te_Day2: [
          { name: " Quilting", class: "1_sec", id: "Q1", weeklyLectures: 4 },
          { name: " Quilting", class: "2_sec", id: "Q2", weeklyLectures: 5 },
          { name: " Quilting", class: "3_sec", id: "Q3", weeklyLectures: 5 },
          { name: " Quilting", class: "3_sec", id: "Q3", weeklyLectures: 5 },
        ],
      },
    ],
  ];
  
  const combinations = getAllCombinationsRecursive(
    obj,
    targetLength
  );
  
  let tempArr=[]
  const mySet = new Set();
  
  
  
  for(let i=0;i<combinations.length;i++){
      const keys = Object.keys(combinations[i]);
      // let has=false
  const has = keys.some(element => mySet.has(element));
  
      if(!has){
          tempArr.push(combinations[i])
                  // console.log(mySet)
  keys.forEach(element => mySet.add(element));    }
  
  }
  
  
  for(const f of tempArr)
  console.log(f,',');
  
  