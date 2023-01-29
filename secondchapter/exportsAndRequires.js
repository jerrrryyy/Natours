console.log(arguments)
console.log(require("module").wrapper)


//importing dev function
const cal = require("./test_module1")

const cal1 = new cal();

console.log(cal1.multiply(2,9))

//using only exports
const calcul = require("./test_module2")

console.log(calcul.multiply(2,9))

//we can also use the destructuring in exports as we getting a object in return
const {add , multiply} = require("./test_module2")


console.log(add(1,2))

