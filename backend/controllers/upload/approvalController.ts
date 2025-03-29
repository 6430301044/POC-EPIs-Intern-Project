import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";
import fs from "fs";
import path from "path";

// Function to get all pending approvals
export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const pool = await connectToDB();

    const result = await pool.request().query(`
                SELECT 
                    u.upload_id as id,
                    u.filename as file_name,
                    u.upload_date,
                    u.period_id,
                    CASE
                        WHEN s.semiannual = 1 THEN 'ม.ค. - มิ.ย.'
                        WHEN s.semiannual = 2 THEN 'ก.ค. - ธ.ค.'
                        ELSE 'Unknown'
                    END as period_name,
                    YEAR(d.startDate) as year,
                    m.mainName as mainCategory,
                    sb.subName as subCategory,
                    usr.User_name as uploaded_by
                FROM 
                    dbo.UploadedFiles u
                JOIN 
                    dbo.Daysperiod d ON u.period_id = d.period_id
                JOIN 
                    dbo.Semiannual s ON d.semiannual_id = s.semiannual_id
                JOIN 
                    dbo.Mcategories m ON u.main_id = m.main_id
                JOIN 
                    dbo.SbCategories sb ON u.sub_id = sb.sub_id
                JOIN 
                    dbo.Users usr ON u.uploaded_by = usr.User_id
                WHERE 
                    u.status = 'รอการอนุมัติ'
                ORDER BY 
                    u.upload_date DESC
            `);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลที่รอการอนุมัติ",
      error: error.message,
    });
  }
};

// Function to get column mapping based on subcategory
const getColumnMapping = (subCategory: string): { [key: string]: string } => {
  // Define column mappings for each subcategory
  const mappings: { [key: string]: { [key: string]: string } } = {
    ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง: {
      //WDWS
      windDirection: "windDirection",
      ws_05_1: "ws_05_1",
      ws_1_2: "ws_1_2",
      ws_2_3: "ws_2_3",
      ws_3_4: "ws_3_4",
      ws_4_6: "ws_4_6",
      ws_more_that_6: "ws_more_that_6",
      station_id: "station_id",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ: {
      station_id: "station_id",
      parameter: "parameter",
      unit: "unit",
      day1st_result: "day1st_result",
      day2nd_result: "day2nd_result",
      day3rd_result: "day3rd_result",
      std: "std",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ: {
      //SO2
      station_id: "station_id",
      timePeriod: "timePeriod",
      day1st_result_ppm: "day1st_result_ppm",
      day2nd_result_ppm: "day2nd_result_ppm",
      day3rd_result_ppm: "day3rd_result_ppm",
      certifiedDate: "certifiedDate",
      expireDate: "expireDate",
      concentrationPPB: "concentrationPPB",
      gasCylinder: "gasCylinder",
      toolAnalyst: "toolAnalyst",
      toolCalibration: "toolCalibration",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ: {
      station_id: "station_id",
      index_name: "index_name",
      day1st_result_ug_per_m3: "day1st_result_ug_per_m3",
      day2nd_result_ug_per_m3: "day2nd_result_ug_per_m3",
      day3rd_result_ug_per_m3: "day3rd_result_ug_per_m3",
      std_lower: "std_lower",
      std_higher: "std_higher",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ: {
      station_id: "station_id",
      index_name: "index_name",
      unit: "unit",
      result: "result",
      std: "std",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    ผลการตรวจวัดระดับเสียงโดยทั่วไป: {
      station_id: "station_id",
      timePeriod: "timePeriod",
      day1st_result: "day1st_result",
      day2nd_result: "day2nd_result",
      day3rd_result: "day3rd_result",
      certifiedDate: "certifiedDate",
      calibrationRefdB: "calibrationRefdB",
      slmRead: "slmRead",
      slmAdjust: "slmAdjust",
      calSheetNo: "calSheetNo",
      toolAnalyst: "toolAnalyst",
      toolCalibration: "toolCalibration",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    "ผลการตรวจวัดคุณภาพเสียง 90": {
      station_id: "station_id",
      timePeriod: "timePeriod",
      day1st_result: "day1st_result",
      day2nd_result: "day2nd_result",
      day3rd_result: "day3rd_result",
      certifiedDate: "certifiedDate",
      calibrationRefdB: "calibrationRefdB",
      slmRead: "slmRead",
      slmAdjust: "slmAdjust",
      calSheetNo: "calSheetNo",
      toolAnalyst: "toolAnalyst",
      toolCalibration: "toolCalibration",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    ผลการติดตามตรวจสอบ: {
      station_id: "station_id",
      timePeriod: "timePeriod",
      day1st_Leq: "day1st_Leq",
      day1st_L90: "day1st_L90",
      day2nd_Leq: "day2nd_Leq",
      day2nd_L90: "day2nd_L90",
      day3rd_Leq: "day3rd_Leq",
      day3rd_L90: "day3rd_L90",
      calibrationRefdB: "calibrationRefdB",
      slmRead: "slmRead",
      slmAdjust: "slmAdjust",
      certifiedDate: "certifiedDate",
      calSheetNo: "calSheetNo",
      toolAnalyst: "toolAnalyst",
      toolCalibration: "toolCalibration",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    ผลการตรวจวัดคุณภาพน้ำทะเล: {
      station_id: "station_id",
      parameter: "parameter",
      result: "result",
      unit: "unit",
      std_lower: "std_lower",
      std_higher: "std_higher",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    ผลการตรวจวัดคุณภาพน้ำทิ้ง: {
      station_id: "station_id",
      index_name: "index_name",
      result: "result",
      unit: "unit",
      std_lower: "std_lower",
      std_higher: "std_higher",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช": {
      station_id: "station_id",
      division: "division",
      class: "class",
      order: "order",
      family: "family",
      genu: "genu",
      quantity_per_m3: "quantity_per_m3",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์": {
      station_id: "station_id",
      phylum: "phylum",
      class: "class",
      order: "order",
      family: "family",
      genu: "genu",
      quantity_per_m3: "quantity_per_m3",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน": {
      station_id: "station_id",
      phylum: "phylum",
      class: "class",
      order: "order",
      family: "family",
      genu: "genu",
      quantity_per_m2: "quantity_per_m2",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา": {
      station_id: "station_id",
      phylum: "phylum",
      class: "class",
      order: "order",
      family: "family",
      genu: "genu",
      quantity_per_1000m3: "quantity_per_1000m3",
      company_id: "company_id",
      reportBy: "reportBy",
    },
    "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน": {
      station_id: "station_id",
      phylum: "phylum",
      group_name: "group_name",
      quantity_per_1000m3: "quantity_per_1000m3",
      company_id: "company_id",
      reportBy: "reportBy",
    },
  };

  return mappings[subCategory] || {};
};

const getColumnMappingEnhTable = (enhanceId: string): { [key: string]: string } => {
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
  
  console.log(`Getting enhance mapping for ID: ${enhanceId}`);
  console.log(`Mapping found: ${JSON.stringify(specificMappings[enhanceId] || defaultMapping)}`);
  
  return specificMappings[enhanceId] || defaultMapping;
};

// Function to approve an uploaded file
export const approveUpload = async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;

    if (!uploadId) {
      res.status(400).json({
        success: false,
        message: "กรุณาระบุไอดีของไฟล์ที่ต้องการอนุมัติ",
      });
      return;
    }

    const pool = await connectToDB();
    let transaction: any = null;

    try {
      // Begin transaction
      transaction = pool.transaction();
      await transaction.begin();

      // Get the upload data including parsed JSON data
      const uploadResult = await transaction
        .request()
        .input("uploadId", uploadId).query(`
                    SELECT 
                        u.upload_id, u.filename, u.period_id, u.main_id, u.sub_id, e.enhance_id,
                        u.parsed_data, u.target_table, u.column_mapping
                    FROM dbo.UploadedFiles u
                    JOIN dbo.EnhanceTable e ON e.sub_id = u.sub_id
                    WHERE u.upload_id = @uploadId AND u.status = 'รอการอนุมัติ'
                `);

      if (uploadResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลที่รอการอนุมัติตาม ID ที่ระบุ",
        });
        return;
      }

      const uploadData = uploadResult.recordset[0];
      const parsedData = JSON.parse(uploadData.parsed_data || "[]");
      const targetTable = uploadData.target_table;

      if (!parsedData.length || !targetTable) {
        throw new Error("ข้อมูลไม่ครบถ้วนสำหรับการอนุมัติ");
      }

      // Get subcategory name to determine column mapping
      const subCategoryResult = await transaction
        .request()
        .input("subId", uploadData.sub_id)
        .query(`SELECT subName FROM dbo.SbCategories WHERE sub_id = @subId`);
        // console.log(`subCategoryResult: ${JSON.stringify(subCategoryResult)}`);
        // console.log(`uploadData.sub_id: ${JSON.stringify(uploadData.sub_id)}`);

      const enhTableResult = await transaction
       .request()
       .input("enhanceId", uploadData.enhance_id)
       .query(`SELECT enhance_id FROM dbo.EnhanceTable WHERE enhance_id = @enhanceId`);
        // console.log(`enhTableResult: ${JSON.stringify(subCategoryResult)}`);
        // console.log(`uploadData.enhance_id: ${JSON.stringify(uploadData.enhance_id)}`);

      const subCategory = subCategoryResult.recordset[0]?.subName || "";
      const enhTable = enhTableResult.recordset[0]?.enhance_id || "";
      const columnMappingEnvTable = getColumnMapping(subCategory);
      const columnMappingEnhTable = getColumnMappingEnhTable(enhTable);
      const isEnvTable = targetTable.startsWith("Env_");
      const columnMapping =
        isEnvTable
          ? columnMappingEnvTable
          : columnMappingEnhTable;

      // Insert the approved data into the target table
      for (const record of parsedData) {
        // Build dynamic query based on the record fields and column mapping
        const columns: string[] = [];
        const paramNames: string[] = [];
        const request = transaction.request();

        // Add period_id to all records
        request.input("period_id", uploadData.period_id);
        columns.push("period_id");
        paramNames.push("@period_id");

        // Map record fields to database columns
        for (const [fieldName, columnName] of Object.entries(columnMapping)) {
          if (
            record[fieldName] !== undefined &&
            record[fieldName] !== null &&
            record[fieldName] !== ""
          ) {
            request.input(columnName as string, record[fieldName]);
            columns.push(columnName as string);
            paramNames.push(`@${columnName}`);
          }
        }

        // Skip if no valid fields found
        if (columns.length <= 1) {
          // Only period_id
          console.warn("Skipping record with no valid fields");
          continue;
        }

        const query = `INSERT INTO ${targetTable} (${columns.join(
          ", "
        )}) VALUES (${paramNames.join(", ")})`;
        await request.query(query);
      }

      // Update the status to approved
      await transaction.request().input("uploadId", uploadId).query(`
                    UPDATE dbo.UploadedFiles 
                    SET status = 'อนุมัติแล้ว'
                    WHERE upload_id = @uploadId
                `);

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "อนุมัติข้อมูลเรียบร้อยแล้ว",
        data: {
          uploadId,
          filename: uploadData.filename,
          recordCount: parsedData.length,
        },
      });
      return;
    } catch (error) {
      // If there's an error, roll back the transaction
      if (transaction) {
        console.error("Rolling back transaction:", error);
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error approving upload:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอนุมัติข้อมูล",
      error: error.message,
    });
  }
};

// Function to reject an uploaded file
export const rejectUpload = async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;
    const { rejectionReason } = req.body;

    if (!uploadId) {
      res.status(400).json({
        success: false,
        message: "กรุณาระบุไอดีของไฟล์ที่ต้องการปฏิเสธ",
      });
      return;
    }

    const pool = await connectToDB();
    let transaction: any = null;

    try {
      // Begin transaction
      transaction = pool.transaction();
      await transaction.begin();

      // Check if the upload exists and is pending approval
      const checkResult = await transaction
        .request()
        .input("uploadId", uploadId)
        .query(
          `SELECT upload_id, filename FROM dbo.UploadedFiles WHERE upload_id = @uploadId AND status = 'รอการอนุมัติ'`
        );

      if (checkResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลที่รอการอนุมัติตาม ID ที่ระบุ",
        });
        return;
      }

      // Update the status to rejected
      await transaction.request().input("uploadId", uploadId).query(`
                    UPDATE dbo.UploadedFiles 
                    SET status = 'ปฏิเสธแล้ว'
                    WHERE upload_id = @uploadId
                `);

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "ปฏิเสธข้อมูลเรียบร้อยแล้ว",
        data: {
          uploadId,
          filename: checkResult.recordset[0].filename,
        },
      });
      return;
    } catch (error) {
      // If there's an error, roll back the transaction
      if (transaction) {
        console.error("Rolling back transaction:", error);
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error rejecting upload:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการปฏิเสธข้อมูล",
      error: error.message,
    });
  }
};

// Function to reject a reference data upload
export const rejectReferenceUpload = async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;
    const { rejectionReason } = req.body;

    if (!uploadId) {
      res.status(400).json({
        success: false,
        message: "กรุณาระบุไอดีของไฟล์ที่ต้องการปฏิเสธ",
      });
      return;
    }

    const pool = await connectToDB();
    let transaction: any = null;

    try {
      // Begin transaction
      transaction = pool.transaction();
      await transaction.begin();

      // Check if the upload exists and is pending approval
      const checkResult = await transaction
        .request()
        .input("uploadId", uploadId)
        .query(
          `SELECT upload_id, filename FROM dbo.ReferenceDataPendingApproval WHERE upload_id = @uploadId AND status = 'รอการอนุมัติ'`
        );

      if (checkResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลที่รอการอนุมัติตาม ID ที่ระบุ",
        });
        return;
      }

      const fileInfo = checkResult.recordset[0];

      // Update the status to rejected
      await transaction
        .request()
        .input("uploadId", uploadId)
        .input("rejectionReason", rejectionReason || "ไม่ระบุเหตุผล").query(`
                    UPDATE dbo.ReferenceDataPendingApproval 
                    SET 
                        status = 'ปฏิเสธแล้ว'
                    WHERE upload_id = @uploadId
                `);

      // Commit transaction
      await transaction.commit();

      // Note: We can't delete the file since system_filename doesn't exist in the database
      // If file deletion is needed, we would need to add the system_filename column to the database
      console.log("File rejection completed for upload ID:", uploadId);

      res.status(200).json({
        success: true,
        message: "ปฏิเสธข้อมูลอ้างอิงเรียบร้อยแล้ว",
        data: {
          uploadId,
          filename: fileInfo.filename,
        },
      });
      return;
    } catch (error) {
      // If there's an error, roll back the transaction
      if (transaction) {
        console.error("Rolling back transaction:", error);
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error rejecting reference data upload:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการปฏิเสธข้อมูลอ้างอิง",
      error: error.message,
    });
  }
};

// Function to get all pending reference data approvals
export const getPendingReferenceApprovals = async (
  req: Request,
  res: Response
) => {
  try {
    const pool = await connectToDB();

    const result = await pool.request().query(`
                SELECT 
                    r.upload_id as id,
                    r.filename as file_name,
                    r.upload_date,
                    r.target_table as table_name,
                    r.uploaded_by,
                    u.User_name as uploaded_by_name
                FROM 
                    dbo.ReferenceDataPendingApproval r
                LEFT JOIN
                    dbo.Users u ON r.uploaded_by = u.User_id
                WHERE 
                    r.status = 'รอการอนุมัติ'
                ORDER BY 
                    r.upload_date DESC
            `);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
    return;
  } catch (error) {
    console.error("Error fetching pending reference data approvals:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลที่รอการอนุมัติ",
      error: error.message,
    });
  }
};

// Function to get preview data for a reference data upload
export const getPreviewReferenceData = async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    // Convert to numbers and validate
    const pageNum = parseInt(page as string) || 1;
    const pageSizeNum = parseInt(pageSize as string) || 10;

    if (!uploadId) {
      res.status(400).json({
        success: false,
        message: "กรุณาระบุไอดีของไฟล์ที่ต้องการดูตัวอย่าง",
      });
      return;
    }

    const pool = await connectToDB();

    // Get the upload data including parsed JSON data
    const uploadResult = await pool.request().input("uploadId", uploadId)
      .query(`
                SELECT 
                    upload_id, filename, target_table, 
                    parsed_data, upload_date
                FROM dbo.ReferenceDataPendingApproval 
                WHERE upload_id = @uploadId AND status = 'รอการอนุมัติ'
            `);

    if (uploadResult.recordset.length === 0) {
      res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลที่รอการอนุมัติตาม ID ที่ระบุ",
      });
      return;
    }

    const uploadData = uploadResult.recordset[0];
    const parsedData = JSON.parse(uploadData.parsed_data || "[]");
    const targetTable = uploadData.target_table;

    // Get table schema
    let excludeColumns;
    
    // ถ้าเป็นตาราง Mcategories ให้แสดง main_id
    if (targetTable === 'Mcategories') {
      excludeColumns = "'main_id'";
    } else {
      excludeColumns = "'enhance_id', 'company_id', 'station_id', 'period_id', 'sub_id'";
    }
    
    const schemaResult = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${targetTable}'
                AND COLUMN_NAME NOT IN (${excludeColumns})
            `);

    // Calculate pagination
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedData = parsedData.slice(startIndex, endIndex);

    // Return preview data with pagination
    res.status(200).json({
      success: true,
      data: {
        columns: schemaResult.recordset,
        rows: paginatedData,
        totalRows: parsedData.length,
        currentPage: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(parsedData.length / pageSizeNum),
        fileInfo: {
          filename: uploadData.filename,
          upload_date: uploadData.upload_date,
          total_rows: parsedData.length,
        },
      },
    });
    return;
  } catch (error) {
    console.error("Error fetching reference data preview:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลตัวอย่าง",
      error: error.message,
    });
  }
};

// Function to approve a reference data upload
export const approveReferenceUpload = async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;

    if (!uploadId) {
      res.status(400).json({
        success: false,
        message: "กรุณาระบุไอดีของไฟล์ที่ต้องการอนุมัติ",
      });
      return;
    }

    const pool = await connectToDB();
    let transaction: any = null;

    try {
      // Begin transaction
      transaction = pool.transaction();
      await transaction.begin();

      // Get the upload data including parsed JSON data
      const uploadResult = await transaction
        .request()
        .input("uploadId", uploadId).query(`
                    SELECT 
                        upload_id, filename, target_table, 
                        parsed_data
                    FROM dbo.ReferenceDataPendingApproval 
                    WHERE upload_id = @uploadId AND status = 'รอการอนุมัติ'
                `);

      if (uploadResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลที่รอการอนุมัติตาม ID ที่ระบุ",
        });
        return;
      }

      const uploadData = uploadResult.recordset[0];
      const parsedData = JSON.parse(uploadData.parsed_data || "[]");
      const targetTable = uploadData.target_table;

      if (!parsedData.length || !targetTable) {
        throw new Error("ข้อมูลไม่ครบถ้วนสำหรับการอนุมัติ");
      }

      // Get table schema to determine valid columns
      const schemaResult = await transaction.request().query(`
                    SELECT COLUMN_NAME, DATA_TYPE 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = '${targetTable}'
                `);

      const validColumns = schemaResult.recordset.map((col) => col.COLUMN_NAME);

      // Insert the approved data into the target reference table
      let insertedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const errors: Array<{ row: any; error: any }> = [];

      for (const record of parsedData) {
        try {
          // Filter out invalid columns
          const filteredRow = {};
          for (const key in record) {
            if (validColumns.includes(key)) {
              filteredRow[key] = record[key];
            }
          }

          // Skip if no valid columns
          if (Object.keys(filteredRow).length === 0) {
            skippedCount++;
            continue;
          }

          // Build dynamic SQL for insert
          const columns = Object.keys(filteredRow).join(", ");
          const paramNames = Object.keys(filteredRow)
            .map((key) => `@${key}`)
            .join(", ");

          const request = transaction.request();

          // Add parameters
          for (const key in filteredRow) {
            request.input(key, filteredRow[key]);
          }

          // Execute insert
          await request.query(`
                        INSERT INTO dbo.${targetTable} (${columns})
                        VALUES (${paramNames})
                    `);

          insertedCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            row: record,
            error: error.message,
          });
        }
      }

      // Update the status to approved
      await transaction.request().input("uploadId", uploadId).query(`
                    UPDATE dbo.ReferenceDataPendingApproval 
                    SET status = 'อนุมัติแล้ว'
                    WHERE upload_id = @uploadId
                `);

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "อนุมัติข้อมูลอ้างอิงเรียบร้อยแล้ว",
        data: {
          uploadId,
          filename: uploadData.filename,
          recordCount: parsedData.length,
          insertedCount,
          skippedCount,
          errorCount,
        },
      });
      return;
    } catch (error) {
      // If there's an error, roll back the transaction
      if (transaction) {
        console.error("Rolling back transaction:", error);
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error approving reference data upload:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอนุมัติข้อมูลอ้างอิง",
      error: error.message,
    });
  }
};
