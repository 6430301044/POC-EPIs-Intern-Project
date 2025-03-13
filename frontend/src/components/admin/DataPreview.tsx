import React, { useState, useEffect } from "react";
import Table from "@/components/main/Table";
import { Container } from "../template/Container";
import { SectionTitle } from "../template/SectionTitle";

interface DataPreviewProps {
  file: File | null;
  maxRows?: number; // Maximum number of rows to display in preview
}

interface PreviewData {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

/**
 * DataPreview component - Displays a preview of data from uploaded CSV or Excel files
 * Shows column headers and a configurable number of rows in a table format
 */
const DataPreview: React.FC<DataPreviewProps> = ({ file, maxRows = 10 }) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = maxRows;

  useEffect(() => {
    if (file) {
      parseFile(file);
    } else {
      setPreviewData(null);
    }
  }, [file]);

  /**
   * Parse the uploaded file based on its type
   * @param file The file to parse
   */
  const parseFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        await parseCSV(file);
      } else if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        await parseExcel(file);
      } else {
        throw new Error(
          "Unsupported file type. Please upload a CSV or Excel file."
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse file");
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Parse CSV file content
   * @param file CSV file to parse
   */
  const parseCSV = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          if (!content) {
            throw new Error("Failed to read file content");
          }

          // Split content by lines and handle different line endings
          const lines = content.split(/\r?\n/);
          if (lines.length === 0) {
            throw new Error("File is empty");
          }

          // Parse headers (first line)
          const headers = lines[0].split(",").map((header) => header.trim());

          // Parse data rows
          const rows = lines
            .slice(1)
            .filter((line) => line.trim() !== "") // Skip empty lines
            .map((line) => line.split(",").map((cell) => cell.trim()));

          setPreviewData({
            headers,
            rows: rows.slice(0, rowsPerPage),
            totalRows: rows.length,
          });

          resolve();
        } catch (err: any) {
          reject(err);
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsText(file);
    });
  };

  /**
   * Parse Excel file content
   * @param file Excel file to parse
   */
  const parseExcel = async (file: File): Promise<void> => {
    try {
      // We need to use a library like xlsx for parsing Excel files
      // Since we can't directly import it here, we'll use a placeholder
      // In a real implementation, you would use the xlsx library

      // Placeholder implementation - in production, replace with actual Excel parsing
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            // This is a placeholder - in production code, use xlsx library to parse the file
            // For example:
            // const data = new Uint8Array(e.target.result as ArrayBuffer);
            // const workbook = XLSX.read(data, { type: 'array' });
            // const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            // const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Placeholder data for preview
            const headers = ["Column A", "Column B", "Column C"];
            const rows = [
              ["Data 1", "Data 2", "Data 3"],
              ["Data 4", "Data 5", "Data 6"],
              ["Data 7", "Data 8", "Data 9"],
            ];

            setPreviewData({
              headers,
              rows,
              totalRows: rows.length,
            });

            resolve();
          } catch (err: any) {
            reject(err);
          }
        };

        reader.onerror = () => {
          reject(new Error("Error reading Excel file"));
        };

        reader.readAsArrayBuffer(file);
      });
    } catch (err: any) {
      throw new Error(`Failed to parse Excel file: ${err.message}`);
    }
  };

  /**
   * Handle pagination - change current page
   * @param page Page number to display
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real implementation, you would slice the data based on the current page
    // For now, we're just using the first page of data
  };

  if (loading) {
    return (
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading preview...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
        <h3 className="font-bold">Error Previewing File</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!file || !previewData) {
    return (
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Upload a file to preview its contents
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(previewData.totalRows / rowsPerPage);

  return (
    <>
      <Container>
        <SectionTitle title="Data Preview" align="center" />
        <div className="mt-6 border rounded overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 border-b">
            <h3 className="font-medium">Data Preview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min(rowsPerPage, previewData.rows.length)} of{" "}
              {previewData.totalRows} rows
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {previewData.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {previewData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page{" "}
                    <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    {/* Page numbers would go here */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default DataPreview;
