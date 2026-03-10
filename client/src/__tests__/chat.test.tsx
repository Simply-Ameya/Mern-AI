import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import Chat from "../components/Chat";
import { sendMessage } from "../api";

vi.mock("../api", () => ({
  sendMessage: vi.fn(),
}));

const mockSendMessage = sendMessage as ReturnType<typeof vi.fn>;

describe("Chat Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the chat header correctly", () => {
    render(<Chat />);
    expect(screen.getByText("PunchlineAI")).toBeInTheDocument();
  });

  it("renders the subtitle correctly", () => {
    render(<Chat />);
    expect(
      screen.getByText("Serious questions, ridiculous answers"),
    ).toBeInTheDocument();
  });

  it("renders the Send button", () => {
    render(<Chat />);
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("renders the textarea input", () => {
    render(<Chat />);
    expect(screen.getByPlaceholderText("Ask something...")).toBeInTheDocument();
  });

  it("renders with no messages initially", () => {
    render(<Chat />);
    expect(screen.queryByTestId("message-bubble")).not.toBeInTheDocument();
  });

  it("updates input value when typing", async () => {
    render(<Chat />);
    const textArea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textArea, "Hello");
    expect(textArea).toHaveValue("Hello");
  });

  it("Send button is disabled when input is empty", () => {
    render(<Chat />);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
  });

  it("Send button is enabled when input has text", async () => {
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Hello!");
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeEnabled();
  });

  it("Send button is disabled when input is only whitespace", async () => {
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "   ");
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
  });

  it("displays user message after sending", async () => {
    mockSendMessage.mockResolvedValue("Why did the AI cross the road?");
    render(<Chat />);

    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Tell me a joke");
    const button = screen.getByRole("button", { name: /send/i });
    await userEvent.click(button);

    const bubbles = screen.getAllByTestId("message-bubble");
    expect(bubbles[0]).toHaveTextContent("Tell me a joke");
  });

  it("clears input after sending", async () => {
    mockSendMessage.mockResolvedValue("Why did the AI cross the road?");
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Tell me a joke");
    const button = screen.getByRole("button", { name: /send/i });
    await userEvent.click(button);
    await waitFor(() => expect(textarea).toHaveValue(""));
  });

  it("shows loading dots while waiting for response", async () => {
    mockSendMessage.mockImplementation(
      () => new Promise((r) => setTimeout(() => r("Joke!"), 500)),
    );
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Tell me a joke");
    const button = screen.getByRole("button", { name: /send/i });
    await userEvent.click(button);
    expect(document.querySelector(".animate-bounce")).toBeInTheDocument();
  });

  it("disables Send button while loading", async () => {
    mockSendMessage.mockImplementation(
      () => new Promise((r) => setTimeout(() => r("Joke!"), 500)),
    );
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Tell me a joke");
    const button = screen.getByRole("button", { name: /send/i });
    await userEvent.click(button);
    expect(button).toBeDisabled();
  });

  it("displays agent response after receiving reply", async () => {
    mockSendMessage.mockResolvedValue("Because it had no cache!");
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Tell me a joke");
    const button = screen.getByRole("button", { name: /send/i });
    await userEvent.click(button);
    await waitFor(
      () => {
        const bubbles = screen.getAllByTestId("message-bubble");
        expect(bubbles[1]).toHaveTextContent("Because it had no cache!");
      },
      { timeout: 5000 },
    );
  });

  it("sends message on Enter key press", async () => {
    mockSendMessage.mockResolvedValue("Joke response!");
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Hello{Enter}");
    expect(mockSendMessage).toHaveBeenCalledWith("Hello");
  });

  it("does NOT send message on Shift+Enter", async () => {
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Hello{Shift>}{Enter}{/Shift}");
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("does not send empty message on Enter", async () => {
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "{Enter}");
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("displays multiple user messages in order", async () => {
    mockSendMessage.mockResolvedValue("Ha!");
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");

    await userEvent.type(textarea, "First joke");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() => expect(textarea).toHaveValue(""));

    await userEvent.type(textarea, "Second joke");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() => expect(textarea).toHaveValue(""));

    const bubbles = screen.getAllByTestId("message-bubble");
    expect(bubbles[0]).toHaveTextContent("First joke");
    expect(bubbles[2]).toHaveTextContent("Second joke");
  });

  it("shows user avatar for user messages", async () => {
    mockSendMessage.mockResolvedValue("Joke!");
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(screen.getByText("👤")).toBeInTheDocument();
  });

  it("shows agent avatar for agent messages", async () => {
    mockSendMessage.mockResolvedValue("Joke!");
    render(<Chat />);
    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() => expect(screen.getByText("🤖")).toBeInTheDocument(), {
      timeout: 5000,
    });
  });

  it("does not scroll when messagesRef is null", () => {
    const { unmount } = render(<Chat />);
    unmount();
  });

  it("scrolls to bottom when new message is added", async () => {
    mockSendMessage.mockResolvedValue("Joke!");
    render(<Chat />);

    const scrollToSpy = vi.spyOn(window.HTMLElement.prototype, "scrollTo");

    const textarea = screen.getByPlaceholderText("Ask something...");
    await userEvent.type(textarea, "Hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: "smooth",
      });
    });

    scrollToSpy.mockRestore();
  });
});
