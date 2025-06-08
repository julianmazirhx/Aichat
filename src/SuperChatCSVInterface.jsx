import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Papa from "papaparse";

// Components
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import ChatPanel from "./components/ChatPanel";
import PreviewPanel from "./components/PreviewPanel";
import QuotePanel from "./components/QuotePanel";
import HelpButton from "./components/HelpButton";

export default function SuperChatCSVInterface() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi 👋 Welcome to SuperChat AI! Upload a CSV file or type a cleaning rule to get started." },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const session_id = "123456";

  // Validate CSV file before processing
  const validateCSVFile = (file) => {
    // Check if it's a valid File object
    if (!(file instanceof File)) {
      alert("❌ Please upload a valid CSV file");
      return false;
    }

    // Check if filename ends with .csv
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert("❌ Please upload a valid CSV file");
      return false;
    }

    // Check if file has content
    if (file.size === 0) {
      alert("❌ The uploaded file is empty. Please upload a valid CSV file");
      return false;
    }

    return true;
  };

  const sendMessage = async () => {
    if (loading || (!input.trim() && !file)) return;

    setMessages((prev) => [...prev, { role: "user", text: input || "📎 Uploaded CSV file" }]);
    setLoading(true);
    setInput("");

    if (file) {
      // Validate the file before processing
      if (!validateCSVFile(file)) {
        setLoading(false);
        setFile(null);
        return;
      }

      const formData = new FormData();
      formData.append("data", file);
      formData.append("session_id", session_id);

      try {
        const res = await fetch("https://mazirhx.app.n8n.cloud/webhook/cold-email-smart-cleaner", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const blob = await res.blob();
        const text = await blob.text();
        const parsed = Papa.parse(text, { header: true });
        setCsvData(parsed.data);
        setFileName(file.name);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `📄 ${file.name} - Successfully processed!`,
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
        setMessages((prev) => [...prev, { role: "assistant", text: "❌ Server error. Please try again." }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviewClick = () => setShowPreview(true);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 p-6">
            <ChatPanel
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              loading={loading}
              file={file}
              setFile={setFile}
              onPreviewClick={handlePreviewClick}
            />
          </div>

          {/* Right Panel - Only show when preview is hidden */}
          {!showPreview && (
            <div className="w-80 p-6 space-y-6">
              <QuotePanel />
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <AnimatePresence>
        <PreviewPanel
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          csvData={csvData}
          fileName={fileName}
        />
      </AnimatePresence>

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}