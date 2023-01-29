const fs = require('fs')
const crypto= require('crypto')

const start = Date.now();
//INCREASING THE THREADPOOL SIZE
process.env.UV_THREADPOOL_SIZE = 7;


setTimeout(()=>{
    console.log('Timer 1 finished'),0
});


setImmediate(()=>{
    console.log("Immediate one finished")
})


//event loop demonstation
//like fs function takes a request of the file  and then perform a call back function
// now the thing is that callback functions take place in the event loop 
//therfore settimeout 1 take 0 second and settimeout 2 take 3 seconds both of them are in the queue
//event loop take these two functions and then if they don't take so much time it will execute them
//but now comes a crypto function as it take so much time therefore it will send to  thread pool 
fs.readFile("./text-file.txt",()=>{
    console.log('I/o finished')
    setImmediate(()=>{
        console.log("Immediate one finished")
    })
    setTimeout(()=>{
        console.log('Timer 1 finished'),0
    });
    setTimeout(()=>{
        console.log('Timer 2 finished'),3000
    });
    

    //thread pool working asyncronsly with making more than one thread
    crypto.pbkdf2('password','salt',100000,1024,'sha512' ,()=>{
        console.log(Date.now()-start,"Password encrypted")
    })
    crypto.pbkdf2('password','salt',100000,1024,'sha512' ,()=>{
        console.log(Date.now()-start,"Password encrypted")
    })
    crypto.pbkdf2('password','salt',100000,1024,'sha512' ,()=>{
        console.log(Date.now()-start,"Password encrypted")
    })
    crypto.pbkdf2('password','salt',100000,1024,'sha512' ,()=>{
        console.log(Date.now()-start,"Password encrypted")
    })

    
    
})





console.log("hello from the top-level code")