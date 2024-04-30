import { body, param, validationResult } from "express-validator";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InputLogicError,
} from "../errors/customErrors.js";
import { JOB_STATUS, JOB_TYPE } from "../utils/constants.js";
import mongoose from "mongoose";

import Job from "../models/JobModel.js";
import Subject from "../models/SubjectModel.js";
import Level from "../models/LevelModel.js";
import Teacher from "../models/TeacherModel.js";
import Schedule from "../models/ScheduleModel.js";
import School from "../models/SchoolModel.js";
import User from "../models/UserModel.js";

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

        // if (errorMessages[0].startsWith("teacher")) {
        //   throw new InputLogicError("wrong input");
        // }

        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateJobInput = withValidationErrors([
  body("company").notEmpty().withMessage("teacher is required"),
  body("position").notEmpty().withMessage("position is required"),
  body("jobLocation").notEmpty().withMessage("job location is required"),
  body("jobStatus")
    .isIn(Object.values(JOB_STATUS))
    .withMessage("invalid status value"),
  body("jobType")
    .isIn(Object.values(JOB_TYPE))
    .withMessage("invalid type value"),
]);

export const validateTeacherInput = withValidationErrors([
  body("workDays").custom(async (workDays, { req }) => {
    //setup data

    try {
      const teacher = await Teacher.findById(req.params.id);
      if (!teacher)
        throw new NotFoundError(`no teacher with id ${req.params.id}`);

      const subjects = await Subject.find({ teacher: teacher._id }).populate(
        "level"
      );

      const school = await School.findById(teacher.school);

      // get all subjects levels
      let levels = [];
      for (let i = 0; i < subjects.length; i++) levels.push(subjects[i].level);
      // console.log(levels);

      let largestLevel = 0;
      if (subjects.length == 0) return;
      if (subjects.length == 1) {
        largestLevel = levels[0].dailyLectures;
      } else {
        largestLevel = levels.reduce((acc, curr) => {
          console.log(curr, acc);
          return curr.dailyLectures > acc.dailyLectures
            ? curr.dailyLectures
            : acc.dailyLectures;
        }, levels[0]);
      }

      let offDays = 0;
      let offDaysAndLectures = teacher.offDaysAndLectures;
      for (const offDay of offDaysAndLectures) {
        offDays += offDay.offLectures.length;
      }

      let totalNeededLectures = 0;
      for (let i = 0; i < subjects.length; i++) {
        totalNeededLectures += subjects[i].weeklyLectures;
      }
      console.log("largestLevel", largestLevel);
      console.log("offDays", offDays);
      console.log("school.workDays", school.workDays);

      let totalFreeLectures = largestLevel * school.workDays - offDays;
      let totalAvaiableLectures = workDays * largestLevel;

      console.log("totalFreeLectures", totalFreeLectures);
      console.log("totalAvaiableLectures", totalAvaiableLectures);
      console.log("totalNeededLectures", totalNeededLectures);

      if (
        totalFreeLectures < totalNeededLectures ||
        totalAvaiableLectures < totalNeededLectures
      ) {
        throw new BadRequestError("work days wrong");
      }
    } catch (error) {
      console.log(error);
    }
  }),

  // body("offDaysAndLectures").custom(async (offDaysAndLectures, { req }) => {
  //   //setup data


  //   try{
  //   const teacher = await Teacher.findById(req.params.id);
  //   if (!teacher)
  //     throw new NotFoundError(`no teacher with id ${req.params.id}`);

  //   const subjects = await Subject.find({ teacher: teacher._id }).populate(
  //     "level"
  //   );

  //   const school = await School.findById(teacher.school);

  //   // get all subjects levels
  //   let levels = [];
  //   for (let i = 0; i < subjects.length; i++) levels.push(subjects[i].level);
  //   // console.log(levels);

  //   let largestLevel = 0;
  //   if (subjects.length == 0) return;
  //   if (subjects.length == 1) {
  //     largestLevel = levels[0].dailyLectures;
  //   } else {
  //     largestLevel = levels.reduce((acc, curr) => {
  //       console.log(curr, acc);
  //       return curr.dailyLectures > acc.dailyLectures
  //         ? curr.dailyLectures
  //         : acc.dailyLectures;
  //     }, levels[0]);
  //   }

  //   let totalAvaiableLectures = teacher.workDays * largestLevel;

  //   const teacherAverageLectures = Math.ceil(
  //     totalAvaiableLectures / teacher.workDays
  //   );

  //   let offDays = 0;
  //   const allowedBlockDays = school.workDays - teacher.workDays;

  //   let teacherBlockedDays = 0;
  //   for (let i = 0; i < offDaysAndLectures; i++) {
  //     const dayBlockedLects = offDaysAndLectures[i].offLectures.length;
  //     offDays += dayBlockedLects;

  //     if (
  //       largestLevel.dailyLectures - dayBlockedLects >
  //       teacherAverageLectures
  //     ) {
  //       teacherBlockedDays++;
  //     }
  //   }

  //   let totalFreeLectures = largestLevel * school.workDays - offDays;

  //   if (teacherBlockedDays > allowedBlockDays)
  //     throw new BadRequestError("wrong offDaysAndLectures wrong");

  //   let totalNeededLectures = 0;
  //   for (let i = 0; i < subjects.length; i++) {
  //     totalNeededLectures += subjects[i].weeklyLectures;
  //   }

  //   console.log("largestLevel", largestLevel);
  //   console.log("offDays", offDays);
  //   console.log("school.workDays", school.workDays);

  //   console.log("totalFreeLectures", totalFreeLectures);
  //   console.log("totalAvaiableLectures", totalAvaiableLectures);
  //   console.log("totalNeededLectures", totalNeededLectures);

  //   if (
  //     totalFreeLectures < totalNeededLectures ||
  //     totalAvaiableLectures < totalNeededLectures
  //   ) {
  //     throw new BadRequestError("work days wrong");
  //   }
  //   }
  //   catch(err){
  //     console.error(err)
  //   }
  // }),
]);

export const validateSubjectInput = withValidationErrors([
  body("weeklyLectures").custom(async (weeklyLectures, { req }) => {
    let newSub = req.body;
    const levelDoc = await Level.findById(newSub.level).populate("subjects");

    const school = await School.findById(levelDoc.school);

    // const schoolDoc = await School.findById(levelDoc.school);
    const subjects = levelDoc.subjects;
    console.log("subjects", subjects);

    // Calculate total lectures (assuming all elements represent lectures)
    const totalLevelLectures = school.workDays * levelDoc.dailyLectures;

    let totalCurrentLectures = Number(weeklyLectures);
    for (let i = 0; i < subjects.length; i++) {
      if (newSub?._id == subjects[i]._id) continue;
      totalCurrentLectures += Number(subjects[i].weeklyLectures);
    }
    // console.log(totalCurrentLectures)

    console.log("totalCurrentLectures", totalCurrentLectures);
    console.log("totalLevelLectures", totalLevelLectures);
    // console.log("totalNeededLectures", totalNeededLectures);

    // Check if total lectures is less than or equal to level lectures
    if (totalCurrentLectures > totalLevelLectures) {
      throw new InputLogicError("weeklyLectures is very big");
    }
  }),
]);
export const validateLevelInput = withValidationErrors([
  body("dailyLectures").custom(async (dailyLectures, { req }) => {
    const levelDoc = await Level.findById(req.params.id);

    const school = await School.findById(levelDoc.school);

    // const schoolDoc = await School.findById(levelDoc.school);
    const subjects = await Subject.find({ level: levelDoc._id });

    // Calculate total lectures (assuming all elements represent lectures)
    const totalLevelLectures = school.workDays * dailyLectures;

    let totalCurrentLectures = 0;
    for (let i = 0; i < subjects.length; i++) {
      totalCurrentLectures += subjects[i].weeklyLectures;
    }
    console.log("totalCurrentLectures", totalCurrentLectures);
    console.log("totalLevelLectures", totalLevelLectures);

    // Check if total lectures is less than or equal to level lectures
    if (totalCurrentLectures > totalLevelLectures) {
      throw new InputLogicError("wrong input");
    }
  }),
]);

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

export const validateSubjectLectures = withValidationErrors([
  body("weeklyLectures").custom(async (value, { req }) => {
    console.log(req.body, value);
    if (!validateLectures(req.body.level, value)) {
      throw new InputLogicError("wrong input");
    }
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

export const validateLectures = async (levelId, subjectLectures) => {
  try {
    // Find the level document based on the level field value
    const levelDoc = await Level.findById(levelId);
    // const schoolDoc = await School.findById(levelDoc.school);
    const subjects = await Subject.find({ level: levelId });

    // Check if level document exists
    if (!levelDoc) {
      return new Error("Invalid level reference"); // Throw error for invalid level reference
    }

    // Calculate total lectures (assuming all elements represent lectures)
    const totalLevelLectures = 6 * levelDoc.dailyLectures;
    let totalCurrentLectures = subjectLectures;
    for (let i = 0; i < subjects.length; i++) {
      totalCurrentLectures += subjects[i].weeklyLectures;
    }

    // Check if total lectures is less than or equal to level lectures
    if (totalCurrentLectures > totalLevelLectures) {
      throw new InputLogicError("wrong input");
    }
  } catch (err) {
    return new Error(err); // Throw error for invalid level reference
  }
};
