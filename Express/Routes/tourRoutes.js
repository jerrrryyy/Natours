const express = require('express');
const authController = require('./../Handlers/authController');
const reviewController = require('./../Handlers/reviewController');
const reviewRouter = require('./../Routes/reviewRoutes');

const handler = require('./../Handlers/tourHandler');

router = express.Router();

// //param middleware funtion
// router.param('id', handler.checkID);

//mounting a router :- means if 1 req come to some route we will redirect it to some other route
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(handler.getAllTour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    handler.createTour
  );
router
  .route('/top-5-cheaptours')
  .get(handler.aliasTopTours, handler.getAllTour);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    handler.getMonthlyPlan
  ); //we also give the year in the url


router.route('/tour-stats').get(handler.getTourStats);


router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(handler.getTourWithin)
// /tours-within?distance=233&center=-40,50&unit=mi :---it is query string we can also use that


//Aggregate geoJSON route

router.route('/distances/:latlng/unit/:unit').get(handler.getDistances)

router
  .route('/:id/:x?/:y?')
  .get(handler.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    handler.uploadTourImages,
    handler.resizeTourImages,
    handler.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    handler.deleteTour
  );

module.exports = router;
