import mongoose from "mongoose";
import { JOB_STATUS, JOB_TYPE } from "../utils/constants.js";
const LevelSchema = new mongoose.Schema({
  name: String,
  schedule: {
    type: mongoose.Types.ObjectId,
    ref: "Schedule",
  },
  dailyLectures: {
    type: Number,
    default: 6,
  },
  subjects: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Subject",
    },
  ],
  backupSubjects: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Subject",
    },
  ],
});

export default mongoose.model("Level", LevelSchema);
