import { ChevronDown, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopNavbar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">SuperChat AI</h1>
        <p className="text-sm text-gray-500">Intelligent CSV Processing</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">1,000</span>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#246BFD] to-[#1E5AE8] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </div>
    </div>
  );
}