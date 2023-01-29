const fs = require('fs')
const server = require('http').createServer()

server.on(('request'),(req,res)=>{
//solution 1 of reading a huge file
//now from below function node read the whole file and then show it on the webpage if 
//file is really big it would take longg time
// fs.readFile('test-file.txt','utf-8',(err,data)=>{
//     if(err) console.log(err)
//     console.log(data)
//     res.end(data)
// })


// //second solution  : streams
const readable  = fs.createReadStream('text-file.txt')

//on getting a request from the server 
//we readable take a chunk of data and then that chunk of data written in the response
// readable.on('data',chunk =>{
//     res.write(chunk);
// })
// //writing a last thing to end the stream
// readable.on('end',()=>{
//     res.end();
// })

// readable.on('error',err =>{
//     console.log(err)
//     res.statusCode = 500;
//     res.end("file not found")
// })




//now the problem is that some times second solution causes a back pressure
//back Pressure :- reading stream reads data so fast that writing that does not match that speed and causes lacking

//to fix that problem we use solution 3 that is using the pipe function of the readStream
//Pipe function writing directly to the response while reading with matching speed

//readingSouceInChunks.pipe(writingInResponse)
readable.pipe(res)

 })

server.listen(8000,"127.0.0.1",()=>{
    console.log("listening to the server  ..... ")
})