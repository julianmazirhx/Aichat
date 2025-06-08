import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const quotes = [
  "Success is not final, failure is not fatal — it is the courage to continue that counts.",
  "Dream big. Start small. Act now.",
  "Discipline is the bridge between goals and accomplishment.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Innovation distinguishes between a leader and a follower.",
  "Your limitation—it's only your imagination."
];

export default function QuotePanel() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-[#246BFD] rounded-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Daily Inspiration</h3>
          <p className="text-gray-600 text-sm leading-relaxed italic">
            "{randomQuote}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}