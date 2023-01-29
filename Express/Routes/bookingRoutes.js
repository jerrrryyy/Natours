const express = require('express');
const bookingController = require('./../Handlers/bookingController');
const authController = require('./../Handlers/authController');

const router = express.Router();

//booking routes
router.use(authController.protect);

router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .delete(bookingController.deleteBooking)
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking);

module.exports = router;
