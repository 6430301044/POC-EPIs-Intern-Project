import fs from "fs";
import csvParser from "csv-parser";
import xlsx from "xlsx";
import { connectToDB } from "../db/dbConfig";
import path from "path";

/**
 * DataImportService - Service for handling data import from uploaded files to database
 * Supports CSV and Excel file formats for different environmental data categories
 */

// Interface for import options
interface ImportOptions {
  filePath: string;
  fileType: string;
  category: string;
  subCategory: string;
  year: string;
  period: string;
  userId: string;
}

// Interface for parsed data record
interface DataRecord {
  [key: string]: any;
}

/**
 * Main function to import data from a file
 * @param options Import configuration options
 * @returns Object with status and results
 */
export const importDataFromFile = async (options: ImportOptions) => {
  try {
    // Parse the file based on its type
    let parsedData: DataRecord[];
    
    if (options.fileType.includes('csv')) {
      parsedData = await parseCSVFile(options.filePath);
    } else if (options.fileType.includes('excel') || options.fileType.includes('xlsx') || options.fileType.includes('xls')) {
      parsedData = await parseExcelFile(options.filePath);
    } else {
      throw new Error(`Unsupported file type: ${options.fileType}`);
    }
    
    // Validate the data structure
    const validatedData = validateData(parsedData, options.category, options.subCategory);
    
    // Save the data to the database
    const result = await saveToDatabase(validatedData, options);
    
    return {
      success: true,
      message: "Data imported successfully",
      recordsImported: validatedData.length,
      result
    };
  } catch (error: any) {
    console.error("Error importing data:", error);
    return {
      success: false,
      message: error.message || "Failed to import data",
      error: error
    };
  }
};

/**
 * Parse CSV file into array of objects
 * @param filePath Path to the CSV file
 * @returns Promise resolving to array of data objects
 */
const parseCSVFile = (filePath: string): Promise<DataRecord[]> => {
  return new Promise((resolve, reject) => {
    const results: DataRecord[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => reject(error));
  });
};

/**
 * Parse Excel file into array of objects
 * @param filePath Path to the Excel file
 * @returns Array of data objects
 */
const parseExcelFile = (filePath: string): DataRecord[] => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert sheet data to JSON
  const data = xlsx.utils.sheet_to_json(worksheet);
  return data as DataRecord[];
};

/**
 * Validate data structure based on category and subcategory
 * @param data Array of data records to validate
 * @param category Main data category
 * @param subCategory Data subcategory
 * @returns Validated data array
 */
const validateData = (data: DataRecord[], category: string, subCategory: string): DataRecord[] => {
  // Implement validation logic based on category and subcategory
  // This would check required fields, data types, value ranges, etc.
  
  if (!data || data.length === 0) {
    throw new Error("No data found in the file");
  }
  
  // Example validation for air quality data
  if (category === "air" && subCategory === "quality") {
    return data.map(record => {
      // Check required fields
      if (!record.station_name || !record.parameter || !record.value) {
        throw new Error("Missing required fields for air quality data");
      }
      
      // Validate numeric values
      const value = parseFloat(record.value);
      if (isNaN(value)) {
        throw new Error("Invalid numeric value in data");
      }
      
      return {
        ...record,
        value: value // Convert to number
      };
    });
  }
  
  // Example validation for water quality data
  if (category === "water" && subCategory === "quality") {
    // Implement water quality specific validation
  }
  
  // Default case - return data as is with basic validation
  return data;
};

/**
 * Save validated data to the appropriate database table
 * @param data Validated data array
 * @param options Import options
 * @returns Result of database operation
 */
const saveToDatabase = async (data: DataRecord[], options: ImportOptions) => {
  const pool = await connectToDB();
  const transaction = await pool.transaction();
  
  try {
    await transaction.begin();
    
    const results = [];
    
    // Determine target table based on category and subcategory
    const targetTable = getTargetTable(options.category, options.subCategory);
    
    for (const record of data) {
      // Create dynamic query based on record fields
      const columns = Object.keys(record);
      const paramNames = columns.map(col => `@${col}`);
      
      const query = `
        INSERT INTO ${targetTable} 
        (${columns.join(', ')}, year, period, imported_by, import_date) 
        VALUES (${paramNames.join(', ')}, @year, @period, @userId, GETDATE())
      `;
      
      const request = transaction.request();
      
      // Add parameters for each field in the record
      for (const [key, value] of Object.entries(record)) {
        request.input(key, value);
      }
      
      // Add import metadata
      request.input('year', options.year);
      request.input('period', options.period);
      request.input('userId', options.userId);
      
      const result = await request.query(query);
      results.push(result);
    }
    
    await transaction.commit();
    return { success: true, count: results.length };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Determine the target database table based on category and subcategory
 * @param category Main data category
 * @param subCategory Data subcategory
 * @returns Table name
 */
const getTargetTable = (category: string, subCategory: string): string => {
  // Map category/subcategory to database tables
  const tableMap: {[key: string]: string} = {
    'air_quality': 'AirQuality',
    'air_emission': 'AirEmission',
    'water_quality': 'WaterQuality',
    'water_consumption': 'WaterConsumption',
    'waste_solid': 'SolidWaste',
    'waste_hazardous': 'HazardousWaste'
  };
  
  const key = `${category}_${subCategory}`;
  const table = tableMap[key];
  
  if (!table) {
    throw new Error(`No table mapping found for category: ${category}, subcategory: ${subCategory}`);
  }
  
  return table;
};

/**
 * Get file extension from file path
 * @param filePath Path to the file
 * @returns File extension
 */
export const getFileExtension = (filePath: string): string => {
  return path.extname(filePath).toLowerCase();
};

/**
 * Check if file type is supported for import
 * @param fileType MIME type or file extension
 * @returns Boolean indicating if file type is supported
 */
export const isSupportedFileType = (fileType: string): boolean => {
  const supportedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv',
    '.xls',
    '.xlsx'
  ];
  
  return supportedTypes.some(type => fileType.includes(type));
};