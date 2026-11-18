import axios from 'axios';

// When running with Vite proxy or directly against Django
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/products/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = () => API.get('');
export const getProductById = (id) => API.get(`${id}/`);
export const createProduct = (data) => API.post('', data);
export const updateProduct = (id, data) => API.put(`${id}/`, data);
export const patchProduct = (id, data) => API.patch(`${id}/`, data);
export const deleteProduct = (id) => API.delete(`${id}/`);

export default API;
