import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ChevronLeft, Maximize2, ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

export default function PreviewPanel({ 
  isOpen, 
  onClose, 
  csvData, 
  fileName 
}) {
  const [editableData, setEditableData] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [panelWidth, setPanelWidth] = useState(50); // percentage
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const tableRef = useRef(null);
  const panelRef = useRef(null);
  const isResizingRef = useRef(false);
  const resizeDataRef = useRef({});
  const panelResizeDataRef = useRef({});

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

  // Reset fullscreen when panel closes
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // Throttled update function for smoother resizing
  const throttledUpdate = useCallback((updateFn, delay = 16) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateFn(...args), delay);
    };
  }, []);

  // Handle cell editing via contentEditable
  const updateCell = useCallback((rowIndex, columnKey, newValue) => {
    setEditableData(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [columnKey]: newValue };
      return updated;
    });
  }, []);

  // Column resize handlers (only for split-screen mode)
  const handleColumnMouseMove = useCallback(throttledUpdate((e) => {
    if (!isResizingRef.current || !resizeDataRef.current.columnKey || isFullscreen) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const deltaX = e.clientX - resizeDataRef.current.startX;
    const newWidth = Math.max(80, resizeDataRef.current.startWidth + deltaX);
    
    setColumnWidths(prev => ({
      ...prev,
      [resizeDataRef.current.columnKey]: newWidth
    }));
  }), [throttledUpdate, isFullscreen]);

  const handleColumnMouseUp = useCallback(() => {
    if (!isResizingRef.current) return;
    
    isResizingRef.current = false;
    resizeDataRef.current = {};
    
    // Clean up event listeners
    document.removeEventListener('mousemove', handleColumnMouseMove);
    document.removeEventListener('mouseup', handleColumnMouseUp);
    
    // Reset cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
  }, [handleColumnMouseMove]);

  const handleResizeStart = useCallback((e, columnKey) => {
    if (isFullscreen) return; // Disable resizing in fullscreen mode
    
    e.preventDefault();
    e.stopPropagation();
    
    if (isResizingRef.current) return; // Prevent multiple resize operations
    
    isResizingRef.current = true;
    resizeDataRef.current = {
      columnKey,
      startX: e.clientX,
      startWidth: columnWidths[columnKey] || 120
    };
    
    // Set cursor and disable text selection
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    
    // Add global event listeners
    document.addEventListener('mousemove', handleColumnMouseMove, { passive: false });
    document.addEventListener('mouseup', handleColumnMouseUp, { passive: false });
  }, [columnWidths, handleColumnMouseMove, handleColumnMouseUp, isFullscreen]);

  // Panel resize handlers (only for split-screen mode)
  const handlePanelMouseMove = useCallback(throttledUpdate((e) => {
    if (!panelResizeDataRef.current.isResizing || isFullscreen) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const deltaX = panelResizeDataRef.current.startX - e.clientX;
    const viewportWidth = window.innerWidth;
    const deltaPercent = (deltaX / viewportWidth) * 100;
    const newWidth = Math.min(80, Math.max(30, panelResizeDataRef.current.startWidth + deltaPercent));
    
    setPanelWidth(newWidth);
  }), [throttledUpdate, isFullscreen]);

  const handlePanelMouseUp = useCallback(() => {
    if (!panelResizeDataRef.current.isResizing) return;
    
    panelResizeDataRef.current = {};
    
    // Clean up event listeners
    document.removeEventListener('mousemove', handlePanelMouseMove);
    document.removeEventListener('mouseup', handlePanelMouseUp);
    
    // Reset cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
  }, [handlePanelMouseMove]);

  const handlePanelResizeStart = useCallback((e) => {
    if (isFullscreen) return; // Disable panel resizing in fullscreen mode
    
    e.preventDefault();
    e.stopPropagation();
    
    if (panelResizeDataRef.current.isResizing) return; // Prevent multiple resize operations
    
    panelResizeDataRef.current = {
      isResizing: true,
      startX: e.clientX,
      startWidth: panelWidth
    };
    
    // Set cursor and disable text selection
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    
    // Add global event listeners
    document.addEventListener('mousemove', handlePanelMouseMove, { passive: false });
    document.addEventListener('mouseup', handlePanelMouseUp, { passive: false });
  }, [panelWidth, handlePanelMouseMove, handlePanelMouseUp, isFullscreen]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      // Clean up any active resize operations
      if (isResizingRef.current) {
        document.removeEventListener('mousemove', handleColumnMouseMove);
        document.removeEventListener('mouseup', handleColumnMouseUp);
      }
      if (panelResizeDataRef.current.isResizing) {
        document.removeEventListener('mousemove', handlePanelMouseMove);
        document.removeEventListener('mouseup', handlePanelMouseUp);
      }
      
      // Reset body styles
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };
  }, [handleColumnMouseMove, handleColumnMouseUp, handlePanelMouseMove, handlePanelMouseUp]);

  // Download edited CSV
  const handleDownload = useCallback(() => {
    try {
      if (!editableData || editableData.length === 0) {
        alert('No data to download');
        return;
      }
      
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
  }, [editableData, fileName]);

  // Handle cell key events
  const handleCellKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.target.blur();
    }
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle close - if fullscreen, go back to split screen, otherwise close completely
  const handleClose = useCallback(() => {
    if (isFullscreen) {
      setIsFullscreen(false);
    } else {
      onClose();
    }
  }, [isFullscreen, onClose]);

  if (!isOpen || !editableData.length) return null;

  const headers = Object.keys(editableData[0]);

  // Fullscreen Mode
  if (isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-white z-50 flex flex-col"
      >
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to split screen"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Split Screen</span>
            </motion.button>
            
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-semibold text-gray-900">CSV Editor - Fullscreen</h1>
              <p className="text-sm text-gray-500">
                {fileName} • {editableData.length} rows • {headers.length} columns
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-[#246BFD] text-white rounded-lg hover:bg-[#1E5AE8] transition-colors shadow-sm"
              title="Download edited CSV"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </motion.button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close editor"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Fullscreen Table */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="min-w-full">
            <table className="w-full border-collapse bg-white">
              {/* Header */}
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="w-16 px-4 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b-2 border-r border-gray-300 bg-gray-100">
                    #
                  </th>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b-2 border-r border-gray-300 bg-gray-100 min-w-[150px]"
                    >
                      <span className="truncate" title={header}>{header}</span>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="bg-white">
                {editableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono border-b border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                      {rowIndex + 1}
                    </td>
                    {headers.map((header) => (
                      <td
                        key={`${rowIndex}-${header}`}
                        className="border-b border-r border-gray-200 p-0 relative group min-w-[150px]"
                      >
                        <div
                          contentEditable
                          suppressContentEditableWarning={true}
                          onBlur={(e) => updateCell(rowIndex, header, e.target.textContent)}
                          onKeyDown={handleCellKeyDown}
                          className="w-full px-4 py-3 text-sm text-gray-900 bg-transparent border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:ring-inset min-h-[44px] cursor-text overflow-hidden"
                          style={{ 
                            minHeight: '44px',
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
          
          {editableData.length > 1000 && (
            <div className="bg-yellow-50 border-t border-yellow-200 px-6 py-4 text-sm text-yellow-800 text-center">
              ⚠️ Showing first 1,000 rows of {editableData.length} total rows for performance
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Split Screen Mode (Original)
  return (
    <>
      {/* Overlay for panel resizing */}
      {panelResizeDataRef.current.isResizing && (
        <div className="fixed inset-0 z-40 cursor-col-resize bg-black bg-opacity-5" />
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
          className="w-2 bg-gray-100 hover:bg-blue-200 cursor-col-resize flex items-center justify-center group transition-all duration-200 border-r border-gray-200 flex-shrink-0"
          onMouseDown={handlePanelResizeStart}
          title="Drag to resize panel"
        >
          <div className="w-1 h-12 bg-gray-400 group-hover:bg-blue-500 rounded-full transition-colors" />
        </div>

        {/* Panel Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={handleClose}
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
                onClick={toggleFullscreen}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Preview fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Fullscreen</span>
              </motion.button>
              
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
                          style={{ 
                            width: columnWidths[header] || 120, 
                            minWidth: columnWidths[header] || 120,
                            maxWidth: columnWidths[header] || 120
                          }}
                        >
                          <div className="flex items-center justify-between pr-2">
                            <span className="truncate" title={header}>{header}</span>
                          </div>
                          
                          {/* Resize Handle */}
                          <div
                            className="absolute top-0 right-0 w-3 h-full cursor-col-resize hover:bg-blue-300 flex items-center justify-center group transition-colors z-20"
                            onMouseDown={(e) => handleResizeStart(e, header)}
                            title="Drag to resize column"
                            style={{ userSelect: 'none' }}
                          >
                            <div className="w-0.5 h-6 bg-gray-400 group-hover:bg-blue-600 transition-colors pointer-events-none" />
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
                            style={{ 
                              width: columnWidths[header] || 120, 
                              minWidth: columnWidths[header] || 120,
                              maxWidth: columnWidths[header] || 120
                            }}
                          >
                            <div
                              contentEditable
                              suppressContentEditableWarning={true}
                              onBlur={(e) => updateCell(rowIndex, header, e.target.textContent)}
                              onKeyDown={handleCellKeyDown}
                              className="w-full px-3 py-2 text-sm text-gray-900 bg-transparent border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:ring-inset min-h-[36px] cursor-text overflow-hidden"
                              style={{ 
                                minHeight: '36px',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                                maxWidth: '100%'
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