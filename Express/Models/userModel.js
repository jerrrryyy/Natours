const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//making a schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],

    minlength: [2, 'A username must be less than 2 chars'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'User must have a email'],
    lowercase: true, //converting the input data into lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default:'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: [8, 'password should be more than 8'],
    select: false, // to not show the password in get request
  },
  passwordConfirm: {
    type: String,
    required: [true, 'User must have a password'],
    index: false,
    validate: {
      //this will only work for the create and save
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  }
});

//Password encryption
//adding a middleware

userSchema.pre('save', async function (next) {
  //if any other thing is modified like gmail  we don't have to encrypt password again
  //we simply move to next middlware
  if (!this.isModified('password')) return next();

  //hashing using the bcrypt and cost = 12
  this.password = await bcrypt.hash(this.password, 12);

  //now we don't need passwordConfirm
  this.passwordConfirm = undefined;

  next();
});

//this is a instance function and it is the function to check if the loginPassword == signpassword
//because the password we get from the user is in plaintext and the password in database is encrypted
//so to compare both we use below function
userSchema.methods.correctPassword = function (loginPassword, signPassword) {
  return bcrypt.compare(loginPassword, signPassword);
};

//if password is changed we also have to change the passwordChangedAt attribute of the schema
//using the pre middleware
userSchema.pre('save',function(next){
  if(!this.isModified('password')|| this.isNew) return next()

  //subtracting the passwordChangedAT with 1s unsuring that jWT token always be greater than passwordChangedAt
  this.passwordChangedAt = Date.now()-1000;

  next()
})


//adding a middleware before every query that contains the find word like findbyid 
userSchema.pre(/^find/,function(next){
  //this points to current query
  this.find({active:{$ne:false}})
  next()
})

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};


userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    //console.log({resetToken},this.passwordResetToken)

    this.passwordResetExpires = Date.now()+10 *60 * 1000; // converting to miliseconds


    return resetToken;
};

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
