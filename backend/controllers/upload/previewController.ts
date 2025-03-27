import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Controller for fetching preview data from temporary tables
 * This allows approvers to view the data before approving or rejecting it
 */
export const getPreviewData = async (req: Request, res: Response) => {
    try {
        const { uploadId } = req.params;
        const { page = 1, pageSize = 10 } = req.query;
        
        // Convert to numbers and validate
        const pageNum = parseInt(page as string) || 1;
        const pageSizeNum = parseInt(pageSize as string) || 10;
        
        if (!uploadId) {
            res.status(400).json({
                success: false,
                message: "กรุณาระบุไอดีของไฟล์ที่ต้องการดูตัวอย่างข้อมูล"
            });
            return
        }
        
        const pool = await connectToDB();
        
        // Get the upload data including parsed JSON data and target table
        const uploadResult = await pool.request()
            .input("uploadId", uploadId)
            .query(`
                SELECT 
                    upload_id, filename, period_id, 
                    parsed_data, target_table, column_mapping, upload_date
                FROM dbo.UploadedFiles 
                WHERE upload_id = @uploadId
            `);
        
        if (uploadResult.recordset.length === 0) {
            res.status(404).json({
                success: false,
                message: "ไม่พบข้อมูลสำหรับไฟล์ที่อัปโหลด"
            });
            return;
        }
        
        const uploadData = uploadResult.recordset[0];
        const parsedData = JSON.parse(uploadData.parsed_data || '[]');
        const columnMapping = JSON.parse(uploadData.column_mapping || '{}');
        
        // Create column information from the column mapping
        const columns = Object.entries(columnMapping).map(([fieldName, columnName]) => ({
            COLUMN_NAME: fieldName,
            DATA_TYPE: 'varchar'
        }));
        
        // Calculate pagination
        const startIndex = (pageNum - 1) * pageSizeNum;
        const endIndex = startIndex + pageSizeNum;
        const paginatedData = parsedData.slice(startIndex, endIndex);
        const totalPages = Math.ceil(parsedData.length / pageSizeNum);
        
        // Prepare file information
        const fileInfo = {
            filename: uploadData.filename,
            upload_date: uploadData.upload_date,
            period_id: uploadData.period_id,
            total_rows: parsedData.length
        };
        
        res.status(200).json({
            success: true,
            data: {
                columns: columns,
                rows: paginatedData,
                totalRows: parsedData.length,
                currentPage: pageNum,
                pageSize: pageSizeNum,
                totalPages: totalPages,
                fileInfo: fileInfo
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