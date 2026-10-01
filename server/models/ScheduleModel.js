import mongoose from "mongoose";


const ScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "schedule",
    },
    schedule: {
      type: [
        [
          {
            type: mongoose.Types.ObjectId,
            ref: "Subject",
            // unique: true,
          },
        ],
      ],
      default: [],
    },
    ownerType: {
      type: String,
      enum: ["Level", "Teacher"],
      required: true,
    },
    ownerId: {
      type: mongoose.Types.ObjectId,
      required: true,
      // Instead of a hardcoded model name in `ref`, `refPath` means Mongoose
      // will look at the `docModel` property to find the right model.
      refPath: 'ownerType'
    },
  },
  { timestamps: true }
);

ScheduleSchema.pre("save", async function (next) {
  try {
    // Check if the schedule belongs to a teacher or class
    const ownerType = this.ownerType; // Assuming you have a field 'ownerType' in your schema

    if (ownerType === "teacher") {
      await mongoose
        .model("Teacher")
        .findOneAndUpdate({ _id: this.ownerId }, { schedule: this._id });
    } else if (ownerType === "level") {
      // Update class document
      await mongoose
        .model("Level")
        .findOneAndUpdate({ _id: this.ownerId }, { schedule: this._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});
export default mongoose.model("Schedule", ScheduleSchema);
