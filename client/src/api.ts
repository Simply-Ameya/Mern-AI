import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const sendMessage = async (message: string) => {
  const res = await API.post("/api/chat", { message });
  return res.data.reply;
};
