import mongoose from "mongoose";
import Teacher from "./TeacherModel.js";
import Level from "./LevelModel.js";

const SubjectSchema = new mongoose.Schema({
  name: String,
  weeklyLectures: {
    type: Number,
    default: 0,
  },
  level: {
    type: mongoose.Types.ObjectId,
    ref: "Level",
    require: true,
  },
  teacher: {
    type: mongoose.Types.ObjectId,
    ref: "Teacher",
  },
});

SubjectSchema.pre("save", async function (next) {
  const subject = this; // Reference to the subject document being saved

  try {
    const teacher = await Teacher.findById(subject.teacher);
    const level = await Level.findById(subject.level);
    if (teacher) {
      teacher.subjects.push(subject._id); 
      level.subjects.push(subject._id); 

      await teacher.save(); 
      await level.save(); 
    }

 
    
    next();
  } catch (error) {
    next(error);
  }
});

SubjectSchema.pre('deleteOne', async function(next) {
  try {
    // Find all teachers that reference this subject and remove the reference
    await Teacher.updateOne(
      { _id: this._id },
      { $pull: { subjects: this._id } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Subject", SubjectSchema);
