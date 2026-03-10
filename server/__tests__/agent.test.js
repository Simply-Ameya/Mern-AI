import { vi, describe, it, expect, beforeEach } from "vitest";
import { runAgent } from "../agent/agent.js";

vi.mock("../config/llm.js", () => ({
  default: vi.fn(),
}));

import llm from "../config/llm.js";

describe("runAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns joke when llm returns valid JSON with joke and punchline", async () => {
    llm.mockResolvedValue(
      '{"joke": "Why did the AI go to school?", "punchline": "To improve its learning rate!"}',
    );
    const result = await runAgent("Tell me a joke");
    expect(result).toBe(
      "Why did the AI go to school?\nTo improve its learning rate!",
    );
  });

  it("returns only joke when punchline is null", async () => {
    llm.mockResolvedValue(
      '{"joke": "Why did the AI go to school?", "punchline": null}',
    );
    const result = await runAgent("Tell me a joke");
    expect(result).toBe("Why did the AI go to school?");
  });

  it("returns raw content when JSON parsing fails", async () => {
    llm.mockResolvedValue("this is not valid json at all");
    const result = await runAgent("Tell me a joke");
    expect(result).toBe("this is not valid json at all");
  });

  it("returns fallback message when llm throws an error", async () => {
    llm.mockRejectedValue(new Error("Groq API down"));
    const result = await runAgent("Tell me a joke");
    expect(result).toBe(
      "Why did the AI crash? Because it couldn't handle the punchline! 🥁",
    );
  });

  it("returns raw content when response has no JSON brackets", async () => {
    llm.mockResolvedValue("just a plain text response with no brackets");
    const result = await runAgent("Tell me a joke");
    expect(result).toBe("just a plain text response with no brackets");
  });
});
