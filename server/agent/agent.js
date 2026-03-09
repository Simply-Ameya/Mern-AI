import llm from "../config/llm.js";
import { calculate, getWeather, getCurrentTime } from "./tools.js";

const tools = {
  calculate,
  getWeather,
  getCurrentTime,
};

const systemPrompt = `
You are an AI developer assistant.

You have access to these tools:

1. calculate(expression)
2. getWeather(city)
3. getCurrentTime()

RULES:

1. If a calculation is requested, you MUST use the calculate tool.
Never compute math yourself.

2. If a tool is required, respond ONLY with valid JSON:

{
 "tool": "tool_name",
 "input": "tool_input"
}

Do NOT include explanations or results with the tool call.

3. If no tool is needed, respond normally in natural language.

4. After receiving the tool result, generate a helpful natural language answer for the user.
`;

export const runAgent = async (message) => {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    while (true) {
      const content = await llm(messages);

      let parsed = null;

      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        try {
          const jsonString = content.slice(jsonStart, jsonEnd + 1);
          parsed = JSON.parse(jsonString);
        } catch {}
      }

      if (!parsed) {
        return content;
      }

      if (parsed.tool && tools[parsed.tool]) {
        const result = parsed.input
          ? await tools[parsed.tool](parsed.input)
          : await tools[parsed.tool]();

        // Save the tool call
        messages.push({
          role: "assistant",
          content: JSON.stringify(parsed),
        });

        // Provide tool result clearly
        messages.push({
          role: "system",
          content: `The tool "${parsed.tool}" returned the following result:

${JSON.stringify(result)}

Use this information to generate the final answer for the user.
Do NOT call a tool again. Do NOT return JSON.`,
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
