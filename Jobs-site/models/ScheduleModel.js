import mongoose from "mongoose";
const ScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "schedule",
    },
    schedule: {
      type: Object,
      default: [],
    },
    ownerType:{
      type: String,
      enum: ['level','teacher'],
      default: 'level',
    },
    ownerId: {
      type: mongoose.Types.ObjectId,
    },

  },
  { timestamps: true }
);



ScheduleSchema.pre('save', async function (next) {
  try {
    // Check if the schedule belongs to a teacher or class
    const ownerType = this.ownerType; // Assuming you have a field 'ownerType' in your schema

    if (ownerType === 'teacher') {
      await mongoose.model('Teacher').findOneAndUpdate(
        { _id: this.ownerId },
         { schedule: this._id }  
      );
    } else if (ownerType === 'level') {
      // Update class document
      await mongoose.model('Level').findOneAndUpdate(
        { _id: this.ownerId }, 
         { schedule: this._id } 
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});
export default mongoose.model("Schedule", ScheduleSchema);
