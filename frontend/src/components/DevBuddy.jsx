
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DevBuddy() {
    const location = useLocation();
    const { token, isLoggedIn } = useAuth();
// const [chatState, setChatState] = useState({isOpen: false, isExpanded: false, input: "", loading: false, error: "",
//   messages: [
//         {
//             role: "assistant",
//             content:
//                 "Hey! I'm DevBuddy, your DEV@Deakin assistant. Ask me anything about the website or start a conversation!"
//         }
//     ]
// });
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hey! I'm DevBuddy, your DEV@Deakin assistant. Ask me anything about the website or start a conversation!"
        }
    ]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading, isOpen]);

    const sendMessage = async (e) => {
        e.preventDefault();

        const question = input.trim();

        if (!question || loading) return;

        if (!isLoggedIn || !token) {
            setError("Please log in to use DevBuddy.");
            return;
        }

        const history = messages
            .slice(-6)
            .map((item) => ({
                role: item.role,
                content: item.content.slice(0, 700)
            }));

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: question
            }
        ]);

        setInput("");
        setError("");
        setLoading(true);

        try {
            const API_URL = (
                import.meta.env.VITE_API_URL ||
                "http://localhost:3000"
            ).replace(/\/+$/, "");

            const response = await fetch(
                `${API_URL}/ai/devbuddy`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message: question,
                        history,
                        currentPage: location.pathname
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to get a response."
                );
            }

            if (!data.result) {
                throw new Error(
                    "DevBuddy returned an empty response."
                );
            }
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.result
                }
            ]);

        } catch (err) {
            console.error("DevBuddy error:", err);

            setError(
                err.message || "Unable to connect to DevBuddy."
            );

            setMessages((prev) => prev.slice(0, -1));
            setInput(question);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">

            {/* FLOATING BUTTON */}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl text-white shadow-xl transition hover:scale-105 hover:bg-blue-700"
                aria-label="Open DevBuddy"
            >
                {isOpen ? "×" : "🤖"}
            </button>

            {/* CHAT WINDOW */}

            {isOpen && (
                <div
                    className={`fixed z-[9999] flex flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl transition-all duration-300 ${
                        isExpanded
                            ? "bottom-6 right-6 h-[calc(100vh-120px)] w-[min(850px,calc(100vw-48px))] rounded-2xl"
                            : "bottom-24 right-6 h-[520px] w-[360px] max-w-[calc(100vw-32px)] rounded-2xl"
                    }`}
                >

                    {/* HEADER */}

                    <div className="flex shrink-0 items-center justify-between bg-blue-600 px-5 py-4 text-white">

                        <div>
                            <h2 className="text-lg font-bold">
                                DevBuddy
                            </h2>

                            <p className="text-xs text-blue-100">
                                Your DEV@Deakin assistant
                            </p>
                        </div>

                        <div className="flex items-center gap-3">

                            {/* EXPAND / MINIMISE */}

                            <button
                                type="button"
                                onClick={() =>
                                    setIsExpanded(!isExpanded)
                                }
                                className="rounded-lg px-2 py-1 text-xl transition hover:bg-blue-500"
                                aria-label={
                                    isExpanded
                                        ? "Minimise chat"
                                        : "Expand chat"
                                }
                                title={
                                    isExpanded
                                        ? "Minimise"
                                        : "Expand"
                                }
                            >
                                {isExpanded ? "⊖" : "⛶"}
                            </button>

                            {/* CLOSE */}

                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsExpanded(false);
                                }}
                                className="text-2xl hover:text-blue-200"
                                aria-label="Close chat"
                            >
                                ×
                            </button>

                        </div>
                    </div>

                    {/* MESSAGES */}

                    <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                                        message.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "border border-gray-200 bg-white text-gray-800"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="text-sm text-gray-500">
                                DevBuddy is thinking...
                            </div>
                        )}

                        <div ref={messagesEndRef} />

                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="shrink-0 bg-red-50 px-4 py-2 text-xs text-red-600">
                            {error}
                        </div>
                    )}

                    {/* INPUT */}

                    <form
                        onSubmit={sendMessage}
                        className="flex shrink-0 gap-2 border-t border-gray-200 bg-white p-3"
                    >

                        <input
                            type="text"
                            value={input}
                            onChange={(e) =>
                                setInput(e.target.value)
                            }
                            placeholder="Ask DevBuddy anything..."
                            maxLength={700}
                            disabled={loading || !isLoggedIn}
                            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 disabled:bg-gray-100"
                        />

                        <button
                            type="submit"
                            disabled={
                                !input.trim() ||
                                loading ||
                                !isLoggedIn
                            }
                            className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "..." : "Send"}
                        </button>

                    </form>

                    {/* FOOTER */}

                    <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-2 text-center text-[10px] text-gray-400">
                        Powered by Gemini AI · DEV@Deakin
                    </div>

                </div>
            )}
        </div>
    );
}

export default DevBuddy;
