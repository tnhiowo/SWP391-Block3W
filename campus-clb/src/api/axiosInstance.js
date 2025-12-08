import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:7112/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


instance.interceptors.request.use((config) => {
  console.log('Request:', config.baseURL + config.url);
  return config;
});

instance.interceptors.response.use(
  (response) => {
    console.log('Response Success:', response.status);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.message);
    return Promise.reject(error);
  }
);

export default instance;