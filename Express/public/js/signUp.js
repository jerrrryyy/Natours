import axios from 'axios'
import { showAlert } from './alerts';

export const signUp = async(name,email , password,passwordConfirm)=>{
    try{
        const res = await axios({
            method:'POST',
            url:'/api/v1/users/signup',
            data:{
                name,
                email,
                password,
                passwordConfirm
            }
        })

        if(res.data.status=='success'){
            showAlert('success','Congratulations you are successsfully signed up')
            window.setTimeout(()=>{
                location.assign('/')
            },1000)
        }
    }
    catch(err){
        showAlert('error',err.response.data.message)
    }
}