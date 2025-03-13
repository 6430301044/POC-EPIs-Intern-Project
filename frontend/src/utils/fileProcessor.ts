import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Types of files supported by the processor
 */
export enum FileType {
  CSV = 'csv',
  EXCEL = 'excel',
  UNKNOWN = 'unknown'
}

/**
 * Interface for parsed file data
 */
export interface ParsedFileData {
  headers: string[];
  rows: Record<string, any>[];
  rawData?: any;
}

/**
 * Interface for file validation options
 */
export interface ValidationOptions {
  requiredColumns?: string[];
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}

/**
 * Interface for file validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Detects the type of file based on its extension
 * @param fileName - The name of the file
 * @returns The detected file type
 */
export const detectFileType = (fileName: string): FileType => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) return FileType.UNKNOWN;
  
  if (extension === 'csv') return FileType.CSV;
  if (['xlsx', 'xls', 'xlsb', 'xlsm'].includes(extension)) return FileType.EXCEL;
  
  return FileType.UNKNOWN;
};

/**
 * Validates a file against specified options
 * @param file - The file to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateFile = (file: File, options: ValidationOptions = {}): ValidationResult => {
  const errors: string[] = [];
  const fileType = detectFileType(file.name);
  
  // Check file size if maxFileSize is specified
  if (options.maxFileSize && file.size > options.maxFileSize) {
    errors.push(`File size exceeds the maximum allowed size of ${options.maxFileSize / (1024 * 1024)} MB`);
  }
  
  // Check file type if allowedFileTypes is specified
  if (options.allowedFileTypes && options.allowedFileTypes.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && !options.allowedFileTypes.includes(extension)) {
      errors.push(`File type .${extension} is not allowed. Allowed types: ${options.allowedFileTypes.join(', ')}`);
    }
  }
  
  // If file type is unknown, add an error
  if (fileType === FileType.UNKNOWN) {
    errors.push('Unsupported file type. Please upload a CSV or Excel file.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Reads and parses a CSV file
 * @param file - The CSV file to parse
 * @returns Promise with parsed data
 */
export const parseCSV = (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Extract headers from the first row
        const headers = results.meta.fields || [];
        
        // Convert data to array of objects
        const rows = results.data as Record<string, any>[];
        
        resolve({
          headers,
          rows,
          rawData: results
        });
      },
      error: (error) => {
        reject(new Error(`Error parsing CSV file: ${error.message}`));
      }
    });
  });
};

/**
 * Reads and parses an Excel file
 * @param file - The Excel file to parse
 * @returns Promise with parsed data
 */
export const parseExcel = async (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }
        
        // Extract headers from the first row
        const headers = jsonData[0] as string[];
        
        // Convert remaining rows to array of objects
        const rows = jsonData.slice(1).map((row: any) => {
          const obj: Record<string, any> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        resolve({
          headers,
          rows,
          rawData: workbook
        });
      } catch (error) {
        reject(new Error(`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses a file based on its type
 * @param file - The file to parse
 * @returns Promise with parsed data
 */
export const parseFile = async (file: File): Promise<ParsedFileData> => {
  const fileType = detectFileType(file.name);
  
  switch (fileType) {
    case FileType.CSV:
      return parseCSV(file);
    case FileType.EXCEL:
      return parseExcel(file);
    default:
      throw new Error('Unsupported file type');
  }
};

/**
 * Validates the parsed data against required columns
 * @param parsedData - The parsed file data
 * @param requiredColumns - Array of required column names
 * @returns Validation result
 */
export const validateParsedData = (parsedData: ParsedFileData, requiredColumns: string[] = []): ValidationResult => {
  const errors: string[] = [];
  
  if (requiredColumns.length > 0) {
    const missingColumns = requiredColumns.filter(col => !parsedData.headers.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Transforms parsed data for specific data types or formats
 * @param parsedData - The parsed file data
 * @param transformations - Object mapping column names to transformation functions
 * @returns Transformed data
 */
export const transformData = (
  parsedData: ParsedFileData,
  transformations: Record<string, (value: any) => any>
): ParsedFileData => {
  const transformedRows = parsedData.rows.map(row => {
    const transformedRow = { ...row };
    
    Object.keys(transformations).forEach(column => {
      if (column in row) {
        transformedRow[column] = transformations[column](row[column]);
      }
    });
    
    return transformedRow;
  });
  
  return {
    ...parsedData,
    rows: transformedRows
  };
};

/**
 * Exports data to a CSV string
 * @param data - The data to export
 * @param options - Export options for Papa Parse
 * @returns CSV string
 */
export const exportToCSV = (data: Record<string, any>[], options?: Papa.UnparseConfig): string => {
  return Papa.unparse(data, options);
};

/**
 * Exports data to an Excel file
 * @param data - The data to export
 * @param sheetName - Name of the worksheet
 * @returns Excel workbook
 */
export const exportToExcel = (data: Record<string, any>[], sheetName: string = 'Sheet1'): XLSX.WorkBook => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  return workbook;
};

/**
 * Downloads data as a file
 * @param data - The data to download
 * @param fileName - Name of the file
 * @param fileType - Type of the file
 */
export const downloadFile = (data: string | XLSX.WorkBook, fileName: string, fileType: FileType): void => {
  let blob: Blob;
  let url: string;
  
  if (fileType === FileType.CSV) {
    blob = new Blob([data as string], { type: 'text/csv;charset=utf-8;' });
  } else if (fileType === FileType.EXCEL) {
    const excelData = XLSX.write(data as XLSX.WorkBook, { bookType: 'xlsx', type: 'array' });
    blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } else {
    throw new Error('Unsupported file type for download');
  }
  
  url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};