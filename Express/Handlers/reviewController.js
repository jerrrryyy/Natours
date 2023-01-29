//require modules
const express = require('express');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const handlerFactory = require('./handlerFactory');
const Tour = require('./../Models/tourModel');
const User = require('./../Models/userModel');
const Review = require('./../Models/reviewModel');

//getting all reviews

exports.getAllReviews = handlerFactory.getAll(Review)

//middleware
exports.setTourUserIds = (req, res, next) => {
  //allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //whenever i use the protect authorization in the route i have access to the req.user

  next();
};


//create reviews
exports.getReview = handlerFactory.getOne(Review)
exports.createReview =handlerFactory.createOne(Review)
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
