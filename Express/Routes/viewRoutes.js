const express = require('express');
const handler = require('../Handlers/viewController');
const authorization = require('./../Handlers/authController');
const bookingController = require('./../Handlers/bookingController');


const router = express.Router()


 //used for rendering pages

  router.get('/' ,bookingController.createBookingCheckout,authorization.isLoggedIn,handler.getOverview)
  
  router.get('/tour/:slug',authorization.isLoggedIn ,handler.getTour)

  router.get('/login',authorization.isLoggedIn,handler.getLoginForm)

  router.get('/me',authorization.protect,handler.getAccount)

    router.get(
      '/my-tours',
      authorization.protect,
      handler.getMyTours
    );


  router.post('/submit-user-data',authorization.protect,handler.updateUserData)



module.exports = router