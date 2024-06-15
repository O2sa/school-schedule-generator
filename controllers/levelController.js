import Level from "../models/LevelModel.js";
import Subject from "../models/SubjectModel.js";
import School from "../models/SchoolModel.js";
import { StatusCodes } from "http-status-codes";
import day from "dayjs";
import Schedule from "../models/ScheduleModel.js";
import Teacher from "../models/TeacherModel.js";

export const getAllLevels = async (req, res) => {
  const levels = await Level.find({ school: req.user.schoolId });
  res.status(StatusCodes.OK).json({ levels });
};

export const createLevel = async (req, res) => {
  const lev = req.body;
  console.log(req.body);
  const level = await Level.create({
    name: lev.name,
    dailyLectures: Number(lev.dailyLectures),
    stage: Number(lev.stage),
    school: req.user.schoolId,
  });



  const schedule = await Schedule.create({
    name: level.name,
    ownerType: "Level",
    ownerId: level._id,
  });
  res.status(StatusCodes.CREATED).json({ level });
};

export const getLevel = async (req, res) => {
  const level = await Level.findById(req.params.id).populate("subjects");
  res.status(StatusCodes.OK).json({ level });
};

export const updateLevel = async (req, res) => {
  const updatedLevel = await Level.updateOne({ _id: req.params.id }, req.body);

  res
    .status(StatusCodes.OK)
    .json({ msg: "Level modified", Level: updatedLevel });
};

export const deleteLevel = async (req, res) => {
  const removedLevel = await Level.findByIdAndDelete(req.params.id);

  await Subject.deleteMany({ level: req.params.id });
   await Teacher({ level: req.params.id });

   await Teacher.updateMany(
    { subjects: { $in: subjectsToDelete } },
    { $pull: { subjects: { $in: subjectsToDelete } } }
  );

  const deletedSchedule = await Schedule.findOneAndDelete({
    ownerId: req.params.id,
  });

  res
    .status(StatusCodes.OK)
    .json({ msg: "Level deleted", level: removedLevel });
};
