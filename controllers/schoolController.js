import School from "../models/SchoolModel.js";
import Schedule from "../models/ScheduleModel.js";
import Subject from "../models/SubjectModel.js";
import { StatusCodes } from "http-status-codes";

import day from "dayjs";
import Teacher from "../models/TeacherModel.js";
import Level from "../models/LevelModel.js";

export const getAllSchools = async (req, res) => {
  const schools = await School.find();
  res.status(StatusCodes.OK).json({ schools });
};

export const createSchool = async (req, res) => {
  const school = await School.create(req.body);

  res.status(StatusCodes.CREATED).json({ school });
};

export const getSchool = async (req, res) => {
  const schoolId = req.user.schoolId;
  const school = await School.findById(schoolId);
  res.status(StatusCodes.OK).json({ school });
};

export const updateSchool = async (req, res) => {
  const updatedSchool = await School.findByIdAndUpdate(
    req.user.schoolId,
    req.body,
    {
      new: true,
    }
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: "School modified", school: updatedSchool });
};



export const setupData = async (req, res) => {
  const data = req.body.data;
  const teachers = req.body.teachers;
  const schoolId = req.user.schoolId;

  for (let ele = 0; ele < teachers.length; ele++) {
    const createdTeacher = await Teacher.create({
      ...teachers[ele],
      school: schoolId,
    });
    console.log(createdTeacher);
  }

  
  for (let ele = 0; ele < data.length; ele++) {
    const createdLevel = await Level.create({
      ...data[ele].level,
      school: schoolId,
    });
    console.log(createdLevel);

    const subjects = data[ele].subjects;
    for (const su in subjects) {
      const createdSubject = await Subject.create({
        ...subjects[su],
        level: createdLevel._id,
      });
      console.log(createdSubject);
    }
  }
  res.status(StatusCodes.CREATED).json({ msg: "done!!" });
};

export const deleteSchool = async (req, res) => {
  const removedSchool = await School.findByIdAndDelete(req.params.id);

  const deletedlevels = await Level.deleteMany({
    school: req.params.id,
  });

  const deletedTeachers = await Teacher.deleteMany({
    school: req.params.id,
  });

  res
    .status(StatusCodes.OK)
    .json({ msg: "School deleted", school: removedSchool });
};
