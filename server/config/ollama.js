import axios from "axios";

const ollama = async (messages) => {
  const response = await axios.post("http://localhost:11434/api/chat", {
    model: "llama3",
    messages,
    stream: false,
  });

  return response.data.message.content;
};

export default ollama;
