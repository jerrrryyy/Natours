
import axios from 'axios';
import { showAlert } from './alerts'

const strip = Stripe(
  'pk_test_51MURBRGbMau8DwGtdvN1kBWxLd0ZsrPXxokm4VV1er3PRZx6Mh1j1r9UUpq8ccKRIUMwqwC8wr0DPwf103BkezAn00txepMxIO'
);


//booking a tour 
export const bookTour = async tourId =>{


try{

//1.) get the session from the server
const session = await axios(

  
  `/api/v1/bookings/checkout-session/${tourId}`
);
//console.log(session)

//2.) Create checkout form + charge credit card

 await strip.redirectToCheckout({
   sessionId: session.data.session.id,
 });
}
catch(err){
  showAlert('error',err)
}

}



    










