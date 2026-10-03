import axios from "axios";

export const api = axios.create({
  baseURL: "http://10.239.74.116:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});