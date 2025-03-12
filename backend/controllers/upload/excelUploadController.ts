import { Request, Response } from "express";
import * as XLSX from "xlsx";
import fs from "fs";
import { connectToDB } from "../../db/dbConfig";

export const uploadExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ Excel" });
        }

        // Get parameters from the request
        const { periodId, mainCategory, subCategory } = req.body;

        if (!periodId || !mainCategory || !subCategory) {
            return res.status(400).json({ message: "กรุณาระบุ periodId, mainCategory และ subCategory" });
        }

        const result = await parseExcel(req.file.path, mainCategory, subCategory, periodId, req.file.originalname, req.file.filename, req.file.size, req.file.mimetype);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        console.error("Excel Upload Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

export const parseExcel = async (filePath: string, mainCategory: string, subCategory: string, periodId: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string) => {
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
            saveForApproval(results, mainCategory, subCategory, periodId, originalFilename, systemFilename, fileSize, mimeType)
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

// Function to save uploaded data for approval process
const saveForApproval = async (data: any[], mainCategory: string, subCategory: string, periodId: string, originalFilename: string, systemFilename: string, fileSize: number, mimeType: string) => {
    if (!data || data.length === 0) {
        throw new Error("ไม่พบข้อมูลในไฟล์ Excel");
    }

    const pool = await connectToDB();
    let transaction = null;

    try {
        // Begin transaction
        transaction = pool.transaction();
        await transaction.begin();

        // Determine target table based on mainCategory and subCategory
        const tableName = getTableName(mainCategory, subCategory);
        console.log(`Saving data to table: ${tableName}`);

        // Get column mapping for the selected table
        const columnMapping = getColumnMapping(subCategory);

        // First, record the upload in the UploadedFiles table
        const mainCategoryId = await getMainCategoryId(pool, mainCategory);
        const subCategoryId = await getSubCategoryId(pool, subCategory);
        const userId = 1; // Using a valid user ID (Chanatip, Admin) instead of string "system"
        
        // Get the year_id from the period_id
        const yearIdResult = await pool.request()
            .input("periodId", periodId)
            .query("SELECT year_id FROM dbo.Daysperiod WHERE period_id = @periodId");
        
        if (yearIdResult.recordset.length === 0 || !yearIdResult.recordset[0].year_id) {
            throw new Error(`ไม่พบ year_id สำหรับ period_id: ${periodId}`);
        }
        
        const yearId = yearIdResult.recordset[0].year_id;

        const uploadRequest = pool.request()
            .input("filename", originalFilename)
            .input("systemFilename", systemFilename)
            .input("fileSize", fileSize)
            .input("mimeType", mimeType)
            .input("periodId", periodId)
            .input("yearId", yearId)
            .input("mainId", mainCategoryId)
            .input("subId", subCategoryId)
            .input("uploadedBy", userId)
            .input("status", "รอการอนุมัติ");

        const uploadResult = await uploadRequest.query(`
            INSERT INTO dbo.UploadedFiles (
                filename, period_id, year_id, main_id, sub_id, uploaded_by, status, upload_date
            ) VALUES (
                @filename, @periodId, @yearId, @mainId, @subId, @uploadedBy, @status, GETDATE()
            );
            SELECT SCOPE_IDENTITY() AS upload_id;
        `);

        const uploadId = uploadResult.recordset[0].upload_id;
        console.log(`Created upload record with ID: ${uploadId}`);

        // Store the parsed data as JSON for later processing after approval
        // Convert the data to a JSON string
        const jsonData = JSON.stringify(data);
        
        // Store the JSON data in the UploadedFiles table or a related table
        await pool.request()
            .input("uploadId", uploadId)
            .input("jsonData", jsonData)
            .input("tableName", tableName)
            .input("columnMapping", JSON.stringify(columnMapping))
            .query(`
                UPDATE dbo.UploadedFiles 
                SET parsed_data = @jsonData,
                    target_table = @tableName,
                    column_mapping = @columnMapping
                WHERE upload_id = @uploadId
            `);
        
        console.log(`Stored parsed data for upload ID: ${uploadId} (pending approval)`);

        // Commit transaction
        await transaction.commit();
        return { success: true, count: data.length, uploadId };
    } catch (error) {
        // If there's an error, roll back the transaction
        if (transaction) await transaction.rollback();
        throw error;
    }
};

// Helper function to get main category ID from the database
async function getMainCategoryId(pool: any, mainCategory: string): Promise<string> {
    const result = await pool.request()
        .input("mainName", mainCategory)
        .query("SELECT main_id FROM dbo.Mcategories WHERE main_name = @mainName");
    
    if (result.recordset.length === 0) {
        throw new Error(`ไม่พบหมวดหมู่หลัก: ${mainCategory}`);
    }
    
    return result.recordset[0].main_id;
}

// Helper function to get sub category ID from the database
async function getSubCategoryId(pool: any, subCategory: string): Promise<string> {
    const result = await pool.request()
        .input("subName", subCategory)
        .query("SELECT sub_id FROM dbo.SbCategories WHERE sub_name = @subName");
    
    if (result.recordset.length === 0) {
        throw new Error(`ไม่พบหมวดหมู่ย่อย: ${subCategory}`);
    }
    
    return result.recordset[0].sub_id;
}

// Helper function to get the table name based on mainCategory and subCategory
const getTableName = (mainCategory: string, subCategory: string): string => {
    // Map the mainCategory and subCategory to the corresponding table name
    const tableMap: { [key: string]: string } = {
        "Env_Wind_WDWS": "Env_Wind_WDWS",
        "Env_Wind_WindQuality": "Env_Wind_WindQuality",
        "Env_Wind_SO2": "Env_Wind_SO2",
        "Env_Wind_Vocs": "Env_Wind_Vocs",
        "Env_Air_AirQuality": "Env_Air_AirQuality",
        "Env_Noise_NoiseLevelNormal": "Env_Noise_NoiseLevelNormal",
        "Env_Noise_NoiseLevel90": "Env_Noise_NoiseLevel90",
        "Env_Noise_Monitorresult": "Env_Noise_Monitorresult",
        "Env_SeaWater_SeaWater": "Env_SeaWater_SeaWater",
        "Env_WasteWater_WasteWater": "Env_WasteWater_WasteWater",
        "Env_MarineEcology_PlanktonPhytos": "Env_MarineEcology_PlanktonPhytos",
        "Env_MarineEcology_PlanktonZoos": "Env_MarineEcology_PlanktonZoos",
        "Env_MarineEcology_Benthos": "Env_MarineEcology_Benthos",
        "Env_MarineEcology_FishLarvaeEggs": "Env_MarineEcology_FishLarvaeEggs",
        "Env_MarineEcology_JuvenileAquaticAnimals": "Env_MarineEcology_JuvenileAquaticAnimals"
    };

    // Convert Thai categories to English identifiers
    const mainCategoryId = getMainCategoryIdentifier(mainCategory);
    const subCategoryId = getTableIdentifier(subCategory);
    console.log("✅ Main Category Identifier:", mainCategoryId);
    console.log("✅ Sub Category Identifier:", subCategoryId);
    
    if (!mainCategoryId || !subCategoryId) {
        throw new Error(`ไม่สามารถแปลงชื่อหมวดหมู่ ${mainCategory} หรือ ${subCategory} เป็นรหัสได้`);
    }
    
    // Combine mainCategory and subCategory identifiers to get the key
    const key = `${mainCategoryId}_${subCategoryId}`;
    console.log("✅ Table key:", key);
    const tableName = tableMap[key];

    if (!tableName) {
        throw new Error(`ไม่พบตารางสำหรับ ${mainCategory} และ ${subCategory}`);
    }

    return tableName;
};

// Helper function to map Thai main category to English identifier
const getMainCategoryIdentifier = (mainCategory: string): string => {
    const mainCategoryMappings: { [key: string]: string } = {
        "คุณภาพอากาศในบรรยากาศ": "Env_Wind",
        "คุณภาพอากาศภายในสถานประกอบการ": "Env_Air",
        "ผลการตรวจวัดคุณภาพเสียงโดยทั่วไป": "Env_Noise",
        "คุณภาพน้ำทิ้ง": "Env_WasteWater",
        "คุณภาพน้ำทะเล": "Env_SeaWater",
        "นิเวศวิทยาทางทะเล": "Env_MarineEcology"
    };
    console.log("✅ Mapping Main Category:", mainCategory, "→", mainCategoryMappings[mainCategory]);
    return mainCategoryMappings[mainCategory] || "";
};

// Helper function to map Thai sub category to English identifier
const getTableIdentifier = (subCategory: string): string => {
    const subCategoryMappings: { [key: string]: string } = {
        "ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง": "WDWS",
        "ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ": "WindQuality",
        "ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ": "SO2",
        "ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ": "Vocs",
        "ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ": "AirQuality",
        "ผลการตรวจวัดระดับเสียงโดยทั่วไป": "NoiseLevelNormal",
        "ผลการตรวจวัดคุณภาพ 90": "NoiseLevel90",
        "ผลการติดตามตรวจสอบ": "Monitorresult",
        "ผลการตรวจวัดคุณภาพน้ำทิ้ง": "WasteWater",
        "ผลการตรวจวัดคุณภาพน้ำทะเล": "SeaWater",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช": "PlanktonPhytos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์": "PlanktonZoos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน": "Benthos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา": "FishLarvaeEggs",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน": "JuvenileAquaticAnimals"
    };
    console.log("✅ Mapping Sub Category:", subCategory, "→", subCategoryMappings[subCategory]);
    return subCategoryMappings[subCategory] || "";
};

// Helper function to get column mapping for a specific subcategory
const getColumnMapping = (subCategory: string): { [key: string]: string } => {
    // Define column mappings for each subcategory
    const mappings: { [key: string]: { [key: string]: string } } = {
        "ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง": { //WDWS
            "windDirection": "windDirection",
            "ws_05_1": "ws_05_1",
            "ws_1_2": "ws_1_2",
            "ws_2_3": "ws_2_3",
            "ws_3_4": "ws_3_4",
            "ws_4_6": "ws_4_6",
            "ws_more_that_6": "ws_more_that_6",
            "station_id": "station_id",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ": { 
            "station_id": "station_id",
            "parameter": "parameter",
            "unit": "unit",
            "day1st_result": "day1st_result",
            "day2nd_result": "day2nd_result",
            "day3rd_result": "day3rd_result",
            "std": "std",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ": { //SO2
            "station_id": "station_id",
            "timePeriod": "timePeriod",
            "day1st_result_ppm": "day1st_result_ppm",
            "day2nd_result_ppm": "day2nd_result_ppm",
            "day3rd_result_ppm": "day3rd_result_ppm",
            "certifiedDate": "certifiedDate",
            "expireDate": "expireDate",
            "concentrationPPB": "concentrationPPB",
            "gasCylinder": "gasCylinder",
            "toolAnalyst": "toolAnalyst",
            "toolCalibration": "toolCalibration",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ": {
            "station_id": "station_id",
            "index_name": "index_name",
            "day1st_result_ug_per_m3": "day1st_result_ug_per_m3",
            "day2nd_result_ug_per_m3": "day2nd_result_ug_per_m3",
            "day3rd_result_ug_per_m3": "day3rd_result_ug_per_m3",
            "std_lower": "std_lower",
            "std_higher": "std_higher",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ": {
            "station_id": "station_id",
            "index_name": "index_name",
            "unit": "unit",
            "result": "result",
            "std": "std",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการตรวจวัดระดับเสียงโดยทั่วไป": {
            "station_id": "station_id",
            "timePeriod": "timePeriod",
            "day1st_result": "day1st_result",
            "day2nd_result": "day2nd_result",
            "day3rd_result": "day3rd_result",
            "certifiedDate": "certifiedDate",
            "calibrationRefdB": "calibrationRefdB",
            "slmRead":"slmRead",
            "slmAdjust":"slmAdjust",
            "calSheetNo":"calSheetNo",
            "toolAnalyst":"toolAnalyst",
            "toolCalibration":"toolCalibration",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการตรวจวัดคุณภาพเสียง 90": {
            "station_id": "station_id",
            "timePeriod": "timePeriod",
            "day1st_result": "day1st_result",
            "day2nd_result": "day2nd_result",
            "day3rd_result": "day3rd_result",
            "certifiedDate": "certifiedDate",
            "calibrationRefdB": "calibrationRefdB",
            "slmRead": "slmRead",
            "slmAdjust": "slmAdjust",
            "calSheetNo": "calSheetNo",
            "toolAnalyst":"toolAnalyst",
            "toolCalibration":"toolCalibration",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการติดตามตรวจสอบ": {
            "station_id": "station_id",
            "timePeriod": "timePeriod",
            "day1st_Leq": "day1st_Leq",
            "day1st_L90": "day1st_L90",
            "day2nd_Leq": "day2nd_Leq",
            "day2nd_L90": "day2nd_L90",
            "day3rd_Leq": "day3rd_Leq",
            "day3rd_L90": "day3rd_L90",
            "calibrationRefdB": "calibrationRefdB",
            "slmRead": "slmRead",
            "slmAdjust": "slmAdjust",
            "certifiedDate": "certifiedDate",
            "calSheetNo": "calSheetNo",
            "toolAnalyst":"toolAnalyst",
            "toolCalibration":"toolCalibration",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการตรวจวัดคุณภาพน้ำทะเล": {
            "station_id": "station_id",
            "parameter": "parameter",
            "result": "result",
            "unit": "unit",
            "std_lower": "std_lower",
            "std_higher": "std_higher",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการตรวจวัดคุณภาพน้ำทิ้ง": {
            "station_id": "station_id",
            "index_name": "index_name",
            "result": "result",
            "unit": "unit",
            "std_lower": "std_lower",
            "std_higher": "std_higher",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช": {
            "station_id": "station_id",
            "division": "division",
            "class": "class",
            "order": "order",
            "family": "family",
            "genu": "genu",
            "quantity_per_m3": "quantity_per_m3",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์": {
            "station_id": "station_id",
            "phylum": "phylum",
            "class": "class",
            "order": "order",
            "family": "family",
            "genu": "genu",
            "quantity_per_m3": "quantity_per_m3",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน": {
            "station_id": "station_id",
            "phylum": "phylum",
            "class": "class",
            "order": "order",
            "family": "family",
            "genu": "genu",
            "quantity_per_m2": "quantity_per_m2",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา": {
            "station_id": "station_id",
            "phylum": "phylum",
            "class": "class",
            "order": "order",
            "family": "family",
            "genu": "genu",
            "quantity_per_1000m3": "quantity_per_1000m3",
            "company_id": "company_id",
            "reportBy": "reportBy"
        },
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน": {
            "station_id": "station_id",
            "phylum": "phylum",
            "group_name": "group_name",
            "quantity_per_1000m3": "quantity_per_1000m3",
            "company_id": "company_id",
            "reportBy": "reportBy"
        }
    };

    return mappings[subCategory] || {};
};