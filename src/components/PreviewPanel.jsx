import { motion } from 'framer-motion';
import { X, Download, ChevronLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';

export default function PreviewPanel({ 
  isOpen, 
  onClose, 
  csvData, 
  fileName 
}) {
  const [editableData, setEditableData] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);
  const [panelWidth, setPanelWidth] = useState(50); // percentage
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  
  const tableRef = useRef(null);
  const panelRef = useRef(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const panelResizeStartX = useRef(0);
  const panelResizeStartWidth = useRef(0);

  // Initialize editable data and column widths
  useEffect(() => {
    if (csvData && csvData.length > 0) {
      setEditableData([...csvData]);
      
      // Initialize column widths based on content
      const headers = Object.keys(csvData[0]);
      const initialWidths = {};
      headers.forEach(header => {
        // Calculate initial width based on header length and sample content
        const headerLength = header.length;
        const sampleContent = csvData.slice(0, 5).map(row => (row[header] || '').toString().length);
        const maxContentLength = Math.max(...sampleContent, headerLength);
        const calculatedWidth = Math.min(Math.max(maxContentLength * 8 + 40, 120), 300);
        initialWidths[header] = calculatedWidth;
      });
      setColumnWidths(initialWidths);
    }
  }, [csvData]);

  // Handle cell editing via contentEditable
  const updateCell = (rowIndex, columnKey, newValue) => {
    const updatedData = [...editableData];
    updatedData[rowIndex][columnKey] = newValue;
    setEditableData(updatedData);
  };

  // Handle column resize start
  const handleResizeStart = (e, columnKey) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizingColumn(columnKey);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[columnKey];
    
    // Add global event listeners
    const handleMouseMove = (e) => {
      if (!isResizing || !resizingColumn) return;
      
      const deltaX = e.clientX - resizeStartX.current;
      const newWidth = Math.max(80, resizeStartWidth.current + deltaX);
      
      setColumnWidths(prev => ({
        ...prev,
        [columnKey]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Handle panel resize start
  const handlePanelResizeStart = (e) => {
    e.preventDefault();
    setIsDraggingPanel(true);
    panelResizeStartX.current = e.clientX;
    panelResizeStartWidth.current = panelWidth;
    
    const handleMouseMove = (e) => {
      if (!isDraggingPanel) return;
      
      const deltaX = panelResizeStartX.current - e.clientX;
      const viewportWidth = window.innerWidth;
      const deltaPercent = (deltaX / viewportWidth) * 100;
      const newWidth = Math.min(80, Math.max(30, panelResizeStartWidth.current + deltaPercent));
      
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingPanel(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Download edited CSV
  const handleDownload = () => {
    try {
      const csv = Papa.unparse(editableData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName ? fileName.replace(/\.[^/.]+$/, '_edited.csv') : 'edited_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error downloading file. Please try again.');
      console.error('Download error:', error);
    }
  };

  if (!isOpen || !editableData.length) return null;

  const headers = Object.keys(editableData[0]);

  return (
    <>
      {/* Overlay for panel resizing */}
      {isDraggingPanel && (
        <div className="fixed inset-0 z-40 cursor-col-resize bg-black bg-opacity-10" />
      )}
      
      <motion.div
        ref={panelRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 right-0 h-full bg-white border-l-2 border-gray-300 shadow-2xl z-50 flex"
        style={{ width: `${panelWidth}%` }}
      >
        {/* Resize Handle */}
        <div
          className="w-2 bg-gray-100 hover:bg-blue-200 cursor-col-resize flex items-center justify-center group transition-all duration-200 border-r border-gray-200"
          onMouseDown={handlePanelResizeStart}
          title="Drag to resize panel"
        >
          <div className="w-1 h-12 bg-gray-400 group-hover:bg-blue-500 rounded-full transition-colors" />
        </div>

        {/* Panel Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Close preview"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">CSV Editor</h2>
                <p className="text-sm text-gray-500 truncate">
                  {fileName} • {editableData.length} rows • {headers.length} columns
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-[#246BFD] text-white rounded-lg hover:bg-[#1E5AE8] transition-colors shadow-sm"
                title="Download edited CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </motion.button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {editableData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No data to display</p>
                  <p className="text-gray-400 text-sm">Upload a CSV file to get started</p>
                </div>
              </div>
            ) : (
              <div className="min-w-full">
                <table ref={tableRef} className="w-full border-collapse bg-white">
                  {/* Header */}
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b-2 border-r border-gray-300 bg-gray-100">
                        #
                      </th>
                      {headers.map((header) => (
                        <th
                          key={header}
                          className="relative px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b-2 border-r border-gray-300 bg-gray-100 select-none"
                          style={{ width: columnWidths[header], minWidth: columnWidths[header] }}
                        >
                          <div className="flex items-center justify-between pr-2">
                            <span className="truncate" title={header}>{header}</span>
                          </div>
                          
                          {/* Resize Handle */}
                          <div
                            className="absolute top-0 right-0 w-3 h-full cursor-col-resize hover:bg-blue-300 flex items-center justify-center group transition-colors"
                            onMouseDown={(e) => handleResizeStart(e, header)}
                            title="Drag to resize column"
                          >
                            <div className="w-0.5 h-6 bg-gray-400 group-hover:bg-blue-600 transition-colors" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody className="bg-white">
                    {editableData.slice(0, 1000).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-blue-50 transition-colors">
                        <td className="px-3 py-2 text-sm text-gray-500 font-mono border-b border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                          {rowIndex + 1}
                        </td>
                        {headers.map((header) => (
                          <td
                            key={`${rowIndex}-${header}`}
                            className="border-b border-r border-gray-200 p-0 relative group"
                            style={{ width: columnWidths[header], minWidth: columnWidths[header] }}
                          >
                            <div
                              contentEditable
                              suppressContentEditableWarning={true}
                              onBlur={(e) => updateCell(rowIndex, header, e.target.textContent)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.target.blur();
                                }
                              }}
                              className="w-full px-3 py-2 text-sm text-gray-900 bg-transparent border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:ring-inset min-h-[36px] cursor-text"
                              style={{ 
                                minHeight: '36px',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}
                              title={`Edit ${header} for row ${rowIndex + 1}`}
                            >
                              {row[header] || ''}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {editableData.length > 1000 && (
              <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-3 text-sm text-yellow-800 text-center">
                ⚠️ Showing first 1,000 rows of {editableData.length} total rows for performance
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}