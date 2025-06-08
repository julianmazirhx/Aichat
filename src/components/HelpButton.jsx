import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);

  const sendHelpMessage = () => {
    if (message.trim()) {
      // Handle help message logic here
      setMessage('');
    }
  };

  return (
    <>
      {/* Help Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#246BFD] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Help & Support</h3>
                  <p className="text-xs text-gray-500">We're here to help</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 h-64 overflow-y-auto">
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-sm text-gray-700">
                  Hi! 👋 How can I help you today? Feel free to ask about CSV processing, data cleaning, or any other features.
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && sendHelpMessage()}
                />
                <button
                  onClick={sendHelpMessage}
                  className="p-2 bg-[#246BFD] text-white rounded-lg hover:bg-[#1E5AE8] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#246BFD] text-white rounded-full shadow-lg hover:bg-[#1E5AE8] transition-all duration-200 flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </>
  );
}