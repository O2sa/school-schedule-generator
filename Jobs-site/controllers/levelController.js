import Level from "../models/LevelModel.js";
import { StatusCodes } from "http-status-codes";
import day from "dayjs";

export const getAllLevels = async (req, res) => {
    const levels = await Level.find();
    res.status(StatusCodes.OK).json({ levels });
};

export const createLevel = async (req, res) => {
  const level = await Level.create(req.body);
  res.status(StatusCodes.CREATED).json({ level });
};

export const getLevel = async (req, res) => {
  const level = await Level.findById(req.params.id);
  res.status(StatusCodes.OK).json({ level });
};

export const updateLevel = async (req, res) => {
  const updatedLevel = await Level.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(StatusCodes.OK).json({ msg: "Level modified", Level: updatedLevel });
};

export const deleteLevel = async (req, res) => {
  const removedLevel = await Level.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({ msg: "Level deleted", level: removedLevel });
};
