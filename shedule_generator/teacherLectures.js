
// Function to distribute lectures of a teacher per work days
const teacherLecturesPerWorkDays = (teacher, subjects) => {
  const teacherWorkDays = teacher.workDays;
  const totalSubjectsLectures = calculateTeacherTotalLectures(subjects);

  const baseLecturesPerDay = Math.floor(
    totalSubjectsLectures / teacherWorkDays
  ); // Calculate base lectures per day
  const remainingSubjects = totalSubjectsLectures % teacherWorkDays; // Calculate remaining subjects

  // Distribute remaining subjects evenly among the working days
  const lecturesPerWeek = Array(teacherWorkDays).fill(baseLecturesPerDay);
  for (let i = 0; i < remainingSubjects; i++) {
    lecturesPerWeek[i]++;
  }
  return lecturesPerWeek;
};

// Function to calculate total lectures for each teacher
const calculateTeacherTotalLectures = (tSubjects) => {
  let total = 0;

  // Loop over each key in the object
  tSubjects.forEach((element) => {
    total += element.weeklyLectures;
  });
  return total;
};

// Function to distribute  teacher lectures acroos work days
export default function distributeTeacherLectures(teacher, subjects) {
  // console.log('teacher',teacher)
  // Initialize teacher teacherScheduleedule object
  const teacherLectures = {};

  const lecturesPerWeek = teacherLecturesPerWorkDays(teacher, subjects);

  // console.log('lecturesPerWeek',lecturesPerWeek)
  // Distribute remaining subjects evenly among the working days
  for (let i = 0; i < teacher.workDays; i++) {
    teacherLectures[`Day_${i + 1}`] = [];
  }
  const keys = Object.keys(teacherLectures);
  for (let h = 0; h < subjects.length; h++) {
    let i = 0;
    let counter = 0;
    while (true) {
      const index = i % keys.length;
      const key = keys[index];
      if (teacherLectures[key].length < lecturesPerWeek[index]) {
        teacherLectures[key].push(subjects[h]);
        counter++;
      }
      if (counter == subjects[h].weeklyLectures) break;
      i++;
    }
  }
  // console.log('teacherLectures',teacherLectures)
  return teacherLectures;
}
