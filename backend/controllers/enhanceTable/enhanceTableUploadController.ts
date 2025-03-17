import { Request, Response } from "express";
import fs from "fs";
import csvParser from "csv-parser";
import * as XLSX from "xlsx";
import { connectToDB } from "../../db/dbConfig";

/**
 * Controller for handling CSV uploads to EnhanceTable
 */
export const uploadEnhanceCSV = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ CSV" });
        }

        // Get parameters from the request
        const { periodId, enhanceTableId } = req.body;

        if (!periodId || !enhanceTableId) {
            return res.status(400).json({ message: "กรุณาระบุ periodId และ enhanceTableId" });
        }

        const result = await parseCSV(req.file.path, enhanceTableId, periodId, req.file.originalname, req.file.filename, req.file.size, req.file.mimetype);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        console.error("EnhanceTable CSV Upload Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

/**
 * Controller for handling Excel uploads to EnhanceTable
 */
export const uploadEnhanceExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ Excel" });
        }

        // Get parameters from the request
        const { periodId, enhanceTableId } = req.body;

        if (!periodId || !enhanceTableId) {
            return res.status(400).json({ message: "กรุณาระบุ periodId และ enhanceTableId" });
        }

        const result = await parseExcel(req.file.path, enhanceTableId, periodId, req.file.originalname, req.file.filename, req.file.size, req.file.mimetype);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        console.error("EnhanceTable Excel Upload Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

/**
 * Parse CSV file for EnhanceTable data
 */
const parseCSV = async (filePath: string, enhanceTableId: string, periodId: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string) => {
    return new Promise((resolve, reject) => {
        const results: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", async () => {
                try {
                    // Save file info and data for approval
                    const savedData = await saveEnhanceDataForApproval(results, enhanceTableId, periodId, originalFilename, systemFilename, fileSize, mimeType);
                    
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
 * Parse Excel file for EnhanceTable data
 */
const parseExcel = async (filePath: string, enhanceTableId: string, periodId: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string) => {
    return new Promise((resolve, reject) => {
        try {
            // Read the Excel file
            const workbook = XLSX.readFile(filePath);
            
            // Get the first worksheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const results = XLSX.utils.sheet_to_json(worksheet);
            
            // Process the data for approval
            saveEnhanceDataForApproval(results, enhanceTableId, periodId, originalFilename, systemFilename, fileSize, mimeType)
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
 * Get table name for the EnhanceTable
 */
const getTableName = (enhanceName: string): string => {
    return `Enh_${enhanceName}`;
};

/**
 * Get column mapping for the EnhanceTable
 */
const getColumnMapping = (enhanceId: string): { [key: string]: string } => {
    // Define default column mappings for all enhance tables
    const defaultMapping = {
        "station_id": "station_id",
        "indexName": "indexName",
        "period_id": "period_id"
    };
    
    // Add specific mappings based on enhanceId
    // This can be expanded based on the specific requirements of each enhance table
    const specificMappings: { [key: string]: { [key: string]: string } } = {
        "1": { // WDWS_Calm
            ...defaultMapping,
            "calmValue": "calmValue"
        },
        "2": { // SO2
            ...defaultMapping,
            "day1st_result_ppm": "day1st_result_ppm",
            "day2nd_result_ppm": "day2nd_result_ppm",
            "day3rd_result_ppm": "day3rd_result_ppm"
        },
        "3": { // NoiseLevelNormal
            ...defaultMapping,
            "day1st_result": "day1st_result",
            "day2nd_result": "day2nd_result",
            "day3rd_result": "day3rd_result"
        },
        "4": { // NoiseLevel90_Average
            ...defaultMapping,
            "day1st_result": "day1st_result",
            "day2nd_result": "day2nd_result",
            "day3rd_result": "day3rd_result"
        },
        "5": { // Monitorresult
            ...defaultMapping,
            "day1st_Leq": "day1st_Leq",
            "day1st_L90": "day1st_L90",
            "day2nd_Leq": "day2nd_Leq",
            "day2nd_L90": "day2nd_L90",
            "day3rd_Leq": "day3rd_Leq",
            "day3rd_L90": "day3rd_L90"
        },
        "6": { // PlanktonPhytos
            ...defaultMapping,
            "quantity_per_m3": "quantity_per_m3"
        },
        "7": { // PlanktonZoos
            ...defaultMapping,
            "quantity_per_m3": "quantity_per_m3"
        },
        "8": { // Benthos
            ...defaultMapping,
            "quantity_per_m2": "quantity_per_m2"
        },
        "9": { // FishLarvaeEggs
            ...defaultMapping,
            "quantity_per_1000m3": "quantity_per_1000m3"
        },
        "10": { // JuvenileAquaticAnimals
            ...defaultMapping,
            "quantity_per_1000m3": "quantity_per_1000m3"
        }
    };
    
    return specificMappings[enhanceId] || defaultMapping;
};

/**
 * Save EnhanceTable data for approval process
 */
const saveEnhanceDataForApproval = async (data: any[], enhanceTableId: string, periodId: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string) => {
    if (!data || data.length === 0) {
        throw new Error("ไม่พบข้อมูลในไฟล์");
    }

    const pool = await connectToDB();
    let transaction = null;

    try {
        // Begin transaction
        transaction = pool.transaction();
        await transaction.begin();

        // Get the enhance table information
        const enhanceTableResult = await pool.request()
            .input("enhanceId", enhanceTableId)
            .query("SELECT * FROM dbo.EnhanceTable WHERE enhance_id = @enhanceId");
        
        if (enhanceTableResult.recordset.length === 0) {
            throw new Error(`ไม่พบข้อมูล EnhanceTable สำหรับ ID: ${enhanceTableId}`);
        }
        
        const enhanceTable = enhanceTableResult.recordset[0];
        const tableName = `Enh_${enhanceTable.enhanceName}`;
        
        // Get the year_id from the period_id
        const yearIdResult = await pool.request()
            .input("periodId", periodId)
            .query("SELECT year_id FROM dbo.Daysperiod WHERE period_id = @periodId");
        
        if (yearIdResult.recordset.length === 0 || !yearIdResult.recordset[0].year_id) {
            throw new Error(`ไม่พบ year_id สำหรับ period_id: ${periodId}`);
        }
        
        const yearId = yearIdResult.recordset[0].year_id;
        const userId = 1; // Using a valid user ID (Admin) - should be replaced with actual user ID from auth

        // Get the main_id from the sub_id in EnhanceTable
        const mainIdResult = await pool.request()
            .input("subId", enhanceTable.sub_id)
            .query("SELECT main_id FROM dbo.SbCategories WHERE sub_id = @subId");
        
        if (mainIdResult.recordset.length === 0 || !mainIdResult.recordset[0].main_id) {
            throw new Error(`ไม่พบ main_id สำหรับ sub_id: ${enhanceTable.sub_id}`);
        }
        
        const mainId = mainIdResult.recordset[0].main_id;
        
        // Record the upload in the UploadedFiles table
        const uploadRequest = pool.request()
            .input("filename", originalFilename)
            .input("periodId", periodId)
            .input("yearId", yearId)
            .input("mainId", mainId)
            .input("subId", enhanceTable.sub_id)
            .input("userId", userId)
            .input("status", "รอการอนุมัติ"); // Initial status is pending for approval
        
        const uploadResult = await uploadRequest.query(`
            INSERT INTO dbo.UploadedFiles 
            (filename, period_id, year_id, main_id, sub_id, uploaded_by, status, upload_date) 
            VALUES 
            (@filename, @periodId, @yearId, @mainId, @subId, @userId, @status, GETDATE());
            SELECT SCOPE_IDENTITY() AS upload_id;
        `);
        
        const uploadId = uploadResult.recordset[0].upload_id;
        
        // Store the data in a temporary table for approval
        const tempTableName = `Temp_${tableName}_${uploadId}`;
        
        // Create temporary table with the same structure as the target table
        await pool.request().query(`
            SELECT * INTO ${tempTableName} FROM ${tableName} WHERE 1=0;
        `);
        
        // Insert data into temporary table
        for (const row of data) {
            const insertRequest = pool.request();
            
            // Add parameters for each field in the row
            Object.keys(row).forEach(key => {
                insertRequest.input(key, row[key]);
            });
            
            // Add period_id
            insertRequest.input("periodId", periodId);
            
            // Build the SQL query dynamically based on the fields in the row
            const fields = Object.keys(row).join(', ');
            const paramNames = Object.keys(row).map(key => `@${key}`).join(', ');
            
            await insertRequest.query(`
                INSERT INTO ${tempTableName} (${fields}, period_id) 
                VALUES (${paramNames}, @periodId);
            `);
        }
        
        // Record the mapping between upload and temporary table
        await pool.request()
            .input("uploadId", uploadId)
            .input("tempTableName", tempTableName)
            .input("targetTable", tableName)
            .query(`
                INSERT INTO dbo.UploadTempTables (upload_id, temp_table_name, target_table) 
                VALUES (@uploadId, @tempTableName, @targetTable);
            `);
        
        // Commit the transaction
        await transaction.commit();
        
        return { uploadId, rowCount: data.length };
        
    } catch (error) {
        // Rollback the transaction if there's an error
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};