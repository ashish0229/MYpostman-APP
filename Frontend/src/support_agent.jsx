import { useState } from "react";

export default function SupportAgent() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  async function askML() {
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });

    const data = await res.json();
    setResponse(data.answer);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">AI Support Agent</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        className="border p-2"
      />

      <button onClick={askML} className="ml-2 bg-blue-500 text-white px-4 py-2">
        Send
      </button>

      <p className="mt-4">Response: {response}</p>
    </div>
  );
}





export default function SupportAgent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Support Agent</h1>
      <p>This is your ML support agent page.</p>
    </div>
  );
}



