import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";
import fs from "fs";
import csvParser from "csv-parser";
import * as XLSX from "xlsx";

/**
 * Controller for fetching EnhanceTable structure
 * This controller retrieves all available EnhanceTable records from the database
 */
export const getEnhanceTableStructure = async (req: Request, res: Response) => {
    try {
        const pool = await connectToDB();
        
        // Query to get all EnhanceTable records
        const result = await pool.request()
            .query(`
                SELECT 
                    enhance_id,
                    enhanceTableName,
                    enhanceName, 
                    valueName, 
                    sub_id 
                FROM 
                    dbo.EnhanceTable 
                ORDER BY 
                    enhanceName
            `);
        
        // Return the data as JSON
        res.status(200).json({
            success: true,
            data: result.recordset
        });
        
    } catch (error) {
        console.error("Error fetching EnhanceTable structure:", error);
        res.status(500).json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลโครงสร้างตาราง", 
            error: error.message 
        });
    }
};

/**
 * Controller for fetching EnhanceTable fields structure
 * This controller retrieves the field structure for a specific EnhanceTable
 */
export const getEnhanceTableFields = async (req: Request, res: Response) => {
    try {
        const { enhanceTableId } = req.params;
        
        if (!enhanceTableId) {
            res.status(400).json({
                success: false,
                message: "กรุณาระบุ enhanceTableId"
            });
            return;
        }
        
        // Get the field structure based on enhanceTableId
        const fieldStructure = getFieldStructure(enhanceTableId);
        
        // Return the data as JSON
        res.status(200).json({
            success: true,
            data: fieldStructure
        });
        return;
        
    } catch (error) {
        console.error("Error fetching EnhanceTable fields:", error);
        res.status(500).json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลโครงสร้างฟิลด์", 
            error: error.message 
        });
        return;
    }
};

/**
 * Get field structure for the EnhanceTable
 */
const getFieldStructure = (enhanceId: string): { name: string, type: string, required: boolean }[] => {
    // Define default fields for all enhance tables
    const defaultFields = [
        { name: 'station_id', type: 'int', required: true },
        { name: 'indexName', type: 'string', required: true },
    ];
    
    // Add specific fields based on enhanceId
    const specificFields: { [key: string]: { name: string, type: string, required: boolean }[] } = {
        "1": [ // WDWS_Calm
            ...defaultFields,
            { name: 'calmValue', type: 'decimal', required: true }
        ],
        "2": [ // SO2
            ...defaultFields,
            { name: 'day1st_result_ppm', type: 'decimal', required: true },
            { name: 'day2nd_result_ppm', type: 'decimal', required: true },
            { name: 'day3rd_result_ppm', type: 'decimal', required: true }
        ],
        "3": [ // NoiseLevelNormal
            ...defaultFields,
            { name: 'day1st_result', type: 'decimal', required: true },
            { name: 'day2nd_result', type: 'decimal', required: true },
            { name: 'day3rd_result', type: 'decimal', required: true }
        ],
        "4": [ // NoiseLevel90_Average
            ...defaultFields,
            { name: 'day1st_result', type: 'decimal', required: true },
            { name: 'day2nd_result', type: 'decimal', required: true },
            { name: 'day3rd_result', type: 'decimal', required: true }
        ],
        "5": [ // Monitorresult
            ...defaultFields,
            { name: 'day1st_Leq', type: 'decimal', required: true },
            { name: 'day1st_L90', type: 'decimal', required: true },
            { name: 'day2nd_Leq', type: 'decimal', required: true },
            { name: 'day2nd_L90', type: 'decimal', required: true },
            { name: 'day3rd_Leq', type: 'decimal', required: true },
            { name: 'day3rd_L90', type: 'decimal', required: true }
        ],
        "6": [ // PlanktonPhytos
            ...defaultFields,
            { name: 'quantity_per_m3', type: 'decimal', required: true }
        ],
        "7": [ // PlanktonZoos
            ...defaultFields,
            { name: 'quantity_per_m3', type: 'decimal', required: true }
        ],
        "8": [ // Benthos
            ...defaultFields,
            { name: 'quantity_per_m2', type: 'decimal', required: true }
        ],
        "9": [ // FishLarvaeEggs
            ...defaultFields,
            { name: 'quantity_per_1000m3', type: 'decimal', required: true }
        ],
        "10": [ // JuvenileAquaticAnimals
            ...defaultFields,
            { name: 'quantity_per_1000m3', type: 'decimal', required: true }
        ]
    };
    
    // Add remark field to all tables (optional field)
    const fieldsWithRemark = [...(specificFields[enhanceId] || defaultFields), 
        { name: 'remark', type: 'string', required: false }
    ];
    
    return fieldsWithRemark;
};

/**
 * Parse CSV file for EnhanceTable data
 */
const parseCSV = async (filePath: string, enhanceTableId: string, periodId: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string, userId: number) => {
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
                    const savedData = await saveEnhanceDataForApproval(results, enhanceTableId, periodId, originalFilename, systemFilename, fileSize, mimeType, userId);
                    
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
 * Controller for handling CSV uploads to EnhanceTable
 */
export const uploadEnhanceCSV = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ CSV" });
            return;
        }

        // Get parameters from the request
        const { periodId, enhanceTableId } = req.body;

        if (!periodId || !enhanceTableId) {
            res.status(400).json({ message: "กรุณาระบุ periodId และ enhanceTableId" });
            return;
        }
        // Get the authenticated user's ID from the request object
        const userId = (req as any).user?.userId; // Use authenticated user ID or fallback to admin (1)

        const result = await parseCSV(req.file.path, enhanceTableId, periodId, req.file.originalname, req.file.filename, req.file.size, req.file.mimetype, userId);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        console.error("EnhanceTable CSV Upload Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
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

const saveEnhanceDataForApproval = async (data: any[], enhanceTableId: string, periodId: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string, userId: number) => {
    if (!data || data.length === 0) {
        throw new Error("ไม่พบข้อมูลในไฟล์");
    }

    const pool = await connectToDB();
    let transaction: any = null;

    try {
        // Get enhance table information
        const enhanceTableResult = await pool.request()
            .input("enhanceId", enhanceTableId)
            .query("SELECT * FROM dbo.EnhanceTable WHERE enhance_id = @enhanceId");
        
        if (enhanceTableResult.recordset.length === 0) {
            throw new Error(`ไม่พบข้อมูล EnhanceTable สำหรับ ID: ${enhanceTableId}`);
        }
        
        const enhanceTable = enhanceTableResult.recordset[0];
        
        // Start a transaction
        transaction = pool.transaction();
        await transaction.begin();
        
        // Get column mapping for the enhance table
        const columnMapping = getColumnMapping(enhanceTableId);
        
        // Get year_id from period_id
        const periodResult = await transaction.request()
            .input('periodId', periodId)
            .query(`
                SELECT year_id FROM dbo.Daysperiod WHERE period_id = @periodId
            `);
        
        if (periodResult.recordset.length === 0) {
            throw new Error(`ไม่พบข้อมูล period_id: ${periodId}`);
        }
        
        const yearId = periodResult.recordset[0].year_id;
        
        // Get sub_id from enhance_table
        const subIdResult = await transaction.request()
            .input('enhanceId', enhanceTableId)
            .query(`
                SELECT sub_id FROM dbo.EnhanceTable WHERE enhance_id = @enhanceId
            `);
        
        if (subIdResult.recordset.length === 0) {
            throw new Error(`ไม่พบข้อมูล sub_id สำหรับ enhance_id: ${enhanceTableId}`);
        }
        
        const subId = subIdResult.recordset[0].sub_id;
        
        // Get main_id from sub_id
        const mainIdResult = await transaction.request()
            .input('subId', subId)
            .query(`
                SELECT main_id FROM dbo.SbCategories WHERE sub_id = @subId
            `);
        
        if (mainIdResult.recordset.length === 0) {
            throw new Error(`ไม่พบข้อมูล main_id สำหรับ sub_id: ${subId}`);
        }
        
        const mainId = mainIdResult.recordset[0].main_id;
        
        // Save file information
        const fileResult = await transaction.request()
            .input('filename', originalFilename)
            .input('systemFilename', systemFilename)
            .input('fileSize', fileSize)
            .input('mimeType', mimeType)
            .input('periodId', periodId)
            .input('yearId', yearId)
            .input('mainId', mainId)
            .input('subId', subId)
            .input('uploadedBy', userId)
            .query(`
                INSERT INTO dbo.UploadedFiles (
                    filename, 
                    period_id,
                    year_id,
                    main_id,
                    sub_id,
                    uploaded_by,
                    status,
                    upload_date
                )
                VALUES (
                    @filename,
                    @periodId,
                    @yearId,
                    @mainId,
                    @subId,
                    @uploadedBy,
                    'รอการอนุมัติ',
                    GETDATE()
                );
                SELECT SCOPE_IDENTITY() AS upload_id;
            `);
        
        const uploadId = fileResult.recordset[0].upload_id;
        
        // Store the parsed data as JSON for later processing after approval
        const jsonData = JSON.stringify(data);
        
        // Store the JSON data and table information in the UploadedFiles table
        await transaction.request()
            .input('uploadId', uploadId)
            .input('jsonData', jsonData)
            .input('tableName', getTableName(enhanceTable.enhanceTableName))
            .input('columnMapping', JSON.stringify(columnMapping))
            .query(`
                UPDATE dbo.UploadedFiles 
                SET parsed_data = @jsonData,
                    target_table = @tableName,
                    column_mapping = @columnMapping
                WHERE upload_id = @uploadId
            `);
        
        console.log(`Stored parsed data for upload ID: ${uploadId} (pending approval)`);
        
        // Commit the transaction
        await transaction.commit();
        
        return {
            success: true,
            count: data.length,
            uploadId
        };
    } catch (error) {
        // Rollback the transaction if there's an error
        if (transaction) {
            console.error("Transaction rollback:", error);
            await transaction.rollback();
        }
        throw error;
    }
};

/**
 * Controller for handling Excel uploads to EnhanceTable
 */
export const uploadEnhanceExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ Excel" });
            return;
        }

        // Get parameters from the request
        const { periodId, enhanceTableId } = req.body;

        if (!periodId || !enhanceTableId) {
            res.status(400).json({ message: "กรุณาระบุ periodId และ enhanceTableId" });
            return;
        }

        // Get the authenticated user's ID from the request object
        const userId = (req as any).user?.userId; // Use authenticated user ID or fallback to admin (1)

        const result = await parseExcel(req.file.path, enhanceTableId, periodId, req.file.originalname, req.file.filename, req.file.size, req.file.mimetype, userId);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        console.error("EnhanceTable Excel Upload Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

/**
 * Parse Excel file for EnhanceTable data
 */
const parseExcel = async (filePath: string, enhanceTableId: string, periodId: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string, userId: number) => {
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
            saveEnhanceDataForApproval(results, enhanceTableId, periodId, originalFilename, systemFilename, fileSize, mimeType, userId)
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