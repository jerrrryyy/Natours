const Tour = require('./../Models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');
const User = require('./../Models/userModel');
const booking = require('./../Models/bookingModel');
const factory = require('./../Handlers/handlerFactory')

const Stripe = require('stripe');
const Booking = require('./../Models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1.) get the currenty booked tour

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const tours = await Tour.findById(req.params.tourID);

  //2.) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tours.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tours.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'aud',
          unit_amount: tours.price*100,
          product_data: {
            name: `${tours.name} Tour`,
            description: tours.summary,
            images: [`https://www.natours.dev/img/tours/${tours.imageCover}`],
          },
        },
      },
    ],
  });


  //3.) create session as response

  res.status(200).json({
    status:'success',
    session
  })
});

exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
  //this is temperory because it is insecure anyone can make payment without paing
  const {tour,user,price} = req.query

  if(!tour && !user && !price) return next()
  await booking.create({tour,user,price})
  //redirecting the req to the overview route but this time without query string
  res.redirect(req.originalUrl.split('?')[0])
})

exports.setTourUserIds = (req,res,next)=>{
  if(!req.body.tour) req.body.tour = req.params.userId;
  if(!req.body.user) req.body.user = req.user.id;
}


exports.createBooking = factory.createOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBooking = factory.getAll(Booking)

