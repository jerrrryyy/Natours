const express = require('express');
const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');

const multer = require('multer');
//image processing library resizing images
const sharp = require('sharp');

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

//building a middleware for uploading tour images
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// //if there is more than one image upload
// upload.array('array',5):-   req.files
// //only single image upload
// upload.single('image') :- req.file

//building a middleware to resize images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  //resizing the cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //resizing the images

  req.body.images = [];

  /*if we use for each in the below code and then use async inside of it
    it will basically not work and the function will not be awaited and run 
    to the next() middleware without awaiting therefore we will use the map 
    and add all the promises into the array and then use promise.all to 
    await all promises */
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../data/tours-simple.json`))

//tour Model
const Tour = require('./../Models/tourModel');
const User = require('./../Models/userModel');

//basically it is a middleware
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTour = handlerFactory.getAll(Tour);

// exports.checkID = (req, res, next, val) => {
//   console.log('the id of the tour is : ', val);
//   // if(Number.parseInt(req.params.id)>tours.length){

//   //     return res.status(404).json({
//   //        status:'fail',
//   //        message:'Invalid ID'
//   //     }
//   //     )
//   // }
//   next();
// };

exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });
exports.createTour = handlerFactory.createOne(Tour);
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 }, //when each json object pass through this pipeline one is added to the result
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    //{$match:{_id:{$ne:'EASY'}} }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

//giving a monthly plan

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //multiplying the param with to 1 to convert it in number

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' }, //making an array of names of tours in that month
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numOfTours: 1 }, // 1 is for ascending and -1 for descending
    },
    {
      $limit: 12, //to get only 12 documents
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// router.route('/tours-within/:distance/center/:latlng/unit/:unit',handler.getTourWithin)
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); //destructuring in array

  //in moongoose geosphecial data take radius in radians
  //converting radius

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'please provide latitude and longitude in format lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, //in geosphecial data always define lng then lat
  });
  console.log(lat, lng);

  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); //destructuring in array

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // converting mi to meters and if its in meter then in km
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide latitude and longitude in format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance', //this is where all the calculated distances stored
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',

    data: {
      data: distances,
    },
  });
});
