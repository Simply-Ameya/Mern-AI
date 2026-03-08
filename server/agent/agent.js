import ollama from "../config/ollama.js";
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

Rules:

- If a tool is required respond ONLY in JSON format:

{
 "tool": "tool_name",
 "input": "input_value"
}

- After receiving tool results, convert them into a natural language response.
- Do NOT show JSON or tool names to the user.
- Always provide clean and helpful responses.
`;

export const runAgent = async (message) => {
  try {
    const content = await ollama([
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ]);

    // Attempt tool parsing
    try {
      const parsed = JSON.parse(content);

      if (parsed.tool && tools[parsed.tool]) {
        const result = parsed.input
          ? await tools[parsed.tool](parsed.input)
          : await tools[parsed.tool]();

        const finalResponse = await ollama([
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
          {
            role: "assistant",
            content: JSON.stringify(parsed),
          },
          {
            role: "tool",
            content: result,
          },
        ]);

        return finalResponse;
      }
    } catch {}

    return content;
  } catch (error) {
    console.error(error);
    return "Agent error occurred.";
  }
};
