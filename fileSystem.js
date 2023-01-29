const fs = require('fs')
const input = fs.readFileSync('./txt/input.txt','utf-8')
console.log(input);

const outputData =`This is very important information ${input} .\n created on ${Date.now()}`
const output = fs.writeFileSync('./txt/output.txt',outputData)
console.log("file created")

//now reading and writing file asynchronise way
fs.readFile('./txt/input.txt','utf-8',(err,data)=>{
    if(err) return console.log('ERRORRR ! ')
    console.log(data);
})
console.log("we will read file")

fs.writeFile('./txt/newOutput.txt',outputData,'utf-8',err =>{
    console.log('your file has been written')
})