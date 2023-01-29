class AppError extends Error{
    constructor(message,statusCode){
        super(message) //calling the parent class constuctor
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail':'error';
        this.isOperational = true;
        Error.captureStackTrace(this,this.constructor) //(currentObject,whole AppError class)
    }
}

module.exports = AppError