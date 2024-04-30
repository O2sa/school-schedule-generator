import Teacher from "../models/TeacherModel.js";
import Schedule from "../models/ScheduleModel.js";
import School from "../models/SchoolModel.js";
import Level from "../models/LevelModel.js";
import { StatusCodes } from "http-status-codes";
import day from "dayjs";


export const getAllTeachers = async (req, res) => {
  const teachers = await Teacher.find({ school: req.user.schoolId }).populate(
    "subjects"
  );
  res.status(StatusCodes.OK).json({ teachers });
};

export const createTeacher = async (req, res) => {
  const teacher = await Teacher.create({
    ...req.body,
    school: req.user.schoolId,
    role: "teacher",
  });
  const schedule = await Schedule.create({
    name: teacher.name,
    ownerType: "teacher",
    ownerId: teacher._id,
  });
  res.status(StatusCodes.CREATED).json({ teacher });
};

export const getTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate("subjects");
  res.status(StatusCodes.OK).json({ teacher });
};
export const getStageTeachers = async (req, res) => {
const level=await Level.findById(req.params.id)

  const teachers = await Teacher.find({stage: level.stage})
  // console.log('teachers',teachers)
  res.status(StatusCodes.OK).json({ teachers });
};

export const updateTeacher = async (req, res) => {
  console.log(req.body);
  // const {name, workDays,}=req.body
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: "Teacher modified", teacher: updatedTeacher });
};

export const deleteTeacher = async (req, res) => {
  const removedTeacher = await Teacher.findByIdAndDelete(req.params.id);
  const deletedSchedule = await Schedule.deleteMany({
    ownerId: req.params.id,
  });
  res
    .status(StatusCodes.OK)
    .json({ msg: "Teacher deleted", teacher: removedTeacher });
};
