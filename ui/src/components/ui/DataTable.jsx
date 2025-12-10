import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Filter, Download, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

const DataTable = ({ 
  data = [], 
  columns = [], 
  searchable = true,
  filterable = true,
  exportable = true,
  selectable = false,
  onRowClick,
  className 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleColumnVisibility = (columnKey) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.key));

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border', className)}>
      {/* Table Controls */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Column Visibility Toggle */}
            <div className="relative group">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Eye className="h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {columns.map(column => (
                  <label key={column.key} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.has(column.key)}
                      onChange={() => toggleColumnVisibility(column.key)}
                      className="rounded"
                    />
                    <span className="text-sm">{column.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {exportable && (
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(paginatedData.map((_, i) => i)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    className="rounded"
                  />
                </th>
              )}
              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp className={cn(
                          'h-3 w-3',
                          sortConfig.key === column.key && sortConfig.direction === 'asc'
                            ? 'text-blue-600' : 'text-gray-400'
                        )} />
                        <ChevronDown className={cn(
                          'h-3 w-3 -mt-1',
                          sortConfig.key === column.key && sortConfig.direction === 'desc'
                            ? 'text-blue-600' : 'text-gray-400'
                        )} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'hover:bg-gray-50 transition-colors cursor-pointer',
                    selectedRows.has(index) && 'bg-blue-50'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedRows);
                          if (e.target.checked) {
                            newSelected.add(index);
                          } else {
                            newSelected.delete(index);
                          }
                          setSelectedRows(newSelected);
                        }}
                        className="rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * itemsPerPage >= sortedData.length}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;