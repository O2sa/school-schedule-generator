import { body, param, validationResult } from "express-validator";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InputLogicError,
} from "../errors/customErrors.js";
import mongoose from "mongoose";

import Subject from "../models/SubjectModel.js";
import Level from "../models/LevelModel.js";
import Teacher from "../models/TeacherModel.js";
import Schedule from "../models/ScheduleModel.js";
import School from "../models/SchoolModel.js";
import User from "../models/UserModel.js";
import {
  getLargestPropertyValue,
  getWeekDays,
  groupBy,
} from "../shedule_generator/utils.js";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);

        const firstMessage = errorMessages[0];
        console.log(Object.getPrototypeOf(firstMessage));
        if (errorMessages[0].startsWith("no job")) {
          throw new NotFoundError(errorMessages);
        }
        if (errorMessages[0].startsWith("not authorized")) {
          throw new UnauthorizedError("not authorized to access this route");
        }
        // if (errorMessages[0].startsWith("wrong")) {
        //   throw new UnauthorizedError("wrong input");
        // }

        if (errorMessages[0].startsWith("lectures-bigger-than-workdays")) {
          throw new InputLogicError(
            "لا بعد لأيام العمل أن تكون كافية لعدد المحاضرات"
          );
        }

        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateTeacherInput = withValidationErrors([
  body("workDays").custom(async (workDays, { req }) => {
    //setup data

    // try {
    const teacher = await Teacher.findById(req.params.id).populate("subjects");

    if (!teacher)
      throw new NotFoundError(`no teacher with id ${req.params.id}`);

    const school = await School.findById(teacher.school);
    const levels = await Level.find({
      stage: teacher.stage,
      school: teacher.school,
    });

    let largestLevel = 0;
    teacher.workDays = Number(workDays);

    if (teacher.subjects.length > 0) {
      largestLevel = getLargestPropertyValue(levels, "dailyLectures");
      validateTeacher(teacher, teacher.subjects, largestLevel, school);
    }

    const subjectsGroups=groupBy(teacher.subjects,'level')
    for(const group in subjectsGroups){
      validateLevelTeacherSubjects(teacher, subjectsGroups[group]);

    }
    // } catch (err) {
    //   console.error(err);
    // }
  }),
]);

export const validateTeacherOffLectures = withValidationErrors([
  body("offDaysAndLectures").custom(async (offDaysAndLectures, { req }) => {
    //setup data

    // try {
    const teacher = await Teacher.findById(req.params.id).populate("subjects");

    if (!teacher)
      throw new NotFoundError(`no teacher with id ${req.params.id}`);

    const school = await School.findById(teacher.school);
    const levels = await Level.find({
      stage: teacher.stage,
      school: teacher.school,
    });

    let largestLevel = 0;

    teacher.offDaysAndLectures = offDaysAndLectures;
    if (teacher.subjects.length > 0) {
      largestLevel = getLargestPropertyValue(levels, "dailyLectures");
      validateTeacher(teacher, teacher.subjects, largestLevel, school);
    }



    const subjectsGroups=groupBy(teacher.subjects,'level')
    for(const group in subjectsGroups){
      validateLevelTeacherSubjects(teacher, subjectsGroups[group]);

    }

    // } catch (err) {
    //   console.error(err);
    // }
  }),
]);

export const validateSubjectInput = withValidationErrors([
  body("weeklyLectures").custom(async (weeklyLectures, { req }) => {
    let newSub = req.body;
    newSub.weeklyLectures = Number(weeklyLectures);
    const levelDoc = await Level.findById(newSub.level).populate({
      path: "subjects",
      match: { _id: { $ne: newSub._id } },
    });

    const school = await School.findById(levelDoc.school);
    const teacher = await Teacher.findById(newSub.teacher).populate({
      path: "subjects",
      match: { _id: { $ne: newSub._id } },
    });
    const levels = await Level.find({
      stage: teacher.stage,
      school: teacher.school,
    });

    const teacherLevelSubjects = await Subject.find({
      teacher: teacher._id,
      level: levelDoc._id,
      _id: { $ne: newSub._id },
    });

    let largestLevel = 0;
    largestLevel = getLargestPropertyValue(levels, "dailyLectures");

    validateLevelLectures(levelDoc, [...levelDoc.subjects, newSub], school);
    validateTeacher(
      teacher,
      [...teacher.subjects, newSub],
      largestLevel,
      school
    );

    validateLevelTeacherSubjects(teacher, [...teacherLevelSubjects, newSub]);
  }),
]);

export const validateLevelInput = withValidationErrors([
  body("dailyLectures").custom(async (dailyLectures, { req }) => {
    const levelDoc = await Level.findById(req.params.id);

    const school = await School.findById(levelDoc.school);

    // const schoolDoc = await School.findById(levelDoc.school);
    const subjects = await Subject.find({ level: levelDoc._id });

    levelDoc.dailyLectures = Number(dailyLectures);
    validateLevelLectures(levelDoc, subjects, school);
  }),
]);

export const validateLevelIdParam = withValidationErrors([
  param("id").custom(async (value, { req }) => {
    const isValidMongoId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidMongoId) throw new BadRequestError("invalid MongoDB id");

    const level = await Level.findById(value);
    if (!level) throw new NotFoundError(`no job with id ${value}`);

    const school = await School.findById(level.school);
    if (!school) throw new NotFoundError(`no school with id ${value}`);

    const isAdmin =
      req.user.role === "admin" || req.user.role === "super-admin";
    const isOwner = req.user.userId === school.admin.toString();

    if (!isAdmin && !isOwner)
      throw new UnauthorizedError("not authorized to access this route");
  }),
]);

export const validateTeacherIdParam = withValidationErrors([
  param("id").custom(async (value, { req }) => {
    console.log("validateTeacherIdParam");

    const isValidMongoId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidMongoId) throw new BadRequestError("invalid MongoDB id");

    const teacher = await Teacher.findById(value);
    if (!teacher) throw new NotFoundError(`no teacher with id ${value}`);

    const school = await School.findById(teacher.school);
    if (!school) throw new NotFoundError(`no school with id ${value}`);

    const isAdmin =
      req.user.role === "admin" || req.user.role === "super-admin";
    const isOwner = req.user.userId === school.admin.toString();

    if (!isAdmin && !isOwner)
      throw new UnauthorizedError("not authorized to access this route");
  }),
]);

const validateTeacher = (teacher, subjects, largestLevel, school) => {
  const totalNeededLectures = subjects.reduce(
    (acc, val) => acc + val.weeklyLectures,
    0
  );
  const weekDays = getWeekDays(school.startDay, school.workDays);
  let totalAvaiableLectures = teacher.workDays * largestLevel;
  const teacherAverageLectures = Math.ceil(
    totalNeededLectures / teacher.workDays
  );

  const allowedBlockDays = school.workDays - teacher.workDays;
  let teacherBlockedDays = 0;
  const offDaysAndLectures = teacher.offDaysAndLectures.filter((v) =>
    weekDays.includes(v.day)
  );

  let offDays = offDaysAndLectures.reduce((acc, val) => {
    console.log("day", val.day);

    const offLectures = val.offLectures.filter((v) => v < largestLevel).length;
    console.log("offLects", offLectures);

    if (largestLevel - offLectures - teacherAverageLectures < 0) {
      teacherBlockedDays++;
    }
    return acc + offLectures;
  }, 0);

  let totalFreeLectures = largestLevel * school.workDays - offDays;

  console.log("allowedBlockDays", allowedBlockDays);
  console.log("weekDays", weekDays);
  console.log("offLectures", offDays);
  console.log("teacherBlockedDays", teacherBlockedDays);
  console.log("teacherAverageLectures", teacherAverageLectures);

  console.log("totalFreeLectures", totalFreeLectures);
  console.log("totalAvaiableLectures", totalAvaiableLectures);
  console.log("totalNeededLectures", totalNeededLectures);

  if (teacherBlockedDays > allowedBlockDays)
    throw new BadRequestError("wrong offDaysAndLectures wrong");

  if (
    totalFreeLectures < totalNeededLectures
    // ||
    // totalAvaiableLectures < totalNeededLectures
  ) {
    throw new BadRequestError("lectures-bigger-than-workdays");
  }
};

const validateLevelLectures = (level, subjects, school) => {
  // Calculate total lectures (assuming all elements represent lectures)
  const totalLevelLectures = school.workDays * level.dailyLectures;

  const totalCurrentLectures = subjects.reduce(
    (acc, val) => acc + val.weeklyLectures,
    0
  );

  console.log("totalCurrentLectures", totalCurrentLectures);
  console.log("totalLevelLectures", totalLevelLectures);

  if (totalCurrentLectures > totalLevelLectures) {
    throw new BadRequestError("weeklyLectures is very big");
  }
};

const validateLevelTeacherSubjects = (teacher, subjects) => {
  // const allowedDoubleDays=Math.floor(level.dailyLectures/2)
  const teachertotalLectures = subjects.reduce(
    (acc, val) => acc + val.weeklyLectures,
    0
  );

  if (teachertotalLectures > teacher.workDays) {
    throw new BadRequestError("weeklyLectures is very big");
  }
};
export const validateIdParam = withValidationErrors([
  param("id").custom(async (value, { req }) => {
    const isValidMongoId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidMongoId) throw new BadRequestError("invalid MongoDB id");
    const job = await Job.findById(value);
    if (!job) throw new NotFoundError(`no job with id ${value}`);
    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.userId === job.createdBy.toString();

    if (!isAdmin && !isOwner)
      throw new UnauthorizedError("not authorized to access this route");
  }),
]);

export const validateRegisterInput = withValidationErrors([
  body("name").notEmpty().withMessage("name is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new BadRequestError("email already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long"),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format"),
  body("password").notEmpty().withMessage("password is required"),
]);

export const validateUpdateUserInput = withValidationErrors([
  body("name").notEmpty().withMessage("name is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user.userId) {
        throw new BadRequestError("email already exists");
      }
    }),
]);

// 2-2
// 4-4
// 3,3,3
// 3,3,3

// 32
// 32
// 3
// 3
// 3

// s-workdays==5

// if workdays==1
//   lecs<=2

// if workdays==2
//   lecs<=4

// if workdays==3
//   lecs<=5

// if workdays==4
//   lecs<=6

// if workdays==5
//   lecs<=7

// s-workdays==6
// if workdays==1
//   lecs<=2

// if workdays==2
//   lecs<=4

// if workdays==3
//   lecs<=6

// if workdays==4
//   lecs<=7

// if workdays==5
//   lecs<=8

// if workdays==6
//   lecs<=9

// s-workdays==8
// if workdays==1
//   lecs<=2

// if workdays==2
//   lecs<=4

// if workdays==3
//   lecs<=6

// if workdays==4
//   lecs<=8

// if workdays==5
//   lecs<=9

// if workdays==6
//   lecs<=10

// if workdays==7
//   lecs<=11

// if workdays==8
//   lecs<=12
