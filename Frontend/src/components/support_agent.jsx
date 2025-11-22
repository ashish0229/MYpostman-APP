import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function SupportChat({ currentUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        socket.on("support_reply", (data) => {
            setMessages(prev => [...prev, { sender: "support", text: data.message }]);
        });

        return () => socket.off("support_reply");
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;

        socket.emit("user_message", {
            userId: currentUser.id,
            message: input,
        });

        setMessages(prev => [...prev, { sender: "user", text: input }]);
        setInput("");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-yellow-500 p-4 rounded-full shadow-lg text-white font-bold"
            >
                💬
            </button>

            {isOpen && (
                <div className="w-80 bg-white shadow-xl rounded-xl p-4 mt-3 border">
                    <h2 className="font-bold text-lg mb-2">Support Chat</h2>

                    <div className="h-64 overflow-y-auto border p-2 rounded-lg">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`my-2 p-2 rounded-lg w-fit ${
                                    msg.sender === "user"
                                        ? "bg-yellow-200 ml-auto"
                                        : "bg-gray-200"
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="flex mt-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-2 border rounded-lg"
                            placeholder="Type a message..."
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-2 bg-yellow-500 px-4 py-2 rounded-lg text-white font-bold"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
