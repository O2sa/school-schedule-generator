import mongoose from "mongoose";
import Teacher from "./TeacherModel.js";
import Level from "./LevelModel.js";

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "لا من إضافة إسم للمادة"],
  },
  weeklyLectures: {
    type: Number,
    default: 0,
  },
  level: {
    type: mongoose.Types.ObjectId,
    ref: "Level",
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
  },
  teacher: {
    type: mongoose.Types.ObjectId,
    ref: "Teacher",
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],

  },
});

SubjectSchema.pre("save", async function (next) {
  const subject = this; // Reference to the subject document being saved
  // console.log(subject);
  try {
    // const teacher = await Teacher.findById(subject.teacher);
    // const level = await Level.findById(subject.level);

    // if (level || !subject._id) {
    //   level.subjects.push(subject._id);

    //   await level.save();
    // }
    // if (teacher || !subject._id) {
    //   teacher.subjects.push(subject._id);
    //   await teacher.save();
    // }





    // if (level || subject.weeklyLectures) {
    //   console.log('kdjfk')
    //   return next(new Error("Invalid level reference")); // Throw error for invalid level reference
    // }
    // if (!validateLecturesMiddleware(level._id, subject.weeklyLectures)) {
    //   console.log('validateLecturesMiddleware')
    //   return next(new Error("Invalid lectures num"));
    // }

    next();
  } catch (error) {
    next(error);
  }
});

// SubjectSchema.pre("deleteOne", async function (next) {
//   try {
//     // Find all teachers that reference this subject and remove the reference
//     await Teacher.updateOne(
//       { _id: this.teacher },
//       { $pull: { subjects: this._id } }
//     );
//     await Level.updateOne(
//       { _id: this.level },
//       { $pull: { subjects: this._id } }
//     );
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

export default mongoose.model("Subject", SubjectSchema);
