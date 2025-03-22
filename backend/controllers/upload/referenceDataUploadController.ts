import { Request, Response } from "express";
import fs from "fs";
import csvParser from "csv-parser";
import * as XLSX from "xlsx";
import { connectToDB } from "../../db/dbConfig";
import path from "path";

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
        res.status(200).json({ message: "อัปโหลดสำเร็จ รอการอนุมัติ", data: result });

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
        res.status(200).json({ message: "อัปโหลดสำเร็จ รอการอนุมัติ", data: result });

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
                    // Save data to pending approval table instead of directly to reference table
                    const savedData = await saveToPendingApproval(results, tableName, originalFilename, systemFilename, fileSize, mimeType, userId);
                    
                    // We'll keep the file for approval process
                    // Move the file to a permanent location for later processing
                    const uploadsDir = path.join(__dirname, '../../../uploads/reference');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    
                    const newFilePath = path.join(uploadsDir, systemFilename);
                    fs.copyFile(filePath, newFilePath, (err) => {
                        if (err) console.error("Error copying file to permanent location:", err);
                        
                        // Delete the temporary file after copying
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
                        });
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
            
            // Save data to pending approval table instead of directly to reference table
            saveToPendingApproval(results, tableName, originalFilename, systemFilename, fileSize, mimeType, userId)
                .then((savedData) => {
                    // We'll keep the file for approval process
                    // Move the file to a permanent location for later processing
                    const uploadsDir = path.join(__dirname, '../../../uploads/reference');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    
                    const newFilePath = path.join(uploadsDir, systemFilename);
                    fs.copyFile(filePath, newFilePath, (err) => {
                        if (err) console.error("Error copying file to permanent location:", err);
                        
                        // Delete the temporary file after copying
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
                        });
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
 * Save data to pending approval table instead of directly to reference table
 */
const saveToPendingApproval = async (data: any[], tableName: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string, userId: number) => {
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
        
        // UserActivity logging removed as the table does not exist
        
        // Save the parsed data as JSON string
        const parsedData = JSON.stringify(data);
        
        // Insert into ReferenceDataPendingApproval table
        const uploadResult = await pool.request()
            .input("filename", originalFilename)
            .input("systemFilename", systemFilename)
            .input("fileSize", fileSize)
            .input("mimeType", mimeType)
            .input("uploadedBy", userId)
            .query(`
                INSERT INTO dbo.UploadedFiles (
                    filename, uploaded_by, upload_date, status
                )
                VALUES (
                    @filename, @uploadedBy, GETDATE(), 'รอการอนุมัติ'
                );
                SELECT SCOPE_IDENTITY() AS upload_id;
            `);
        
        const uploadId = uploadResult.recordset[0].upload_id;
        console.log(`Created upload record with ID: ${uploadId}`);

        // Validate data and count valid/invalid rows
        let validCount = 0;
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

                validCount++;
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
            uploadId,
            pendingCount: validCount,
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