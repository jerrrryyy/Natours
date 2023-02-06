const express = require('express');
const handler = require('../Handlers/viewController');
const authorization = require('./../Handlers/authController');
const bookingController = require('./../Handlers/bookingController');


const router = express.Router()


 //used for rendering pages




 router.use(handler.alerts)
  router.get('/' ,bookingController.createBookingCheckout,authorization.isLoggedIn,handler.getOverview)
  
  router.get('/tour/:slug',authorization.isLoggedIn ,handler.getTour)

  router.get('/login',authorization.isLoggedIn,handler.getLoginForm)

  router.get('/writeReview/:tourID', authorization.isLoggedIn,handler.writeReview);
  router.get('/signUp', authorization.isLoggedIn,handler.getSignForm);

  router.get('/me',authorization.protect,handler.getAccount)

    router.get(
      '/my-tours',
      authorization.protect,
      handler.getMyTours
    );

    router.get('/my-reviews/:userId',authorization.protect,handler.getMyReviews)



  router.post('/submit-user-data',authorization.protect,handler.updateUserData)



module.exports = router