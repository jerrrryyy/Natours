const express = require('express');
const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../Models/userModel');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
//image processing library resizing images
const sharp = require('sharp');

//Multer storage

//this way image store in the disk
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); //callback function works similiar to next
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

/******************************  Image functionality********************* */
//this way image is going to save as a buffer
const multerStorage = multer.memoryStorage();

//Multer filter:- testing that the uploaded file is image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image !please only upload a image', 400), false); //400:- bad request
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync( async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

 await  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
    next()
});

/****************************************************************** */
const APIFeatures = require('./../utils/apiFeatures');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  //loop through object
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getAllUsers = handlerFactory.getAll(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  //1.)create error if user tries to POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for updating password', 400)); //400 :- bad request
  }

  //2.)update user document

  //we dont want that user shall change the role so we fiter the request
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//deleting a user

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'sucess',
    data: null,
  });

  //now we will make query middleware to not show the user when any query is made like show all users
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 500,
    Message: 'internal route error!Please use sign up for this',
  });
};
//do not update password with this because save hooks will not works
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.getUser = handlerFactory.getOne(User);
