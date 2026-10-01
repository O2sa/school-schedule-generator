import Class from "../models/LevelModel.js";
import Subject from "../models/SubjectModel.js";
import Teacher from "../models/TeacherModel.js";
import { StatusCodes } from "http-status-codes";
import Schedule from "../models/ScheduleModel.js";
import mongoose from "mongoose";
import day from "dayjs";
import Level from "../models/LevelModel.js";
import { DAYS_OF_WEEK_EN, WEEK_DAYS } from "../utils/constants.js";
import { generator } from "../shedule_generator/generator.js";

export const getAllSchedules = async (req, res) => {
  const schedules = await Schedule.find({ ownerType: "level" }).populate({
    path: "schedule",
    model: "Subject",

    // populate: {
    //   path: "$*",
    //   model: "Subject",
    // },
  });
  const levels = await Level.find().populate("subjects");

  res.status(StatusCodes.OK).json({ schedules, levels });
};

export const getSchedule = async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);
  res.status(StatusCodes.OK).json({ schedule });
};

export const updateTeacherSchedle = async (req, res) => {
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: "teacher modified", teacher: updatedTeacher });
};

export const generateSchedule = async (req, res) => {
  console.log(req.body.stages);
  // const schedules = await Schedule.find({});

  // console.log(req.body);
  // console.log(req.user);
  await generator(req.user.schoolId, req.body.stages);

  res.status(StatusCodes.OK).json({ msg: "schedule genrated" });
};

export const editScheduleLecture = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "editScheduleLecture" });
};
export const updateSchedule = async (req, res) => {
  const updatedSchedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: "Schedule modified", Subject: updatedSchedule });
};
