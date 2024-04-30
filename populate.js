import { readFile } from "fs/promises";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Level from "./models/LevelModel.js";
import User from "./models/UserModel.js";
import Teacher from "./models/TeacherModel.js";
import School from "./models/SchoolModel.js";
import Subject from "./models/SubjectModel.js";
import Schedule from "./models/ScheduleModel.js";
// import { schedule } from "./utils/mockData.js";
import { data, schoolData, teachers } from "./utils/mockData.js";
// import { data } from "./utils/mockData.js";

try {

  await mongoose.connect(process.env.MONGO_URL);
  // let schedules = await Schedule.updateMany({}, { schedule: schedule });
  // // console.log(schedules)
  // for (const sh of schedules) {
  //   // const newSch=await Schedule.create(sh)
  //   // sh.schedule = schedule;
  //   // sh.save();
  //   console.log(sh);
  // }

  // const subjects = await Teacher.find({}); // Find all subjects
  // for (const teacher of subjects) {
  //   const su = Teacher.find({ _id: teacher._id });
  //   await su.findOneAndUpdate(
  //     { _id: teacher._id }, // Find the document by its ID
  //     { $set: { subjects: [] } } // Set subjects array to an empty array
  //   );
  // }

  // const subjects = await Subject.find({}); // Find all subjects
  // for (const subject of subjects) {
  //   const su = Subject.find({ _id: subject._id });
  //   await su.deleteOne(); // Remove each subject individually
  // }
  // console.log(`${subjects.length} subjects removed successfully`);

  // for (const lev of levels) {
  //   const le = await Level.findById(lev);
  //   const sch = [];
  //   for (let i = 0; i < 6; i++) {
  //     let temp = [];
  //     for (let h = 0; h < le.dailyLectures; h++) {
  //       temp.push(le.subjects[0]);
  //     }
  //     sch.push(temp);
  //   }
  //   await Schedule.create({
  //     name: le.name,
  //     ownerType: "level",
  //     ownerId: le._id,
  //     schedule: sch,
  //   });
  // }

  const school = "662f231e95a62059e02914fd";
  console.log(school);

  // for (let ele = 0; ele < data.length; ele++) {
  //   const createdLevel = await Level.create({
  //     ...data[ele].level,
  //     school: school,
  //   });
  //   console.log(createdLevel);

  //   const schedule = await Schedule.create({
  //     name: createdLevel.name,
  //     ownerType: "level",
  //     ownerId: createdLevel._id,
  //   });
  //   createdLevel.schedule = schedule._id;
  //   createdLevel.save();

  //   const subjects = data[ele].subjects;
  //   for (const su in subjects) {
  //     const createdSubject = await Subject.create({
  //       ...subjects[su],
  //       level: createdLevel._id,
  //     });
  //     console.log(createdSubject);
  //   }
  // }

  // for (let ele = 0; ele < teachers.length; ele++) {
  //   const createdLevel = await Teacher.create({
  //     ...teachers[ele],
  //     school: school,
  //   });
  //   console.log(createdLevel);

  //   const schedule = await Schedule.create({
  //     name: createdLevel.name,
  //     ownerType: "teacher",
  //     ownerId: createdLevel._id,
  //   });
  //   createdLevel.schedule = schedule._id;
  //   createdLevel.save();
  // }

  const subjects = await Subject.find();
  for (const s of subjects) s.save();
  console.log("Success!!!");
  process.exit(0);
} catch (error) {
  console.log(error);
  process.exit(1);
}

async function removeAllSubjectReferences() {
  const teachers = await Teacher.find(); // Find all teacher documents

  // Iterate over each teacher document
  for (const teacher of teachers) {
    // Update the teacher document to remove subject references
    const ts = await Teacher.findById({ _id: teacher._id });
    ts.subjects = [];
    ts.save();
  }
}

async function removeAllSubjects() {
  const subjects = await Subject.find({}); // Find all subjects
  for (const subject of subjects) {
    const su = Subject.find({ _id: subject._id });
    await su.deleteOne(); // Remove each subject individually
  }
  console.log(`${subjects.length} subjects removed successfully`);
}
