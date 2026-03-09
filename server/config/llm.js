import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const llm = async (messages) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
  });

  return response.choices[0].message.content;
};

export default llm;
