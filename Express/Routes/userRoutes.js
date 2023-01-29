const express = require('express');
const handler = require('./../Handlers/UserHandler');
const authorization = require('./../Handlers/authController');





const router = express.Router();

//users route()

router.post('/signup', authorization.signup);
router.post('/login', authorization.login);
router.get('/logout', authorization.logOut);
router.post('/forgotPassword', authorization.forgotPassword);
router.patch('/resetPassword/:token', authorization.resetPassword);
router.patch(
  '/updateMyPassword',
  authorization.protect,
  authorization.updatePassword
);


//insted of using the authrorization.protect in every route we simply use 
//below code is the middleware and middleware works in the sequence therefore
//we don't need authorization.protect seperatly in every route
router.use(authorization.protect)

router.get('/me',  handler.getMe, handler.getUser);
router.patch(
  '/updateMe',
  handler.uploadUserPhoto,
  handler.resizeUserPhoto,
  handler.updateMe
);//single as we only want to upload a single photo
router.delete('/deleteMe',  handler.deleteMe);

//using middleware restricting some routes
router.use(authorization.restrictTo('admin'))
router.route('/').get(handler.getAllUsers).post(handler.createUser);
router
  .route('/:id')
  .get(handler.getUser)
  .patch(handler.updateUser)
  .delete(handler.deleteUser);

module.exports = router;
