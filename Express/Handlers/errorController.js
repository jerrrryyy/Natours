const AppError = require('./../utils/appError');

//converting the castError to the operational error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value} .`;
  return new AppError(message, 400);
};

//coverting the dublicateError to the operational error
const handleDuplicateFieldsDB = (err) => {
  const message = `Dublicate field value : ${err.keyValue.name}. Please use another value`;
  return new AppError(message, 400);
};

//handling validation Error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonError = () =>
  new AppError('Invalid Token please login again', 401); //401 unauthorized

const handleJWTExpiredError = () =>
  new AppError('Token expired  please login again', 401);

/* Development  errors */
const devError = (err, req, res) => {
  //route that not start  host address 127.0.0.1
  /********************for the API *****************/
  if (req.originalUrl.startsWith('/api')) {
    return   res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } 
      /*****************For rendered website********************** */
    res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  
};

/* Production errors */
const prodError = (err, req, res) => {

  /********************for the API *****************/
  if (req.originalUrl.startsWith('/api')) {
    //Operational errors :- These are the error we trust can happen
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }


    //errors that are not operational those errors not to be showen to the client
      //Loging an error
      console.error('Error', err);
      //sending a genric error so that we don't leak our errors to client
     return  res.status(500).json({
        status: 'fail',
        message: 'something went wrong',
      });
    
  } 

    /*****************For rendered website********************** */
    if (err.isOperational) {
      return res.status(err.statusCode).render('error',{
       title:'something went wrong',
       msg:err.message
      });
    }

    //errors that are not operational those errors not to be showen to the client
      //Loging an error
      console.error('Error', err);
      //sending a genric error so that we don't leak our errors to client
      return res.status(err.statusCode).render('error',{
        title:'something went wrong',
        msg:'please try again later'
       });
    
  
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500:- internel server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'development') {
    devError(err, req, res);
  } else if (process.env.NODE_ENV == 'production') {
    //destructuring of error
    let error = { ...err };
    error.message = err.message

    //changing the cast error to the operational error
    //I've faced this error, That was because the
    // value you want to filter in the _id field is not in an ID format, one "if" should solve your error.
    if (error.name == 'CastError') {
      error = handleCastErrorDB(error);
    }

    //changing a dublicate error by mongodb drive to operational error
    if (error.code == 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error._message == 'Validation failed') {
      error = handleValidationErrorDB(error);
    }

    //JSON web token error
    if (error.name == 'JsonWebTokenError') {
      error = handleJsonError();
    }

    //Handling token expired JWT
    if (error.name == 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    prodError(error, req, res);
  }
};
