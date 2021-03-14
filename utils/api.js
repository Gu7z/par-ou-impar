import axios from "axios";

const apiCaller = axios.create({
  baseURL: `${process.env.URL}/api`,
});

export default apiCaller;
