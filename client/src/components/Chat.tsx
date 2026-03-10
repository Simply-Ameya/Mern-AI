import { useState, useRef, useEffect, memo, useCallback } from "react";
import { sendMessage } from "../api";

type Messages = { role: string; text: string; time: string }[];

const Chat = memo(() => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Messages>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    const reply = await sendMessage(input);

    const agentMessage = {
      role: "agent",
      text: "",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, agentMessage]);

    let currentText = "";

    for (let i = 0; i < reply.length; i++) {
      currentText += reply[i];

      await new Promise((r) => setTimeout(r, 15));

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: currentText,
        };
        return updated;
      });
    }

    setInput("");
    setLoading(false);
  }, [input]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="h-full w-full bg-white shadow-lg rounded-xl flex flex-col">
      <div className="px-6 py-4 border-b bg-white sticky top-0 z-10 rounded-t-xl flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">PunchlineAI</h1>
          <p className="text-xs text-gray-500">
            Serious questions, ridiculous answers
          </p>
        </div>

        <div className="text-xs text-gray-400">MERN + Gorq AI</div>
      </div>
      <div
        ref={messagesRef}
        className="h-full overflow-y-auto p-6 space-y-4 border-b"
      >
        {messages.map((m, i) => (
          <div
            data-testid="message-bubble"
            key={i}
            className={`flex items-end gap-2 animate-[fadeIn_0.25s_ease-in] ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "agent" && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                🤖
              </div>
            )}
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                <span>{m.role === "user" ? "User" : "Agent"}</span>
                <span>{m.time}</span>
              </div>
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-4 py-2 rounded-lg text-sm flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:0.2s]">.</span>
              <span className="animate-bounce [animation-delay:0.4s]">.</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 p-4 justify-center">
        <textarea
          ref={textareaRef}
          className="max-w-2xl flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400 resize-none max-h-40"
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);

            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
              textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
});

export default Chat;
