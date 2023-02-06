import axios from 'axios';
import { showAlert } from './alerts';
export const deleteReview = async (reviewId) => {
  try {
    //sending data using http request using a library called axios
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`,
    });

    if (res.data.status == 'success') {
      showAlert('success ', 'review deleted successfully');
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

