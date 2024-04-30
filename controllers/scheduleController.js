import Class from "../models/LevelModel.js";
import Subject from "../models/SubjectModel.js";
import Teacher from "../models/TeacherModel.js";
import { StatusCodes } from "http-status-codes";
import Schedule from "../models/ScheduleModel.js";
import mongoose from "mongoose";
import day from "dayjs";
import Level from "../models/LevelModel.js";
import { DAYS_OF_WEEK_EN, WEEK_DAYS } from "../utils/constants.js";

export const getAllSchedules = async (req, res) => {
  const { search, cls, sort } = req.query;

  const queryObject = {
    // createdBy: req.user.userId,
  };

  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  // if (cls && cls !== "all") {
  //   queryObject.cls = cls;
  // }

  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    "a-z": "position",
    "z-a": "-position",
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // setup pagination

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const schedules = await Schedule.find({ ownerType: "level" })
    .sort(sortKey)
    .skip(skip)
    .limit(limit);
  let levels = [];

  // let realSchedules=
  for (const sch of schedules) {
    const lev = await Level.findById(sch.ownerId);
    const subjects = await Subject.find({ level: lev._id }).populate('teacher')
    lev.subjects = subjects;
    levels.push(lev);

    // let currSch = {};
    // for (let day in sch.schedule) {
    //   let temp = [];
    //   for (let lec of sch.schedule[day]) {
    //     const subject = await Subject.findById(lec);
    //     temp.push(subject);
    //   }
    //   currSch[DAYS_OF_WEEK_EN[day]] = temp;
    // }
    // sch.schedule = currSch;
    // console.log(currSch);
  }
  const totalSchedules = await Schedule.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalSchedules / limit);

  res
    .status(StatusCodes.OK)
    .json({ totalSchedules, numOfPages, currentPage: page, schedules, levels });
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
  const schedules = await Schedule.find({});
  res
    .status(StatusCodes.OK)
    .json({ msg: "schedule genrated", schedules: schedules });
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
