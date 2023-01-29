const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  //first argument is the payload that is basically the id of the user
  //second argument is the secret or the private key
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '50d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  //sending a cookie

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), //also converting to miliseconds
    // secure: true, // cookie only be send on the encrypted connection
    httpOnly: true, //so that browser can't modify the cookie
  };

  //we only need the encrypted cookie in the production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  //remove the password from the output
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  //201 for creating new user
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url)
  //awaiting a async email
 await new Email(newUser,url).sendWelcome()
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password exists in the req
  if (!email || !password) {
    return next(
      new appError('please provide email and password for login', 400)
    );
  }
  //check if user exists and the email and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorrect email or password', 401)); //unauthorized access
  }

  //if everything is ok we send a token
  createSendToken(user, 200, res);
});



exports.logOut = (req,res)=>{
  res.cookie('jwt','loggedout',{
    expires : new Date(Date.now()+10*1000),
    httpOnly:true
  })
  res.status(200).json({status:'success'})
}

//new middleware function to protect our routes
//so that only login users have access to the tours

exports.protect = catchAsync(async (req, res, next) => {
  //1) getting the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new appError('sorry you are not login plz login to get access', 401)
    );
  }

  //2) Verification token

  //giving the 3 parameters to verify the token first is the get token from user and second is the secret
  //third is the callback function
  //converting the function into the promise using the promisify
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)check user still exists
  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(new appError('this user no longer exists ', 401));
  }

  //4)check if user changes password after the JWT is issued
  if (freshUser.changePasswordAfter(decode.iat)) {
    return next(
      new appError('User recently changed password please login again', 401)
    );
  }

  //5)finally giving access to the routers

  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try{
    //verify token
    const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    //2)check user still exists
    const freshUser = await User.findById(decode.id);
    if (!freshUser) {
      return next();
    }

    //3)check if user changes password after the JWT is issued
    if (freshUser.changePasswordAfter(decode.iat)) {
      return next();
    }


    //there is a logged in user
    //each pug template has user varible
    res.locals.user = freshUser;
    return next();
  }
  catch(err){
    return next()
  }
  }
  next();

};

exports.restrictTo = (...roles) => {
  //returning a middleware function
  return (req, res, next) => {
    //roles is an array:- ['admin','lead-guide']. role ='user'

    if (!roles.includes(req.user.role)) {
      return next(
        new appError('you do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.) get User based on posted email
  const user = await User.findOne({ email: req.body.email });

  //check user
  if (!user) {
    return next(new appError('there is no user with email address', 404));
  }

  //2.) generate the random reset token
  const resetToken = user.createPasswordResetToken();

  //deactivate all the validators before save so that we don't get the dublicate value error
  await user.save({ validateBeforeSave: false });

  //3.) sent it to users email

  //making a proper fomated message with url to the user email
  

 

  //finally using the email function created by us to send email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    //ending the cycle
    res.status(200).json({
      status: 'sucess',
      message: 'Token sent to email!',
    });

    //catching any error happened during sending an email
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });

    //giving an error
    return next(
      new appError(
        'There was an error sending the email , try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1.)Get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //so basically it find the user first by passwordResetToken and then check the passwordResetExpires
  //if passwordResetExpires is greater than todays date then its expired then user:- undefined
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2.) if token has not expired , and there is user , set the new password
  if (!user) {
    return next(new appError('Token is invalid or has expired', 400)); // 400 :- bad request
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  //checking all the validators
  await user.save();

  //3.) update changePasswordAt property for the user
  //4.) log the user in , send JWT

  createSendToken(user, 201, res);
});

//updateing the password

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1.) gets the user from collection

  //req.user.id is coming from the login as we set req.user = freshUser

  const user = await User.findById(req.user.id).select('+password');

  //2.)check if the posted password(current password) is correct

  if (
    !user ||
    !(await user.correctPassword(req.body.oldPassword, user.password))
  ) {
    next(new appError('entered password is incorrect', 401));
  }

  //3.)if  so , update password

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4.)log user in , send JWT

  createSendToken(user, 200, res);
});
