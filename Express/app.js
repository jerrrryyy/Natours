 const express = require('express')
 const fs= require('fs')

const app = express();

b 
//midleware:- used to add data to the request
app.use(express.json())


// app.get('/',(req,res)=>{
//         // res.status(200).send("yes this server is running fine")
//         //now if i want to send the response a json file
//         res.status(200).json({name:"Madhav",age:21})
// })

// app.post('/',(req,res)=>{
//     res.send("you can post something here")
// })



//creating a api

//first we sync the data about the tours

const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours-simple.json`))

//we v1 for version means if we change code in future we just change the version
//callback function in this below example also called the  route handler
//In ES6 if key and value have the same name we don't specify it 
app.get('/api/v1/tours',(req,res)=>{
    
    res.status(200).json({
        "status":"success",
        "results":tours.length,
        data:{
            tours
        }
    })
    
})


//to make parameters optional we use ?
app.get('/api/v1/tours/:id/:x?/:y?',(req,res)=>{
    
    console.log(req.params)

    const id = Number.parseInt(req.params.id)

    const tour = tours.find(el => el.id ===id)
        //if(req.params>tours.length)
    if(!tour){
        return res.status(404).json({
           status:'fail',
           message:'Invalid ID'
        }
        )
    }
 
    res.status(200).json({
        status:"success",
        data:{
            tour 
        }
    })
    
})

//post request
//now post to create a new tour
app.post('/api/v1/tours',(req,res)=>{
     //console.log(req.body)

     //NOW WE ADD THE NEW REQUEST DATA TO THE DATA SET
     //WE  ARE GIVING THE NEW DATA ID BUT ITS ACTUALLY GIVEN BY THE DATABASE
     //AS WE DON'T HAVE DATABASE NOW SO WE GIVE IT 

    const newID = tours[tours.length-1].id + 1
    const newTour = Object.assign({id:newID},req.body)

    tours.push(newTour);
    fs.writeFile(`${__dirname}/data/tours-simple.json`,JSON.stringify(tours),err=>{
       res.status(202).json(
        {"status":"success",
        data:{
            tour:newTour
        }
    }
       )
    })


    //  res.send('done')
})


//patch data :- updating the properties of the object


app.patch('/api/v1/tours/:id', (req,res)=>{
    if(Number.parseInt(req.params.id)>tours.length){
        return res.status(404).json({
           status:'fail',
           message:'Invalid ID'
        }
        )
    }
    
    
   
    res.status(200).json({
        status:"success",
        data:{
            tour:'<update tour here....>'
        }
    })
})

app.delete('/api/v1/tours/:id', (req,res)=>{
    if(Number.parseInt(req.params.id)>tours.length){
        return res.status(404).json({
           status:'fail',
           message:'Invalid ID'
        }
        )
    }
    res.status(204).json({
        status:"success",
        data:null
    })
})

    
//define route with accepts variable from the url 



//server
// const port = 3000
// app.listen(port,()=>{
//     console.log("App is running on port ")
// })