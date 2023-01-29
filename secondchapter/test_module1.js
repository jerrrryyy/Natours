// class Calculator {
//     add(a,b){
//         return a+b
//     }

//     multiply(a,b){
//         return a*b
//     }

//     divide(a,b){
//         return a/b
//     }
// }

// //if we want to export only one thing 
// module.exports = Calculator;

module.exports = class  {
    add(a,b){
        return a+b
    }

    multiply(a,b){
        return a*b
    }

    divide(a,b){
        return a/b
    }
}
