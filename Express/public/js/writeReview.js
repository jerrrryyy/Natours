import axios from 'axios';
import { showAlert } from './alerts';

export const review = async(review,rating,tourid)=>{
     try {
    //sending data using http request using a library called axios
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tourid}/reviews`,
      data: {
       review,
       rating
      },
      

    });

    if(res.data.status=='success'){
      showAlert('success ','review added')
      window.setTimeout(()=>{
        location.assign('/')
      },1000)
    }
 
  } catch (err) {
    showAlert('error',err.response.data.message)
  }
}



