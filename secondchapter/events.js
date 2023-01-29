
const EventEmitter = require('events');
const http = require('http')

//we can also inherit our own class from eventEmitter
// class Sales extends EventEmitter{
//     constructor(){
//         super();
//     }
// }
//this is the object of the eventEmitter
const myEmitter = new EventEmitter();

//we can have multiple callbacks functions
myEmitter.on('newSale',()=>{
    console.log("there was a new sale")
})

myEmitter.on('newSale',()=>{
    console.log("Customer Name :Madhav Jain")
})

myEmitter.on('newSale',stock =>{
    console.log("Customer Name :Madhav Jain with stocks : ",stock)
})
//new sale event happen and then a event emit
myEmitter.emit('newSale',9)

///second example using server

//creating a server
const server = http.createServer()

server.on('request',(req,res)=>{
    console.log("request recieved")
})
server.on('request',(req,res)=>{
    console.log("Another request recieved")
})
server.on('close',(req,res)=>{
    console.log("server closed")
})


server.listen(8000,"127.0.0.1",()=>{
    console.log("waiting for the requests...")
})

