const BASE_URL = import.meta.env.DEV 
  ? "http://localhost:5001/api" 
  : import.meta.env.VITE_API_BASE_URL || '/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});