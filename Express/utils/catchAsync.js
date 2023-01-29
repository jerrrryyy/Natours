module.exports=  fn =>{
    return (req,res,next)=>{
      fn(req,res,next).catch(next);//express is really smart and know that there is error in next so it will 
      //move to global error middlware 
  
    }
  }