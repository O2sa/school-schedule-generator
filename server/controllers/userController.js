import { StatusCodes } from 'http-status-codes';
import User from '../models/UserModel.js';

export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const userWithoutPassword = user.toJSON();
  res.status(StatusCodes.OK).json({ user: userWithoutPassword });
};





export const getAllAdmins = async (req, res) => {
  const admins = await User.find({role: 'admin'});
  res.status(StatusCodes.OK).json({ admins });
};

export const getAdmin = async (req, res) => {
  const admin = await User.findById(req.params.id);
  res.status(StatusCodes.OK).json({ admin });
};

export const updateAdmin = async (req, res) => {
  const updatedAdmin = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(StatusCodes.OK).json({ msg: "admin modified", admin: updatedAdmin });
};

export const deleteAdmin = async (req, res) => {
  const removedAdmin = await User.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({ msg: "admin deleted", admin: removedAdmin });
};

export const updateUser = async (req, res) => {
  // const newUser = { ...req.body };
  // delete newUser.password;
  // delete newUser.role;

  // if (req.file) {
  //   const file = formatImage(req.file);
  //   const response = await cloudinary.v2.uploader.upload(file);
  //   newUser.avatar = response.secure_url;
  //   newUser.avatarPublicId = response.public_id;
  // }
  // const updatedUser = await User.findByIdAndUpdate(req.user.userId, newUser);

  // if (req.file && updatedUser.avatarPublicId) {
  //   await cloudinary.v2.uploader.destroy(updatedUser.avatarPublicId);
  // }

  res.status(StatusCodes.OK).json({ msg: 'update user' });
};
