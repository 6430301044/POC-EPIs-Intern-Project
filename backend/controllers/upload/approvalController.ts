import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

// Function to get all pending approvals
export const getPendingApprovals = async (req: Request, res: Response) => {
    try {
        const pool = await connectToDB();
        
        const result = await pool.request()
            .query(`
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
            data: result.recordset
        });
    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลที่รอการอนุมัติ",
            error: error.message
        });
    }
};

// Function to approve an uploaded file
export const approveUpload = async (req: Request, res: Response) => {
    try {
        const { uploadId } = req.params;
        
        if (!uploadId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุไอดีของไฟล์ที่ต้องการอนุมัติ"
            });
        }
        
        const pool = await connectToDB();
        let transaction = null;
        
        try {
            // Begin transaction
            transaction = pool.transaction();
            await transaction.begin();
            
            // Get the upload data including parsed JSON data
            const uploadResult = await transaction.request()
                .input("uploadId", uploadId)
                .query(`
                    SELECT 
                        upload_id, filename, period_id, main_id, sub_id, 
                        parsed_data, target_table, column_mapping
                    FROM dbo.UploadedFiles 
                    WHERE upload_id = @uploadId AND status = 'รอการอนุมัติ'
                `);
            
            if (uploadResult.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลที่รอการอนุมัติตาม ID ที่ระบุ"
                });
            }
            
            const uploadData = uploadResult.recordset[0];
            const parsedData = JSON.parse(uploadData.parsed_data || '[]');
            const targetTable = uploadData.target_table;
            const columnMapping = JSON.parse(uploadData.column_mapping || '{}');
            
            if (!parsedData.length || !targetTable || !columnMapping) {
                throw new Error("ข้อมูลไม่ครบถ้วนสำหรับการอนุมัติ");
            }
            
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
                    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
                        request.input(columnName as string, record[fieldName]);
                        columns.push(columnName as string);
                        paramNames.push(`@${columnName}`);
                    }
                }

                // Skip if no valid fields found
                if (columns.length <= 1) { // Only period_id
                    console.warn("Skipping record with no valid fields");
                    continue;
                }

                const query = `INSERT INTO ${targetTable} (${columns.join(', ')}) VALUES (${paramNames.join(', ')})`;
                await request.query(query);
            }
            
            // Update the status to approved
            await transaction.request()
                .input("uploadId", uploadId)
                .query(`
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
                    recordCount: parsedData.length
                }
            });
            
        } catch (error) {
            // If there's an error, roll back the transaction
            if (transaction) await transaction.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error("Error approving upload:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการอนุมัติข้อมูล",
            error: error.message
        });
    }
};

// Function to reject an uploaded file
export const rejectUpload = async (req: Request, res: Response) => {
    try {
        const { uploadId } = req.params;
        const { rejectionReason } = req.body;
        
        if (!uploadId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุไอดีของไฟล์ที่ต้องการปฏิเสธ"
            });
        }
        
        const pool = await connectToDB();
        let transaction = null;
        
        try {
            // Begin transaction
            transaction = pool.transaction();
            await transaction.begin();
            
            // Check if the upload exists and is pending approval
            const checkResult = await transaction.request()
                .input("uploadId", uploadId)
                .query(`SELECT upload_id, filename FROM dbo.UploadedFiles WHERE upload_id = @uploadId AND status = 'รอการอนุมัติ'`);
                
            if (checkResult.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลที่รอการอนุมัติตาม ID ที่ระบุ"
                });
            }
            
            // Update the status to rejected
            await transaction.request()
                .input("uploadId", uploadId)
                .query(`
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
                    filename: checkResult.recordset[0].filename
                }
            });
        } catch (error) {
            // If there's an error, roll back the transaction
            if (transaction) await transaction.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error("Error rejecting upload:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการปฏิเสธข้อมูล",
            error: error.message
        });
    }
};