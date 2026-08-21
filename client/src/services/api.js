import axios from "axios";

const api = axios.create({
  baseURL: "hhttps://restaurnat-management-an6e.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;