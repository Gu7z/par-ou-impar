import axios from "axios";

const apiCaller = axios.create({
  baseURL: `/api`,
});

export default apiCaller;
