import mongoose from "mongoose";
import Subject from "./SubjectModel.js";
import { DAYS_OF_WEEK_EN, STAGES } from "../utils/constants.js";
import School from "./SchoolModel.js";
import User from "./UserModel.js";
const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "لا من إضافة إسم للمعلم"],
  },
  schedule: {
    type: mongoose.Types.ObjectId,
    ref: "Schedule",
  },
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
  },
  stage: {
    type: Number,
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
    enum:STAGES,
  },
  offDaysAndLectures: {
    type: [
      {
        day: {
          type: String,
          required: true,
          enum: DAYS_OF_WEEK_EN,
        },
        offLectures: { type: Array, required: true, default: [] },
      },
    ],
    default: DAYS_OF_WEEK_EN.map((day) => ({
      day,
      offLectures: [],
    })),
  },
  workDays: {
    type: Number,
    default: 0,
  },
  subjects: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Subject",
    },
  ],
});

// TeacherSchema.pre("save", async function (next) {
//   const teacher = this; // Reference to the subject document being saved

//   try {

//       return next(new Error("number of lectures not enough")); // Throw error for invalid level reference
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

TeacherSchema.pre("deleteOne", async function (next) {
  try {
    // Find all teachers that reference this subject and remove the reference
    await Subject.updateMany({ teacher: this._id }, { teacher: "" });
    next();
  } catch (error) {
    next(error);
  }
});

export default User.discriminator("Teacher", TeacherSchema);
