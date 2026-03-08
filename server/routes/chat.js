import express from "express";
import { runAgent } from "../agent/agent.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await runAgent(message);

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Agent failed" });
  }
});

export default router;
