import Subject from "../models/SubjectModel.js";
import Teacher from "../models/TeacherModel.js";
import Level from "../models/LevelModel.js";
import { StatusCodes } from "http-status-codes";
import day from "dayjs";
import { InputLogicError } from "../errors/customErrors.js";

export const getAllSubjects = async (req, res) => {
  const subjects = await Subject.find();
  // .populate('teacher','level');
  res.status(StatusCodes.OK).json({ subjects });
};
export const getLevelInfo = async (req, res) => {

  const subjects = await Subject.find({ level: req.params.id}).populate("teacher");


  res.status(StatusCodes.OK).json(subjects );
};

export const createSubject = async (req, res) => {
  const subject = await Subject.create(req.body);
  await Level.updateOne(
    { _id: subject.level },
    { $push: { subjects: subject._id } }
  );


  await Teacher.updateOne(
    { _id: subject.teacher },
    { $push: { subjects: subject._id } }
  );
  res.status(StatusCodes.CREATED).json({ subject });
};

export const getSubject = async (req, res) => {
  const subject = await Subject.findById(req.params.id).populate("teacher");
  res.status(StatusCodes.OK).json({ subject });
};

export const updateSubject = async (req, res) => {
 
  const newSub = req.body;
  const updatedSubject = await Subject.findByIdAndUpdate(
    req.params.id,
    newSub,
    {
      new: true,
    }
  );



  res
    .status(StatusCodes.OK)
    .json({ msg: "Subject modified", Subject: updatedSubject });
};

export const deleteSubject = async (req, res) => {
  const removedSubject = await Subject.findByIdAndDelete(req.params.id);
  await Teacher.updateOne(
    { _id: removedSubject.teacher },
    { $pull: { subjects: removedSubject._id } }
  );

  await Level.updateOne(
    { _id: removedSubject.level },
    { $pull: { subjects: removedSubject._id } }
  );


  res
    .status(StatusCodes.OK)
    .json({ msg: "Subject deleted", subject: removedSubject });
};
