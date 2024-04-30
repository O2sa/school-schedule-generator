import mongoose from "mongoose";
const TeacherSchema = new mongoose.Schema({
  name: String,
  schedule: {
    type: mongoose.Types.ObjectId,
    ref: "Schedule",
  },
  offDaysAndLectures: {
    type: Object,
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

export default mongoose.model("Teacher", TeacherSchema);
