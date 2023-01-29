const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

//******** deleting *********
exports.deleteOne = (Model) =>
  (exports.deleteTour = catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that id', 404)); //immediatly return //404:-
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }));

//******** updating *********
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //first argument is which id is need to be update
    //second argument is what we want to update
    //last argument what we want return
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No doc found with that id', 404)); //immediatly return
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//******** creating *********
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //creating a model

    const doc = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//******** getting only one *********
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //populate is used to actually populate the json with the actual data not just the reference

    let query = Model.findById(req.params.id);

    //checking populate
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that id', 404)); //immediatly return
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //using model to read data from the database
    //now the below function will return a promise so we will await

    //to allow  for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)//mongodb = find({}) shows every result
      .filter()
      .sorting()
      .limiting()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      results: doc.length,
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
