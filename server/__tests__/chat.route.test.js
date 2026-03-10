import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../server.js";

vi.mock("../agent/agent.js", () => ({
  runAgent: vi.fn(),
}));

import { runAgent } from "../agent/agent.js";

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a reply when message is sent", async () => {
    runAgent.mockResolvedValue("Why did the AI go to school?");
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Tell me a joke" });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe("Why did the AI go to school?");
  });

  it("returns 500 when agent throws an error", async () => {
    runAgent.mockRejectedValue(new Error("Agent crashed"));
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Tell me a joke" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Agent failed");
  });
});
