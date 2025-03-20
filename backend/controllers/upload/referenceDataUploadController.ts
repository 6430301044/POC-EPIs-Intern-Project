import { Request, Response } from "express";
import fs from "fs";
import csvParser from "csv-parser";
import * as XLSX from "xlsx";
import { connectToDB } from "../../db/dbConfig";

/**
 * Controller for handling CSV uploads to Reference Tables
 */
export const uploadReferenceCSV = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ CSV" });
        }

        // Get parameters from the request
        const { tableName } = req.body;

        if (!tableName) {
            return res.status(400).json({ message: "กรุณาระบุชื่อตารางอ้างอิง" });
        }
        
        // Get the authenticated user's ID from the request object
        const userId = (req as any).user?.userId;

        const result = await parseCSV(req.file.path, tableName, req.file.originalname, req.file.filename, req.file.size, req.file.mimetype, userId);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        console.error("Reference Data CSV Upload Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

/**
 * Controller for handling Excel uploads to Reference Tables
 */
export const uploadReferenceExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ Excel" });
        }

        // Get parameters from the request
        const { tableName } = req.body;

        if (!tableName) {
            return res.status(400).json({ message: "กรุณาระบุชื่อตารางอ้างอิง" });
        }

        const userId = (req as any).user?.userId;
        
        const result = await parseExcel(req.file.path, tableName, req.file.originalname, req.file.filename, req.file.size, req.file.mimetype, userId);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        console.error("Reference Data Excel Upload Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

/**
 * Parse CSV file for Reference Table data
 */
const parseCSV = async (filePath: string, tableName: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string, userId: number) => {
    return new Promise((resolve, reject) => {
        const results: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", async () => {
                try {
                    // Save data directly to the reference table
                    const savedData = await saveReferenceData(results, tableName, originalFilename, userId);
                    
                    // Delete the temporary file after processing
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting temporary file:", err);
                    });
                    
                    resolve(savedData);
                } catch (error) {
                    reject(error);
                }
            })
            .on("error", (error) => reject(error));
    });
};

/**
 * Parse Excel file for Reference Table data
 */
const parseExcel = async (filePath: string, tableName: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string, userId: number) => {
    return new Promise((resolve, reject) => {
        try {
            // Read the Excel file
            const workbook = XLSX.readFile(filePath);
            
            // Get the first worksheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const results = XLSX.utils.sheet_to_json(worksheet);
            
            // Save data directly to the reference table
            saveReferenceData(results, tableName, originalFilename, userId)
                .then((savedData) => {
                    // Delete the temporary file after processing
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting temporary file:", err);
                    });
                    
                    resolve(savedData);
                })
                .catch(error => reject(error));
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Validate table name to prevent SQL injection
 */
const validateTableName = (tableName: string): boolean => {
    const validTables = [
        'Years', 'Daysperiod', 'Mcategories', 'SbCategories',
        'Companies', 'Monitoring_Station', 'Tool', 'Semiannual'
    ];
    
    return validTables.includes(tableName);
};

/**
 * Save data directly to the reference table
 */
const saveReferenceData = async (data: any[], tableName: string, originalFilename: string, userId: number) => {
    if (!data || data.length === 0) {
        throw new Error("ไม่พบข้อมูลในไฟล์");
    }

    // Validate table name
    if (!validateTableName(tableName)) {
        throw new Error(`ไม่พบตาราง ${tableName} หรือไม่ได้รับอนุญาตให้เข้าถึง`);
    }

    const pool = await connectToDB();
    let transaction = null;

    try {
        // Begin transaction
        transaction = pool.transaction();
        await transaction.begin();

        // Get table schema to determine valid columns
        const schemaResult = await pool.request()
            .query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${tableName}'
                AND COLUMN_NAME NOT LIKE '%_id' -- Exclude ID columns that are auto-generated
            `);

        const validColumns = schemaResult.recordset.map(col => col.COLUMN_NAME);
        
        // Log upload activity
        await pool.request()
            .input("userId", userId)
            .input("action", `Bulk upload to ${tableName}`)
            .input("details", `Uploaded ${data.length} records from ${originalFilename}`)
            .query(`
                INSERT INTO dbo.UserActivity (user_id, action_type, action_details, action_timestamp)
                VALUES (@userId, @action, @details, GETDATE())
            `);

        // Process each row and insert into the table
        let insertedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const row of data) {
            try {
                // Filter out invalid columns
                const filteredRow = {};
                for (const key in row) {
                    if (validColumns.includes(key)) {
                        filteredRow[key] = row[key];
                    }
                }

                // Skip if no valid columns
                if (Object.keys(filteredRow).length === 0) {
                    skippedCount++;
                    continue;
                }

                // Build dynamic SQL for insert
                const columns = Object.keys(filteredRow).join(', ');
                const paramNames = Object.keys(filteredRow).map(key => `@${key}`).join(', ');
                
                const request = pool.request();
                
                // Add parameters
                for (const key in filteredRow) {
                    request.input(key, filteredRow[key]);
                }

                // Execute insert
                await request.query(`
                    INSERT INTO dbo.${tableName} (${columns})
                    VALUES (${paramNames})
                `);

                insertedCount++;
            } catch (error) {
                errorCount++;
                errors.push({
                    row: row,
                    error: error.message
                });
            }
        }

        // Commit transaction
        await transaction.commit();

        return {
            success: true,
            insertedCount,
            skippedCount,
            errorCount,
            errors: errors.length > 0 ? errors : undefined
        };

    } catch (error) {
        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};