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
Use for math calculations.

2. getWeather(city)
Use for weather information.

3. getCurrentTime()
Use for current time.

Rules:

1. If the user asks something that requires a tool, respond ONLY in JSON:

{
 "tool": "tool_name",
 "input": "input_value"
}

2. After receiving the tool result, use it to generate a helpful natural language answer.

Example:

User: What is the weather in Mumbai?

Assistant calls tool:
{
 "tool": "getWeather",
 "input": "Mumbai"
}

Tool returns:
{ "city": "Mumbai", "temperature": "28°C", "condition": "Partly Cloudy" }

Final response:
The weather in Mumbai! According to my weather tool, the current weather in Mumbai is:
{ "city": "Mumbai", "temperature": "28°C", "condition": "Partly Cloudy" }

Always explain the tool result clearly to the user.
`;

export const runAgent = async (message) => {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    while (true) {
      const content = await ollama(messages);

      let parsed;

      try {
        parsed = JSON.parse(content);
      } catch {
        return content;
      }

      if (parsed.tool && tools[parsed.tool]) {
        const result = parsed.input
          ? await tools[parsed.tool](parsed.input)
          : await tools[parsed.tool]();

        // assistant tool call
        messages.push({
          role: "assistant",
          content: JSON.stringify(parsed),
        });

        // tool result
        messages.push({
          role: "tool",
          content: typeof result === "string" ? result : JSON.stringify(result),
        });

        continue;
      }

      return content;
    }
  } catch (error) {
    console.error(error);
    return "Agent error occurred.";
  }
};
