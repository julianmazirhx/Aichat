import { useState, useRef, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { motion } from "framer-motion";
import Papa from "papaparse";
import { UploadCloud } from "lucide-react";

export default function SuperChatCSVInterface() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi 👋 Upload a CSV or type a cleaning rule." },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const session_id = "123456";
  const quotes = [
    "Success is not final, failure is not fatal — it is the courage to continue that counts.",
    "Dream big. Start small. Act now.",
    "Discipline is the bridge between goals and accomplishment."
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (loading || (!input.trim() && !file)) return;

    setMessages((prev) => [...prev, { role: "user", text: input || "📎 Uploaded CSV file" }]);
    setLoading(true);
    setInput("");

    if (file) {
      const formData = new FormData();
      formData.append("data", file);
      formData.append("session_id", session_id);

      try {
        const res = await fetch("https://mazirhx.app.n8n.cloud/webhook/cold-email-smart-cleaner", {
          method: "POST",
          body: formData,
        });

        const blob = await res.blob();
        const text = await blob.text();
        const parsed = Papa.parse(text, { header: true });
        setCsvData(parsed.data);
        setFileName(file.name);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `📄 [${file.name}](#)`,
            preview: true,
          },
        ]);
      } catch (err) {
        const errText = err?.message || "Unknown error";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `❌ Failed to process file: ${errText}` },
        ]);
      } finally {
        setLoading(false);
        setFile(null);
      }
    } else {
      const body = JSON.stringify({ message: input, session_id });

      try {
        const res = await fetch("https://mazirhx.app.n8n.cloud/webhook/superchat-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        const raw = await res.text();
        let json;

        try {
          json = JSON.parse(raw);
        } catch {
          json = { response: raw };
        }

        const response = json.response || json.text || raw;
        setMessages((prev) => [...prev, { role: "assistant", text: response }]);
      } catch (err) {
        setMessages((prev) => [...prev, { role: "assistant", text: "❌ Server error." }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviewClick = () => setShowPreview(true);

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Minimal Icon Navbar */}
      <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">📁</div>
        <div className="flex space-x-4 text-gray-600">
          <div className="w-5 h-5 rounded bg-gray-300" />
          <div className="w-5 h-5 rounded bg-gray-300" />
          <div className="w-5 h-5 rounded bg-gray-300" />
          <div className="w-5 h-5 rounded bg-gray-300" />
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex flex-col justify-between w-full max-w-3xl mx-auto bg-white shadow rounded overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[80%] whitespace-pre-wrap ${
                  msg.role === "user" ? "bg-blue-100 ml-auto text-right" : "bg-gray-100"
                }`}
                onClick={msg.preview ? handlePreviewClick : undefined}
                style={{ cursor: msg.preview ? "pointer" : "default" }}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="italic text-sm text-gray-400">Uploading...</div>}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t bg-white flex space-x-2 items-center">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button onClick={triggerFileInput} className="p-2 text-gray-600 hover:text-blue-600">
              <UploadCloud className="w-6 h-6" />
            </button>
            <Textarea
              rows={1}
              placeholder="Type a rule or message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={loading}>
              Send
            </Button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="hidden md:block w-1/3 px-4 pt-10">
          {!showPreview && (
            <div className="text-gray-500 italic text-sm">
              <p>{quotes[Math.floor(Math.random() * quotes.length)]}</p>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-white border-l shadow-lg z-10 p-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">📄 {fileName}</h2>
              <div className="space-x-2">
                <Button onClick={() => setShowPreview(false)} variant="outline" className="text-sm">❌ Close</Button>
                <a href="#" download={fileName} className="text-blue-600 text-sm underline">Download</a>
              </div>
            </div>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="border px-2 py-1">#</th>
                    {csvData[0] && Object.keys(csvData[0]).map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1 text-gray-400 text-xs">{idx + 1}</td>
                      {Object.values(row).map((cell, i) => (
                        <td key={i} className="border px-2 py-1 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
