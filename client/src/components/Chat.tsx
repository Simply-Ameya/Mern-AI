import { useState } from "react";
import { sendMessage } from "../api";

type Messages = { role: string; text: string }[];

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Messages>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { role: "user", text: input };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    const reply = await sendMessage(input);

    const agentMessage = { role: "agent", text: reply };

    setMessages((prev) => [...prev, agentMessage]);

    setInput("");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          height: 400,
          overflowY: "auto",
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.role === "user" ? "User" : "Agent"}:</strong> {m.text}
          </div>
        ))}

        {loading && <div>Agent thinking...</div>}
      </div>

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          style={{ flex: 1, padding: 10 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
