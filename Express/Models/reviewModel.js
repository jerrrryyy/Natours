const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./userModel');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
      required: [true, 'Review must belong to user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//only one combination is true means combination should be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

/* calculating the  ratings Average*/
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats)

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this points to current review

  /* instead of using :- Review.calcAverageRatings(this.tour) we will use 
    below code because Review model is not created yet  */

  //this.constructor = Review (model)
  this.constructor.calcAverageRatings(this.tour);
});

//updating and deleting a review and changing the review average and review quanitity
//findByIdAndUpdate :-findOneAndUpdate behind the scenes
//findByIdAndDelete:- findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //using this.r(query variable) so that we can use it in post middleware
  //we can only use the calcAverageRatings function in post when query is executed
  this.r = await this.findOne();
 // console.log(this.r);
  next();
});

//we also use post middleware because we want updated or deleted data
reviewSchema.post(/^findOneAnd/, async function () {
  // this.r  = await this.findOne(); does not work here query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
