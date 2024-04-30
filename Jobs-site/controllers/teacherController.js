import Teacher from "../models/TeacherModel.js";
import { StatusCodes } from "http-status-codes";
import day from "dayjs";

export const getAllTeachers = async (req, res) => {
    const teachers = await Teacher.find();
    res.status(StatusCodes.OK).json({ teachers });
};

export const createTeacher = async (req, res) => {
  const teacher = await Teacher.create(req.body);
  res.status(StatusCodes.CREATED).json({ teacher });
};

export const getTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  res.status(StatusCodes.OK).json({ teacher });
};

export const updateTeacher = async (req, res) => {
  const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(StatusCodes.OK).json({ msg: "Teacher modified", teacher: updatedTeacher });
};

export const deleteTeacher = async (req, res) => {
  const removedTeacher = await Teacher.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({ msg: "Teacher deleted", teacher: removedTeacher });
};
