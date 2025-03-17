import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Controller for fetching preview data from temporary tables
 * This allows approvers to view the data before approving or rejecting it
 */
export const getPreviewData = async (req: Request, res: Response) => {
    try {
        const { uploadId } = req.params;
        
        if (!uploadId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุไอดีของไฟล์ที่ต้องการดูตัวอย่างข้อมูล"
            });
        }
        
        const pool = await connectToDB();
        
        // Get the temporary table name from UploadTempTables
        const tempTableResult = await pool.request()
            .input("uploadId", uploadId)
            .query(`
                SELECT temp_table_name, target_table 
                FROM dbo.UploadTempTables 
                WHERE upload_id = @uploadId
            `);
        
        if (tempTableResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบข้อมูลตัวอย่างสำหรับไฟล์ที่อัปโหลด"
            });
        }
        
        const { temp_table_name } = tempTableResult.recordset[0];
        
        // Get data from the temporary table
        const dataResult = await pool.request()
            .query(`SELECT TOP 100 * FROM ${temp_table_name}`);
        
        // Get column information
        const columnResult = await pool.request()
            .query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${temp_table_name.replace(/\[|\]/g, '')}'
            `);
        
        // Get upload information
        const uploadResult = await pool.request()
            .input("uploadId", uploadId)
            .query(`
                SELECT 
                    u.filename, 
                    u.upload_date, 
                    u.period_id,
                    COUNT(*) as total_rows 
                FROM 
                    dbo.UploadedFiles u 
                WHERE 
                    u.upload_id = @uploadId
                GROUP BY 
                    u.filename, u.upload_date, u.period_id
            `);
        
        // Count total rows in the temporary table
        const countResult = await pool.request()
            .query(`SELECT COUNT(*) as total FROM ${temp_table_name}`);
        
        res.status(200).json({
            success: true,
            data: {
                columns: columnResult.recordset,
                rows: dataResult.recordset,
                totalRows: countResult.recordset[0].total,
                fileInfo: uploadResult.recordset[0] || {}
            }
        });
        
    } catch (error) {
        console.error("Error fetching preview data:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลตัวอย่าง",
            error: error.message
        });
    }
};