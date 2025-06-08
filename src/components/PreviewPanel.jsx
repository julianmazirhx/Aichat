import { motion } from 'framer-motion';
import { X, Download, ChevronLeft, GripVertical } from 'lucide-react';
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
      
      // Initialize column widths
      const headers = Object.keys(csvData[0]);
      const initialWidths = {};
      headers.forEach(header => {
        initialWidths[header] = 200; // Default width
      });
      setColumnWidths(initialWidths);
    }
  }, [csvData]);

  // Handle cell editing
  const handleCellEdit = (rowIndex, columnKey, newValue) => {
    const updatedData = [...editableData];
    updatedData[rowIndex][columnKey] = newValue;
    setEditableData(updatedData);
  };

  // Handle column resize start
  const handleResizeStart = (e, columnKey) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(columnKey);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[columnKey];
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Handle column resize move
  const handleResizeMove = (e) => {
    if (!isResizing || !resizingColumn) return;
    
    const deltaX = e.clientX - resizeStartX.current;
    const newWidth = Math.max(100, resizeStartWidth.current + deltaX);
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }));
  };

  // Handle column resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizingColumn(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Handle panel resize start
  const handlePanelResizeStart = (e) => {
    e.preventDefault();
    setIsDraggingPanel(true);
    panelResizeStartX.current = e.clientX;
    panelResizeStartWidth.current = panelWidth;
    
    document.addEventListener('mousemove', handlePanelResizeMove);
    document.addEventListener('mouseup', handlePanelResizeEnd);
  };

  // Handle panel resize move
  const handlePanelResizeMove = (e) => {
    if (!isDraggingPanel) return;
    
    const deltaX = panelResizeStartX.current - e.clientX;
    const viewportWidth = window.innerWidth;
    const deltaPercent = (deltaX / viewportWidth) * 100;
    const newWidth = Math.min(80, Math.max(30, panelResizeStartWidth.current + deltaPercent));
    
    setPanelWidth(newWidth);
  };

  // Handle panel resize end
  const handlePanelResizeEnd = () => {
    setIsDraggingPanel(false);
    document.removeEventListener('mousemove', handlePanelResizeMove);
    document.removeEventListener('mouseup', handlePanelResizeEnd);
  };

  // Download edited CSV
  const handleDownload = () => {
    const csv = Papa.unparse(editableData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName || 'edited_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const headers = editableData.length > 0 ? Object.keys(editableData[0]) : [];

  return (
    <>
      {/* Overlay for panel resizing */}
      {isDraggingPanel && (
        <div className="fixed inset-0 z-40 cursor-col-resize" />
      )}
      
      <motion.div
        ref={panelRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-2xl z-50 flex"
        style={{ width: `${panelWidth}%` }}
      >
        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex items-center justify-center group transition-colors"
          onMouseDown={handlePanelResizeStart}
        >
          <div className="w-1 h-8 bg-gray-400 group-hover:bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Panel Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">CSV Editor</h2>
                <p className="text-sm text-gray-500">
                  {fileName} • {editableData.length} rows • {headers.length} columns
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
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

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-full">
              <table ref={tableRef} className="w-full border-collapse">
                {/* Header */}
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">
                      #
                    </th>
                    {headers.map((header, index) => (
                      <th
                        key={header}
                        className="relative px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50"
                        style={{ width: columnWidths[header] }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{header}</span>
                        </div>
                        
                        {/* Resize Handle */}
                        <div
                          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-200 flex items-center justify-center group"
                          onMouseDown={(e) => handleResizeStart(e, header)}
                        >
                          <div className="w-0.5 h-4 bg-gray-300 group-hover:bg-blue-500" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="bg-white">
                  {editableData.slice(0, 1000).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 text-sm text-gray-400 font-mono border-b border-r border-gray-200 bg-gray-25">
                        {rowIndex + 1}
                      </td>
                      {headers.map((header) => (
                        <td
                          key={`${rowIndex}-${header}`}
                          className="border-b border-r border-gray-200 p-0"
                          style={{ width: columnWidths[header] }}
                        >
                          <input
                            type="text"
                            value={row[header] || ''}
                            onChange={(e) => handleCellEdit(rowIndex, header, e.target.value)}
                            className="w-full px-4 py-2 text-sm text-gray-900 bg-transparent border-none focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:ring-inset"
                            style={{ minHeight: '36px' }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {editableData.length > 1000 && (
              <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 text-center border-t">
                Showing first 1,000 rows of {editableData.length} total rows
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}