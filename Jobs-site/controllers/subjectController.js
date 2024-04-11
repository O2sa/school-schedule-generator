import Subject from "../models/SubjectModel.js";
import Teacher from "../models/TeacherModel.js";
import { StatusCodes } from "http-status-codes";
import day from "dayjs";

export const getAllSubjects = async (req, res) => {
  const subjects = await Subject.find();
  res.status(StatusCodes.OK).json({ subjects });
};
export const getClassSubjects = async (req, res) => {
  const subjects = await Subject.find({ level: req.params.id }).populate(
    "teacher"
  );
  // const teachers = await Teacher.find();
  res.status(StatusCodes.OK).json({ subjects });
};

export const createSubject = async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(StatusCodes.CREATED).json({ subject });
};

export const getSubject = async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  res.status(StatusCodes.OK).json({ subject });
};

export const updateSubject = async (req, res) => {
  const updatedSubject = await Subject.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: "Subject modified", Subject: updatedSubject });
};

export const deleteSubject = async (req, res) => {
  const removedSubject = await Subject.deleteOne({ _id: req.params.id });
  res
    .status(StatusCodes.OK)
    .json({ msg: "Subject deleted", subject: removedSubject });
};
