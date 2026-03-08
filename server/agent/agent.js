import openai from "../config/openai.js";
import { calculate, getWeather, getCurrentTime } from "./tools.js";

const tools = {
  calculate,
  getWeather,
  getCurrentTime,
};

const systemPrompt = `
You are an AI developer assistant.

You have access to the following tools:

1. calculate(expression)
Use this for math calculations.

2. getWeather(city)
Use this to get weather information.

3. getCurrentTime()
Use this when user asks for time.

If a tool is required respond ONLY in JSON format:

{
 "tool": "tool_name",
 "input": "input_value"
}

Otherwise respond normally.
`;

export const runAgent = async (message) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const content = response.choices[0].message.content;

    // Attempt tool parsing
    try {
      const parsed = JSON.parse(content);

      if (parsed.tool && tools[parsed.tool]) {
        const result = await tools[parsed.tool](parsed.input);

        return result;
      }
    } catch {
      // Not a tool call
    }

    return content;
  } catch (error) {
    console.error(error);
    return "Agent error occurred.";
  }
};
