import axiosInstance from './axiosInstance';

const authService = {
  register: (data) => {
    console.log('Sending data:', data); // Thêm log này
    return axiosInstance.post('/auth/register', data);
  },
  
  login: (email, password) => {
    return axiosInstance.post('/auth/login', { email, password });
  },
};

export default authService;