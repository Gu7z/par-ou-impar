import axios from "axios";

const apiCaller = axios.create({
  baseURL: "http://localhost:3000/api",
});

export default apiCaller;
