import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './mapbox';
import { logout } from './login';
import { updateData } from './updateSettings';
import {bookTour} from './stripe'








//DOM elements
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
//picking up the form from the html
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const bookbtn = document.getElementById('book-tour')





//values

//delegation
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if(logOutBtn) logOutBtn.addEventListener('click',logout)


if(userDataForm){
  userDataForm.addEventListener('submit',e=>{
    e.preventDefault();
    const form = new FormData();

    form.append('name',document.getElementById('name').value)
    form.append('email',document.getElementById('email').value)
     form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form)

    updateData(form,'data')
  })
}

if(userPasswordForm){
  userPasswordForm.addEventListener('submit',async e=>{
    e.preventDefault();
    document.querySelector('.btn--save--password').innerHTML ='Updating.....'
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    
    await updateData({oldPassword,newPassword,passwordConfirm},'password')
    document.querySelector('.btn--save--password').innerHTML ='save Password'

    document.getElementById('password-current').value=""
    document.getElementById('password').value=""
    document.getElementById('password-confirm').value=""
  })

}


if(bookbtn){
  bookbtn.addEventListener('click', e=>{
    e.target.textContent = 'Processing.....'
    //e.target is the element that trigger that event :- button
    const {tourId} = e.target.dataset;
  
    bookTour(tourId)

  })
}

