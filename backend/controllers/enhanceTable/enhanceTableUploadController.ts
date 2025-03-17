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
        // Check if UploadTempTables table exists, create it if it doesn't
        const tableExistsResult = await pool.request().query(`
            SELECT OBJECT_ID('dbo.UploadTempTables') AS table_id
        `);
        
        if (!tableExistsResult.recordset[0].table_id) {
            console.log("Creating UploadTempTables table as it doesn't exist");
            await pool.request().query(`
                CREATE TABLE dbo.UploadTempTables (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    upload_id INT NOT NULL,
                    temp_table_name NVARCHAR(255) NOT NULL,
                    target_table NVARCHAR(255) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE()
                )
            `);
        }
        
        // Create a temporary table to store the data
        const tempTableName = `#Temp_${enhanceTableId}_${Date.now()}`;
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
        
        // Create a permanent temp table with a unique name
        const permanentTempTableName = `dbo.Temp_${enhanceTable.enhanceName}_${Date.now()}`;
        
        // Get column mapping for the enhance table
        const columnMapping = getColumnMapping(enhanceTableId);
        
        // Create columns for the temp table based on the first row of data
        const columns = Object.keys(data[0]).map(key => {
            // Map the column name if it exists in the mapping
            const mappedName = columnMapping[key.toLowerCase()] || key;
            return `[${mappedName}] NVARCHAR(MAX)`;
        }).join(', ');
        
        // Create the permanent temp table
        await transaction.request().query(`
            CREATE TABLE ${permanentTempTableName} (
                [id] INT IDENTITY(1,1) PRIMARY KEY,
                ${columns}
            )
        `);
        
        // Insert data into the permanent temp table
        for (const row of data) {
            const columnNames = Object.keys(row).map(key => {
                const mappedName = columnMapping[key.toLowerCase()] || key;
                return `[${mappedName}]`;
            }).join(', ');
            
            const columnValues = Object.keys(row).map(key => {
                return `'${row[key]?.toString().replace(/'/g, "''")}' `;
            }).join(', ');
            
            await transaction.request().query(`
                INSERT INTO ${permanentTempTableName} (${columnNames})
                VALUES (${columnValues})
            `);
        }
        
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
        
        // Get current user ID (for now using a default value of 1 since we don't have authentication context)
        const userId = 1; // This should be replaced with the actual user ID from authentication context
        
        // Save file information
        const fileResult = await transaction.request()
            .input('filename', systemFilename)
            .input('periodId', periodId)
            .input('yearId', yearId)
            .input('mainId', mainId)
            .input('subId', subId)
            .input('uploadedBy', userId)
            .input('recordCount', data.length)
            .query(`
                INSERT INTO dbo.UploadedFiles (
                    filename, 
                    period_id,
                    year_id,
                    main_id,
                    sub_id,
                    uploaded_by,
                    status,
                    upload_date,
                    record_count
                )
                VALUES (
                    @filename,
                    @periodId,
                    @yearId,
                    @mainId,
                    @subId,
                    @uploadedBy,
                    'รอการอนุมัติ',
                    GETDATE(),
                    @recordCount
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
            .input('tableName', getTableName(enhanceTable.enhanceName))
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
            uploadId,
            tempTableName: permanentTempTableName,
            recordCount: data.length,
            enhanceTable: enhanceTable.enhanceName
        };
    } catch (error) {
        // Rollback the transaction if there's an error
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};