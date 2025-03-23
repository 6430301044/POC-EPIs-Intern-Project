import React, { useState, useEffect } from 'react';
import API_BASE_URL from '@/config/apiConfig';

interface DataPreviewReferenceProps {
  uploadId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Column {
  COLUMN_NAME: string;
  DATA_TYPE: string;
}

interface FileInfo {
  filename: string;
  upload_date: string;
  period_id: string;
  total_rows: number;
}

interface PreviewData {
  columns: Column[];
  rows: any[];
  totalRows: number;
  fileInfo: FileInfo;
}

const DataPreviewReference: React.FC<DataPreviewReferenceProps> = ({ uploadId, isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  useEffect(() => {
    if (isOpen && uploadId) {
      fetchPreviewData(uploadId);
    } else {
      setPreviewData(null);
    }
  }, [isOpen, uploadId]);

  const fetchPreviewData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/upload/reference-preview/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // ส่ง cookies ไปด้วย
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch preview data');
      }

      const data = await response.json();
      if (data.success) {
        setPreviewData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch preview data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching preview data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Data Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded text-red-600 dark:text-red-400">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              {/* File Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h3 className="font-medium mb-2">File Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Filename</p>
                    <p className="font-medium">{previewData.fileInfo.filename}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload Date</p>
                    <p className="font-medium">{formatDate(previewData.fileInfo.upload_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Rows</p>
                    <p className="font-medium">{previewData.totalRows}</p>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {previewData.columns.map((column) => (
                        <th
                          key={column.COLUMN_NAME}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {column.COLUMN_NAME}
                          <span className="text-xs text-gray-400 ml-1">({column.DATA_TYPE})</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {previewData.columns.map((column) => (
                          <td
                            key={`${rowIndex}-${column.COLUMN_NAME}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                          >
                            {row[column.COLUMN_NAME] !== null && row[column.COLUMN_NAME] !== undefined ? row[column.COLUMN_NAME].toString() : row[column.COLUMN_NAME] === null ? 'null' : 'undefined'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {previewData.totalRows > rowsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {Math.min(rowsPerPage, previewData.rows.length)} of {previewData.totalRows} rows
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage * rowsPerPage >= previewData.totalRows}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              No preview data available
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPreviewReference;