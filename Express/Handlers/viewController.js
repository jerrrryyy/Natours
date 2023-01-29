const Tour = require('./../Models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')
const User = require('./../Models/userModel')
const Booking = require('./../Models/bookingModel')

exports.getOverview = catchAsync(async (req, res, next) => {
  //1.)get tour data from collection
  const tours = await Tour.find();

  //2.)Build Template


  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1.) get data from the collection guides and reviews
  const tours = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if(!tours){
    return next(new AppError('There is no tour with this name ', 404))
  }

  //2.) build template

  //3.) render template using data from 1.

  res.status(200).render('tour', {
    title: `${tours.name} tour`,
    tours,
  });
});




exports.getLoginForm = (req,res)=>{
  
res.status(200).render('login',{
    title:`Log into your account`
})
}


exports.getAccount = (req,res)=>{


  res.status(200).render('account',{
    title:'Your Account'
  })
}


exports.getMyTours = catchAsync(async(req,res,next)=>{
  //1.) find all bookings
  const  bookings = await Booking.find({user:req.user.id})

  //2. find tours with the return ids
  const tourIDs = bookings.map(el=> el.tour)

  const tours = await Tour.find({_id:{$in:tourIDs}})

  res.status(200).render('overview',{
    title:'My tours',
    tours
  })
})

exports.updateUserData = catchAsync(async (req,res,next)=>{
  //we cannot access the req.body in this 
  //so basically we need to parse the request so that i can use the form request
  //by adding a middleware in app2.js 
  const updatedUser = await User.findByIdAndUpdate(req.user.id,{
    name:req.body.name,
    email:req.body.email
  },
  {
    new:true,
    runValidators:true
  })

  res.status(200).render('account',{
    title:'Your Account',
    user:updatedUser
  })
})
