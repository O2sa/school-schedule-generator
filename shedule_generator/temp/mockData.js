export const teachers = [
  {
    name: "Math-Teacher",
    id: "Ma_Te",
    workDays: 6,
    offDaysAndLectures: [],
    subjects: ["M1", "M2", "M3"],
  },
  {
    name: "Arabic-Teacher",
    id: "Ar_Te",
    workDays: 5,
    offDaysAndLectures: [
      {
        day: "wed",
        offLectures: [2, 4],
      },
    ],
    subjects: ["A1", "A2", "A3"],
  },
  {
    name: "English-Teacher",
    id: "Eng_Te",
    workDays: 4,
    offDaysAndLectures: [
      {
        day: "sat",
        offLectures: [2, 4, 5],
      },
    ],
    subjects: ["E1", "E2", "E3"],
  },
  {
    name: "Phasics-Teacher",
    id: "Ph_Te",
    workDays: 5,

    offDaysAndLectures: [
      {
        day: "mon",
        offLectures: [0, 1, 2, 3, 4, 5, 6],
      },
    ],
    subjects: ["P1", "P2", "P3"],
  },
  {
    name: "Quilting-Teacher",
    id: "Qu_Te",
    workDays: 4,
    offDaysAndLectures: [
      {
        day: "mon",
        offLectures: [0, 1, 2, 3, 4, 5, 6],
      },
    ],
    subjects: ["Q1", "Q2", "Q3"],
  },
  {
    name: "Italian-Teacher",
    id: "It_Te",
    workDays: 4,
    offDaysAndLectures: [
      {
        day: "tue",
        offLectures: [3, 4, 5],
      },
    ],
    subjects: ["I1", "I2", "I3"],
  },
  {
    name: "Biology-Teacher",
    id: "Bi_Te",
    workDays: 4,
    offDaysAndLectures: [
      {
        day: "thr",
        offLectures: [0, 1, 2, 3, 4, 5, 6],
      },
    ],
    subjects: ["B1", "B2", "B3"],
  },
  {
    name: "history-Teacher",
    id: "hi_Te",
    workDays: 2,
    offDaysAndLectures: [],
    subjects: ["H1"],
  },
  {
    name: "Chemistry-Teacher",
    id: "Ch_Te",
    workDays: 4,
    offDaysAndLectures: [
      {
        day: "thr",
        offLectures: [0, 1, 2, 3, 4],
      },
      {
        day: "mon",
        offLectures: [0, 1, 2, 3, 4, 5, 6],
      },
    ],
    subjects: ["C1", "C2", "C3"],
  },
];

export const subjects = [
  //1-sec subjects
  {
    name: "Math",
    level: "1-sec",
    id: "M1",
    weeklyLectures: 7,
  },
  {
    name: "Biology",
    level: "1-sec",
    id: "B1",
    weeklyLectures: 4,
  },
  {
    name: " Quilting",
    level: "1-sec",
    id: "Q1",
    weeklyLectures: 4,
  },
  {
    name: "Islamic",
    level: "1-sec",
    id: "I1",
    weeklyLectures: 4,
  },
  {
    name: "Phasics",
    level: "1-sec",
    id: "P1",
    weeklyLectures: 4,
  },
  {
    name: "History",
    level: "1-sec",
    id: "H1",
    weeklyLectures: 4,
  },
  {
    name: "English",
    level: "1-sec",
    id: "E1",
    weeklyLectures: 4,
  },
  {
    name: "Arabic",
    level: "1-sec",
    id: "A1",
    weeklyLectures: 6,
  },
  {
    name: "Chemistry",
    level: "1-sec",
    id: "C1",
    weeklyLectures: 5,
  },

  //2-sec subjects
  {
    name: "Math",
    level: "2-sec",
    id: "M2",
    weeklyLectures: 7,
  },
  {
    name: "Biology",
    level: "2-sec",
    id: "B2",
    weeklyLectures: 5,
  },
  {
    name: " Quilting",
    level: "2-sec",
    id: "Q2",
    weeklyLectures: 5,
  },
  {
    name: "Islamic",
    level: "2-sec",
    id: "I2",
    weeklyLectures: 5,
  },
  {
    name: "Phasics",
    level: "2-sec",
    id: "P2",
    weeklyLectures: 5,
  },
  {
    name: "English",
    level: "2-sec",
    id: "E2",
    weeklyLectures: 4,
  },
  {
    name: "Arabic",
    level: "2-sec",
    id: "A2",
    weeklyLectures: 6,
  },
  {
    name: "Chemistry",
    level: "2-sec",
    id: "C2",
    weeklyLectures: 5,
  },

  //3-sec subjects
  {
    name: "Math",
    level: "3-sec",
    id: "M3",
    weeklyLectures: 7,
  },
  {
    name: "Biology",
    level: "3-sec",
    id: "B3",
    weeklyLectures: 5,
  },
  {
    name: " Quilting",
    level: "3-sec",
    id: "Q3",
    weeklyLectures: 5,
  },
  {
    name: "Islamic",
    level: "3-sec",
    id: "I3",
    weeklyLectures: 5,
  },
  {
    name: "Phasics",
    level: "3-sec",
    id: "P3",
    weeklyLectures: 5,
  },
  {
    name: "English",
    level: "3-sec",
    id: "E3",
    weeklyLectures: 4,
  },
  {
    name: "Arabic",
    level: "3-sec",
    id: "A3",
    weeklyLectures: 6,
  },
  {
    name: "Chemistry",
    level: "3-sec",
    id: "C3",
    weeklyLectures: 5,
  },
];

export const leveles = [
  {
    name: "1-secondary",
    id: "1-sec",
    DailyLectures: 7,
    subjects: ["M1", "Q1", "I1", "A1", "E1", "H1", "C1", "B1", "P1"],
  },
  {
    name: "2-secondary",
    id: "2-sec",
    DailyLectures: 7,
    subjects: ["M2", "Q2", "I2", "A2", "E2", "C2", "B2", "P2"],
  },
  {
    name: "3-secondary",
    id: "3-sec",
    DailyLectures: 7,
    subjects: ["M3", "Q3", "I3", "A3", "E3", "C3", "B3", "P3"],
  },
];

export const daysOfWeek = ["sat", "sun", "mon", "tue", "wed", "thr"];



export const allCombinations = [
  {
    It: [
      {
        name: "Islamic",
        level: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Islamic",
        level: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Islamic",
        level: "3-sec",
        id: "I3",
        weeklyLectures: 5,
      },
    ],
    Ma: [
      { name: "Math", level: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", level: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", level: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", level: "2-sec", id: "M2", weeklyLectures: 7 },
    ],
    Ar: [
      { name: "Arabic", level: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", level: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", level: "3-sec", id: "A3", weeklyLectures: 6 },
      { name: "Arabic", level: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    Bi: [
      { name: "Biology", level: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", level: "2-sec", id: "B2", weeklyLectures: 5 },
      { name: "Biology", level: "3-sec", id: "B3", weeklyLectures: 5 },
      { name: "Biology", level: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    Ph: [
      { name: "Phasics", level: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", level: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", level: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    Qu: [
      { name: " Quilting", level: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", level: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", level: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
  },
  {
    hi: [
      { name: "History", level: "1-sec", id: "H1", weeklyLectures: 4 },
      { name: "History", level: "1-sec", id: "H1", weeklyLectures: 4 },
    ],
    It: [
      {
        name: "Islamic",
        level: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Islamic",
        level: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Islamic",
        level: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Islamic",
        level: "3-sec",
        id: "I3",
        weeklyLectures: 5,
      },
    ],
    Ma: [
      { name: "Math", level: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", level: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", level: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    Ar: [
      { name: "Arabic", level: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", level: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", level: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    Ph: [
      { name: "Phasics", level: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", level: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    Eng: [
      { name: "English", level: "1-sec", id: "E1", weeklyLectures: 4 },
      { name: "English", level: "2-sec", id: "E2", weeklyLectures: 4 },
      { name: "English", level: "3-sec", id: "E3", weeklyLectures: 4 },
    ],
    Ch: [
      { name: "Chemistry", level: "1-sec", id: "C1", weeklyLectures: 5 },
      { name: "Chemistry", level: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", level: "3-sec", id: "C3", weeklyLectures: 5 },
      { name: "Chemistry", level: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
  },
  {
    It: [
      {
        name: "Islamic",
        level: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Islamic",
        level: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Islamic",
        level: "3-sec",
        id: "I3",
        weeklyLectures: 5,
      },
    ],
    Ma: [
      { name: "Math", level: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", level: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", level: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    Ar: [
      { name: "Arabic", level: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", level: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", level: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    Bi: [
      { name: "Biology", level: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", level: "2-sec", id: "B2", weeklyLectures: 5 },
      { name: "Biology", level: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    Eng: [
      { name: "English", level: "1-sec", id: "E1", weeklyLectures: 4 },
      { name: "English", level: "2-sec", id: "E2", weeklyLectures: 4 },
      { name: "English", level: "3-sec", id: "E3", weeklyLectures: 4 },
    ],
    Qu: [
      { name: " Quilting", level: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", level: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", level: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    Ch: [
      { name: "Chemistry", level: "1-sec", id: "C1", weeklyLectures: 5 },
      { name: "Chemistry", level: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", level: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
  },
  {
    It: [
      {
        name: "Islamic",
        level: "1-sec",
        id: "I1",
        weeklyLectures: 4,
      },
      {
        name: "Islamic",
        level: "2-sec",
        id: "I2",
        weeklyLectures: 5,
      },
      {
        name: "Islamic",
        level: "3-sec",
        id: "I3",
        weeklyLectures: 5,
      },
      {
        name: "Islamic",
        level: "3-sec",
        id: "I3",
        weeklyLectures: 5,
      },
    ],
    Ma: [
      { name: "Math", level: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", level: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", level: "3-sec", id: "M3", weeklyLectures: 7 },
      { name: "Math", level: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    Ar: [
      { name: "Arabic", level: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", level: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", level: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", level: "2-sec", id: "A2", weeklyLectures: 6 },
    ],
    Bi: [
      { name: "Biology", level: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", level: "2-sec", id: "B2", weeklyLectures: 5 },
      { name: "Biology", level: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    Ph: [
      { name: "Phasics", level: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", level: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", level: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    Eng: [
      { name: "English", level: "1-sec", id: "E1", weeklyLectures: 4 },
      { name: "English", level: "2-sec", id: "E2", weeklyLectures: 4 },
      { name: "English", level: "3-sec", id: "E3", weeklyLectures: 4 },
    ],
  },
  {
    hi: [
      { name: "History", level: "1-sec", id: "H1", weeklyLectures: 4 },
      { name: "History", level: "1-sec", id: "H1", weeklyLectures: 4 },
    ],
    Ma: [
      { name: "Math", level: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", level: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", level: "3-sec", id: "M3", weeklyLectures: 7 },
      { name: "Math", level: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    Bi: [
      { name: "Biology", level: "1-sec", id: "B1", weeklyLectures: 4 },
      { name: "Biology", level: "2-sec", id: "B2", weeklyLectures: 5 },
      { name: "Biology", level: "2-sec", id: "B2", weeklyLectures: 5 },
      { name: "Biology", level: "3-sec", id: "B3", weeklyLectures: 5 },
    ],
    Ph: [
      { name: "Phasics", level: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", level: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", level: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    Qu: [
      { name: " Quilting", level: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", level: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", level: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", level: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    Ch: [
      { name: "Chemistry", level: "1-sec", id: "C1", weeklyLectures: 5 },
      { name: "Chemistry", level: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", level: "3-sec", id: "C3", weeklyLectures: 5 },
      { name: "Chemistry", level: "3-sec", id: "C3", weeklyLectures: 5 },
    ],
  },
  {
    Ma: [
      { name: "Math", level: "1-sec", id: "M1", weeklyLectures: 7 },
      { name: "Math", level: "2-sec", id: "M2", weeklyLectures: 7 },
      { name: "Math", level: "3-sec", id: "M3", weeklyLectures: 7 },
    ],
    Ar: [
      { name: "Arabic", level: "1-sec", id: "A1", weeklyLectures: 6 },
      { name: "Arabic", level: "2-sec", id: "A2", weeklyLectures: 6 },
      { name: "Arabic", level: "3-sec", id: "A3", weeklyLectures: 6 },
      { name: "Arabic", level: "3-sec", id: "A3", weeklyLectures: 6 },
    ],
    Ph: [
      { name: "Phasics", level: "1-sec", id: "P1", weeklyLectures: 4 },
      { name: "Phasics", level: "2-sec", id: "P2", weeklyLectures: 5 },
      { name: "Phasics", level: "3-sec", id: "P3", weeklyLectures: 5 },
    ],
    Eng: [
      { name: "English", level: "1-sec", id: "E1", weeklyLectures: 4 },
      { name: "English", level: "2-sec", id: "E2", weeklyLectures: 4 },
      { name: "English", level: "3-sec", id: "E3", weeklyLectures: 4 },
    ],
    Qu: [
      { name: " Quilting", level: "1-sec", id: "Q1", weeklyLectures: 4 },
      { name: " Quilting", level: "2-sec", id: "Q2", weeklyLectures: 5 },
      { name: " Quilting", level: "3-sec", id: "Q3", weeklyLectures: 5 },
      { name: " Quilting", level: "3-sec", id: "Q3", weeklyLectures: 5 },
    ],
    Ch: [
      { name: "Chemistry", level: "1-sec", id: "C1", weeklyLectures: 5 },
      { name: "Chemistry", level: "1-sec", id: "C1", weeklyLectures: 5 },
      { name: "Chemistry", level: "2-sec", id: "C2", weeklyLectures: 5 },
      { name: "Chemistry", level: "2-sec", id: "C2", weeklyLectures: 5 },
    ],
  },
];

export  const schoolData = {
  name: "المدرسة الجامعة",
  workDays: 6,
  startDay: "sat",
};