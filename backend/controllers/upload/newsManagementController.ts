import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Controller for managing news data deletion and updates
 */

// Function to delete news data by date range or status
export const deleteNewsByCondition = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, status, category } = req.body;
        
        if (!startDate && !endDate && !status && !category) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุเงื่อนไขในการลบข้อมูลอย่างน้อย 1 เงื่อนไข (วันที่เริ่มต้น, วันที่สิ้นสุด, สถานะ, หรือหมวดหมู่)"
            });
        }
        
        const pool = await connectToDB();
        let transaction = null;
        
        try {
            // Begin transaction
            transaction = pool.transaction();
            await transaction.begin();
            
            // Build WHERE clause based on provided conditions
            let whereConditions = [];
            let queryParams: any = {};
            
            if (startDate) {
                whereConditions.push("Create_at >= @startDate");
                queryParams.startDate = new Date(startDate);
            }
            
            if (endDate) {
                whereConditions.push("Create_at <= @endDate");
                queryParams.endDate = new Date(endDate);
            }
            
            if (status) {
                whereConditions.push("News_status = @status");
                queryParams.status = status;
            }
            
            if (category) {
                whereConditions.push("News_category = @category");
                queryParams.category = category;
            }
            
            const whereClause = whereConditions.join(" AND ");
            
            // Count records before deletion for reporting
            const countRequest = transaction.request();
            
            // Add parameters to the request
            for (const [key, value] of Object.entries(queryParams)) {
                countRequest.input(key, value);
            }
            
            const countResult = await countRequest.query(`
                SELECT COUNT(*) as count 
                FROM dbo.News 
                WHERE ${whereClause}
            `);
                
            const recordCount = countResult.recordset[0].count;
            
            if (recordCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลตามเงื่อนไขที่ระบุ"
                });
            }
            
            // Delete data from the News table
            // Note: NewsImages will be deleted automatically due to CASCADE constraint
            const deleteRequest = transaction.request();
            
            // Add parameters to the request
            for (const [key, value] of Object.entries(queryParams)) {
                deleteRequest.input(key, value);
            }
            
            await deleteRequest.query(`
                DELETE FROM dbo.News 
                WHERE ${whereClause}
            `);
            
            // Commit transaction
            await transaction.commit();
            
            res.status(200).json({
                success: true,
                message: `ลบข้อมูลข่าวเรียบร้อยแล้ว จำนวน ${recordCount} รายการ`,
                data: {
                    conditions: {
                        startDate: startDate || null,
                        endDate: endDate || null,
                        status: status || null,
                        category: category || null
                    },
                    recordCount
                }
            });
            
        } catch (error) {
            // If there's an error, roll back the transaction
            if (transaction) await transaction.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error("Error deleting news data:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการลบข้อมูลข่าว",
            error: error.message
        });
    }
};

// Function to delete uploaded files by date range or status
export const deleteUploadedFilesByCondition = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, status, uploadedBy, periodId } = req.body;
        
        if (!startDate && !endDate && !status && !uploadedBy && !periodId) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุเงื่อนไขในการลบข้อมูลอย่างน้อย 1 เงื่อนไข (วันที่เริ่มต้น, วันที่สิ้นสุด, สถานะ, ผู้อัปโหลด หรือรหัสช่วงเวลา)"
            });
        }
        
        const pool = await connectToDB();
        let transaction = null;
        
        try {
            // Begin transaction
            transaction = pool.transaction();
            await transaction.begin();
            
            // Build WHERE clause based on provided conditions
            let whereConditions = [];
            let queryParams: any = {};
            
            if (startDate) {
                whereConditions.push("upload_date >= @startDate");
                queryParams.startDate = new Date(startDate);
            }
            
            if (endDate) {
                whereConditions.push("upload_date <= @endDate");
                queryParams.endDate = new Date(endDate);
            }
            
            if (status) {
                whereConditions.push("status = @status");
                queryParams.status = status;
            }
            
            if (uploadedBy) {
                whereConditions.push("uploaded_by = @uploadedBy");
                queryParams.uploadedBy = uploadedBy;
            }
            
            if (periodId) {
                whereConditions.push("period_id = @periodId");
                queryParams.periodId = periodId;
            }
            
            const whereClause = whereConditions.join(" AND ");
            
            // Count records before deletion for reporting
            const countRequest = transaction.request();
            
            // Add parameters to the request
            for (const [key, value] of Object.entries(queryParams)) {
                countRequest.input(key, value);
            }
            
            const countResult = await countRequest.query(`
                SELECT COUNT(*) as count 
                FROM dbo.UploadedFiles 
                WHERE ${whereClause}
            `);
                
            const recordCount = countResult.recordset[0].count;
            
            if (recordCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลตามเงื่อนไขที่ระบุ"
                });
            }
            
            // Delete data from the UploadedFiles table
            const deleteRequest = transaction.request();
            
            // Add parameters to the request
            for (const [key, value] of Object.entries(queryParams)) {
                deleteRequest.input(key, value);
            }
            
            await deleteRequest.query(`
                DELETE FROM dbo.UploadedFiles 
                WHERE ${whereClause}
            `);
            
            // Commit transaction
            await transaction.commit();
            
            res.status(200).json({
                success: true,
                message: `ลบข้อมูลไฟล์อัปโหลดเรียบร้อยแล้ว จำนวน ${recordCount} รายการ`,
                data: {
                    conditions: {
                        startDate: startDate || null,
                        endDate: endDate || null,
                        status: status || null,
                        uploadedBy: uploadedBy || null,
                        periodId: periodId || null
                    },
                    recordCount
                }
            });
            
        } catch (error) {
            // If there's an error, roll back the transaction
            if (transaction) await transaction.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error("Error deleting uploaded files data:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการลบข้อมูลไฟล์อัปโหลด",
            error: error.message
        });
    }
};