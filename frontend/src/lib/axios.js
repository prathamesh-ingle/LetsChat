//src/lib/axios.js
import axios from "axios";

const BASE_URL = import.meta.env.DEV ? "http://localhost:5001/api" : '/api';

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Send cookies with requests
});