import React from "react";
import { motion } from "framer-motion";

export default function Table({ 
  columns, 
  data, 
  loading = false, 
  onRowClick,
  emptyMessage = "No data available",
  emptyIcon = "📋"
}) {
  const LoadingSkeleton = ({ rows = 5 }) => (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {columns.map((col, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  const EmptyState = () => (
    <tr>
      <td colSpan={columns.length} className="px-4 py-12 text-center">
        <div className="text-gray-500">
          <div className="text-4xl mb-2">{emptyIcon}</div>
          <div className="text-lg font-medium mb-1">No data found</div>
          <div className="text-sm">{emptyMessage}</div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'right' ? 'text-right' : 
                    column.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <LoadingSkeleton />
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <motion.tr
                  key={row.id || rowIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 py-3 text-sm ${
                        column.align === 'right' ? 'text-right' : 
                        column.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <EmptyState />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}