const fs = require('fs');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../Models/tourModel');
const Review = require('./../Models/reviewModel');
const User = require('./../Models/userModel');

//Read json file

dotenv.config({ path: './../config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

//connecting to mongoose
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//import data into db

const importData = async () => {
  try {
    //below code take object
    await User.create(users,{validateBeforeSave:false}) //not validating before save
    await Review.create(reviews)

    await Tour.create(tours); // tour.create always always return promise
    //one more thing comment out the password encryption before to avoid double encryption
    console.log('data successfully added');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delet all data from db before adding a data

const deleteData = async () => {
  try {
    //below code take object
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//interacting with cmd
// console.log(process.argv)

if (process.argv[2] == '--delete') {
  deleteData();
} else if (process.argv[2] == '--import') {
  importData();
}
