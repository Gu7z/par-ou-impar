import axios from "axios";

const apiCaller = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_URL}/api`,
});

export default apiCaller;
