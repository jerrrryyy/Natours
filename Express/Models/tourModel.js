const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

//decribing our data using by creating a schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour must be less than 40 chars'],
      minlength: [2, 'A tour must be less than 2 chars'],
      //using a custom validator from the validator
      //we will not use this library because it also counts the space and restrict us to enter the name with spaces
      //validate:[validator.isAlpha,'tour name must only contain characters']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficult ,medium and easy difficulty applied',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'rating must be below 1.0'],
      //below code works every time new value set to ratingsAverage
      set:val =>Math.round(val*10)/10 //4.66666 46.6666 then converted to integer 47(by Math.round) and at last 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount price ({VALUE})should be below regular price',
        //*********below validator function only work while creating a document not for the update********
        validator: function (val) {
          return val < this.price; //return true if the condition is true and val is the inputed pricedisocoutn
        },
      },
    },
    summary: {
      type: String,
      trim: true, //to remove the white spaces from the end and the beginning
      required: [true, 'must have a summary'],
    },
    slug: String,
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image Cover'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false, //permantly hide from the output sensitive data
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    //embedded documents
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //embedded documents
    // guides: Array,

    //child reference
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
      },
    ],
  },
  //applying virtuals to our db
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//indexing :- querying on the bases of index field
tourSchema.index({startLocation:'2dsphere'}) //earth is 2dimension

// tourSchema.index({price:1}) //1 :- ascending order -1 :- descending order
tourSchema.index({ price: 1, ratingsAverage: -1 }); //1 :- ascending order -1 :- descending order
tourSchema.index({ slug: -1 });

//***************whenever we want to use the this keyword we will use the normal function not the arrow function***************
//virtuals:- if we want to add non-persistant data to our db without affecting the persistant data
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//middleware
//DOCUMENT MIDDLEWARE or pre middleware :- works before the save() and create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//embedded documents process
tourSchema.pre('save', async function (next) {
  //now guidePromises contains of promises
  const guidePromises = this.guides.map(async (id) => await User.findById(id));

  //therfore we will await all the promise
  this.guides = await Promise.all(guidePromises);
  next();
});

// //post work after pre
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE:- work before update find queries
//example showing a secret tour only to special peoples
tourSchema.pre(/^find/, function (next) {
  //using regular function /^/ to use it for query starting with find like findOne ,find or findMany

  this.find({ secretTour: { $ne: true } });

  //attaching a field to the object we received in the object that is start
  this.start = Date.now();
  next();
});

//populating query middleware
//it is used to query the user by just the id present in the tour document
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  //using a start field in object to find the time taken
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  next();
});

//third middleware :- AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   //console.log(this.pipeline())
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // to add the data in the beginning of an array
//   next();
// });

//creating a model using a above Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//we can also use the below method to add data to the tour
//const tour = new Tour({
//     data
// })
