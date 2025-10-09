import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3000/",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Corrigido nome da chave
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Corrigido grafia e formato
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
