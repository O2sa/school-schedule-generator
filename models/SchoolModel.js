import mongoose from "mongoose";
import {
  DAYS_OF_WEEK_AR,

  WORK_DAYS,
} from "../utils/constants.js";
import Subject from "./SubjectModel.js";

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "المدرسة",
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
  },
  workDays: {
    type: Number,
    enum: WORK_DAYS,
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
    default: 1,
  },
  admin: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "لا بد من تحديد عدد الحصص اليومية"],
  },
  startDay: {
    type: String,
    required: true,
    enum: DAYS_OF_WEEK_AR,
    default: DAYS_OF_WEEK_AR[0],
  },
  // stages: {
  //   type: Array,
  //   required: true,
  //   default: STAGES,
  // },
});

export default mongoose.model("School", SchoolSchema);
