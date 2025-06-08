import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, FileText } from 'lucide-react';

export default function ChatPanel({ 
  messages, 
  input, 
  setInput, 
  sendMessage, 
  loading, 
  file, 
  setFile, 
  onPreviewClick 
}) {
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Additional validation in the UI
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        alert("❌ Please upload a valid CSV file");
        e.target.value = ''; // Clear the input
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#246BFD] text-white'
                    : 'bg-gray-50 text-gray-800'
                } ${msg.preview ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                onClick={msg.preview ? onPreviewClick : undefined}
              >
                {msg.preview ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-50 p-4 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-end space-x-3">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={triggerFileInput}
            className="p-3 text-gray-500 hover:text-[#246BFD] hover:bg-blue-50 rounded-xl transition-all duration-200"
            title="Upload CSV file"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>

          <div className="flex-1 relative">
            <textarea
              rows={1}
              placeholder="Type a message or upload a CSV file..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full p-4 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all duration-200"
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={loading || (!input.trim() && !file)}
            className="p-4 bg-[#246BFD] text-white rounded-xl hover:bg-[#1E5AE8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#246BFD]" />
              <span className="text-sm text-gray-700">{file.name}</span>
              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold"
            >
              ×
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}