import { readFile } from "fs/promises";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Level from "./models/LevelModel.js";
import User from "./models/UserModel.js";
import Teacher from "./models/TeacherModel.js";
import Subject from "./models/SubjectModel.js";
import Schedule from "./models/ScheduleModel.js";
import { schedule } from "./utils/mockData.js";
try {
  await mongoose.connect(process.env.MONGO_URL);

  let schedules =await Schedule.updateMany({},{schedule:schedule});
  // console.log(schedules)
  for (const sh of schedules) {
    // const newSch=await Schedule.create(sh)
    // sh.schedule = schedule;
    // sh.save();
    console.log(sh);
  }

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
