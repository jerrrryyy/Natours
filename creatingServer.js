//using http module
const fs = require('fs')
const http = require('http')
//using url module  for routing
const url = require('url')

const slugify = require('slugify')
const  replaceTemplate  = require('./replaceTemplate')



//read file in the starting of the file as it is on the top so executed once 
//if we read file in server it will execute everytime we make a requ
const data = fs.readFileSync(`${__dirname}/JSONdata/data.json`,'utf-8')
const tempCard = fs.readFileSync(`${__dirname}/template-card.html`,'utf-8')
const templateOverview = fs.readFileSync(`${__dirname}/overview.html`,'utf-8')
const productOverview = fs.readFileSync(`${__dirname}/product.html`,'utf-8')




const dataObj = JSON.parse(data);//if we want to make the object of the json files


const server = http.createServer((req,res)=>{

   
   const {query,path}=  url.parse(req.url,true)
 //  console.log(path,query)

  
    //OVERVIEW PAGE
    if(req.url =='/' || req.url =='/overview'){
        res.writeHead(200,{'Content-type':'text/html'})


       

        const cardHTML = dataObj.map(el => replaceTemplate(tempCard,el)).join('')
 
       const output = templateOverview.replace('{%PRODUCT_CARDS%}',cardHTML)

        res.end(output)
    }
    //PRODUCT PAGE
    else if(req.url == path){
        res.writeHead(200,{'content-type':'text/html'})
        const product = dataObj[query.id]
        const output = replaceTemplate(productOverview,product)


        res.end(output)
    }
    //API PAGE
    else if(req.url == '/api'){
        res.writeHead(202,{
            'content-type':'application/json'
        })
        res.end(data);
    }
    //NOT FOUND PAGE
    else{
        res.writeHead(404,{
            'content-type':'text/html',
            'my-own-header':'defected-material'
        })
        res.end('<h2>Page not found<h2>')
    }
})

// server.listen(8000,'127.0.0.1', ()=>{
//     console.log("yep listening to the server")
// })


//SIGTERM SIGNAL 

//heroku shutdown the server after 24 hour by sending sigterm signals 
process.on('SIGTERM',()=>{
    console.log('SIGTERM RECEIVED ! SHUTTING DOWN GRACEFULLY')
    server.close(()=>{
        console.log('Process terminated !')
    })
})
