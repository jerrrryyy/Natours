const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');


//handling other sync errors like i console something that does not exist 
//console.log(x)

process.on('uncaughtException',err =>{
  console.log('UNCAUGHT EXCePTION ! shutting down.....');
  console.log(err.name,err.message);

  process.exit(1); // code 1 for uncall exception and code 0 is for success
 
})


dotenv.config({ path: './config.env' });
const app = require('./app2');

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
  })
  .catch((err) => console.log('ERROR:- Promise rejected ***** DB connection unsuccessful ****** '));




//saving the object of the model which contains the data
//and then finally run the save function on it
//Now the save function returns the promise
console.log(process.env.NODE_ENV);
//server listening
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('App is running on port ');
});




//handling a unhandled rejection globally :- when some promise is rejected
//process.on is used as action listener
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION ! shutting down.....');
  console.log(err.name,err.message);
  //shutting the application if some promise is rejected

  //we will use the server.close so that we will give some time to the server to complete pending tasks before shutting
  server.close(() => {
    process.exit(1); // code 1 for uncall exception and code 0 is for success
  });
});

//SIGTERM SIGNAL 

//heroku shutdown the server after 24 hour by sending sigterm signals 
process.on('SIGTERM',()=>{
    console.log('SIGTERM RECEIVED ! SHUTTING DOWN GRACEFULLY')
    server.close(()=>{
        console.log('Process terminated !')
    })
})







