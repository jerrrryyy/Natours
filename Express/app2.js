//adding a modules to our code
const path = require('path')
const rateLimit = require('express-rate-limit');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')

const morgan = require('morgan');
const app = express();
const AppError = require('./utils/appError');
const errorController = require('./Handlers/errorController');

const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const viewRouter = require('./Routes/viewRoutes')
const reviewRouter = require('./Routes/reviewRoutes')
const bookingRouter = require('./Routes/bookingRoutes');
//pug template
app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))

//security middlewares


//security http headers
// app.use(helmet());

//rate Limit middleware :- blocking req from same IP
//100 request in 1 hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP , please try again in an hour',
});
app.use('/api', limiter);

/*  Morgan Middlware */

//midleware:- used to add data to the request
//express.json is the built in function of express used for adding data to the request
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser()) //parses the data from the cookie

// form sends data to server is urlendcoded and we want to parse that data 
app.use(express.urlencoded({extended:true,limit:'10kb'}))

//Data sanitization against NOSQL query injection
//removes all the dollar signs from the request
app.use(mongoSanitize());

//Data sanitization against XSS
//remove the malicious html code from the request:- it converts the html to html enitity like adding &lt; infront of it
app.use(xss());

//prevent parameter pollution like using the
//if we don't use this we will get the error if we use dublicate properties
//for example in real we use :- sort = duration,price
//but we will get error if we use sort = duration & sort = price
app.use(
  hpp({
    //specifing the whitelist
    //whiteList:- is the array for which we accept the duplicate property
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

//middleware to use the files in my folder
//serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname,'public')));

//creating our own middleware function
//this middleware apply to every single route

app.use((req, res, next) => {
  console.log('hello from the Middleware');
  //adding date to the req
  req.requestTime = new Date().toISOString();
  //we used next() so that now the request move to the next route function

  
  next();
});

/*                      -----creating an api-------                     */

//these middlewares are for specific routes only

//Routes


app.use('/',viewRouter)
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);



//handling undefined routes

app.all('*', (req, res, next) => {
  //all the http methods like get post put

  // const err = new Error(`can't find ${req.originalUrl} on this server!`)
  // err.status ='fail'
  // err.statusCode = 404

  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404)); // if we give the argument to next() it will go directly to the global error middleware
});

//making an error handling middleware
app.use(errorController);

module.exports = app;
