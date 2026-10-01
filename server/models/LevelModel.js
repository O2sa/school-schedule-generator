import mongoose from "mongoose";
import {  STAGES } from "../utils/constants.js";
import School from "./SchoolModel.js";
import Subject from "./SubjectModel.js";

const LevelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
  },

  schedule: {
    type: mongoose.Types.ObjectId,
    ref: "Schedule",
  },
  stage: {
    type: Number,
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
    enum: STAGES,
  },
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
  },
  dailyLectures: {
    type: Number,
    default: 0,
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
  },
  subjects: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Subject",
        // unique: true,
      },
    ],
    default: [],
  },
  backupSubjects: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Subject",
      // unique: true,
    },
  ],
});

// LevelSchema.pre("save", async function (next) {
//   const level = this; // Reference to the subject document being saved

//   try {
//     const school = await School.findById(level.teacher);

//     if (!school) {
//       // return next(new Error("Invalid school reference")); // Throw error for invalid level reference
//       return;
//     }

//     school.levels.push(level._id);
//     await school.save();

//     next();
//   } catch (error) {
//     next(error);
//   }
// });



LevelSchema.pre("remove", async function (next) {
  try {
    // Find all teachers that reference this subject and remove the reference
    await Subject.deleteMany({ level: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
export default mongoose.model("Level", LevelSchema);

export const getLevelLecturesDiff = async function (levelId, dailyLectures) {
  try {
    // Find the level document based on the level field value
    const levelDoc = await Level.findById(levelId);
    const schoolDoc = await School.findById(levelDoc.school);
    const subjects = await Subject.findById({ level: levelDoc._id });

    // Check if level document exists
    if (!levelDoc || !schoolDoc) {
      return new Error("Invalid level reference"); // Throw error for invalid level reference
    }

    // Calculate total lectures (assuming all elements represent lectures)
    const totalLevelLectures = schoolDoc.workDays * dailyLectures;
    let totalCurrentLectures = 0;
    for (let i = 0; i < subjects.length; i++) {
      totalCurrentLectures += subjects[i].weeklyLectures;
    }

    // Check if total lectures is less than or equal to level lectures
    if (totalCurrentLectures > totalLevelLectures) {
      return false;
    }

    return true;
  } catch (err) {
    return new Error(err); // Throw error for invalid level reference
  }
};
