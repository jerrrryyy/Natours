const express = require('express');
const reviewController = require('./../Handlers/reviewController');
const authController = require('./../Handlers/authController');

//router
//by default each router has the access to their params
//but by merging params we get access to the params of other route where we use the reviewroute
//for example using the params of tourID
const router = express.Router({ mergeParams: true });

//review routes

//authentication
//using middleware to protect routes
router.use(authController.protect)
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(authController.restrictTo('user','admin'),reviewController.deleteReview)
  .patch(authController.restrictTo('user','admin'),reviewController.updateReview);



  
module.exports = router;
