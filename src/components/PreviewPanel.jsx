import { motion } from 'framer-motion';
import { X, Download, ChevronLeft } from 'lucide-react';

export default function PreviewPanel({ 
  isOpen, 
  onClose, 
  csvData, 
  fileName 
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 right-0 w-full md:w-2/3 lg:w-1/2 h-full bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">CSV Preview</h2>
            <p className="text-sm text-gray-500">{fileName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#246BFD] text-white rounded-lg hover:bg-[#1E5AE8] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </motion.button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    #
                  </th>
                  {csvData[0] && Object.keys(csvData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvData.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                      {idx + 1}
                    </td>
                    {Object.values(row).map((cell, i) => (
                      <td
                        key={i}
                        className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate"
                        title={cell}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {csvData.length > 100 && (
            <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 text-center">
              Showing first 100 rows of {csvData.length} total rows
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}