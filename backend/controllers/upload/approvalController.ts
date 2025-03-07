import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

// Function to get all pending approvals
export const getPendingApprovals = async (req: Request, res: Response) => {
    try {
        const pool = await connectToDB();
        
        const result = await pool.request()
            .query(`
                SELECT * FROM dbo.UploadedData 
                WHERE approval_status = 'pending'
                ORDER BY upload_date DESC
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
            
            // Update approval status
            await pool.request()
                .input("uploadId", uploadId)
                .input("approvedBy", req.body.userId || "system")
                .input("approvedDate", new Date())
                .query(`
                    UPDATE dbo.UploadedData 
                    SET approval_status = 'approved', 
                        approved_by = @approvedBy,
                        approved_date = @approvedDate
                    WHERE id = @uploadId
                `);
            
            // Get the data details to process it
            const dataResult = await pool.request()
                .input("uploadId", uploadId)
                .query(`SELECT * FROM UploadedData WHERE id = @uploadId`);
                
            const uploadData = dataResult.recordset[0];
            
            // Here you would add logic to process the approved data
            // For example, moving it from a staging table to a production table
            
            // Commit transaction
            await transaction.commit();
            
            res.status(200).json({
                success: true,
                message: "อนุมัติข้อมูลเรียบร้อยแล้ว",
                data: uploadData
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
        
        await pool.request()
            .input("uploadId", uploadId)
            .input("rejectedBy", req.body.userId || "system")
            .input("rejectedDate", new Date())
            .input("rejectionReason", rejectionReason || "")
            .query(`
                UPDATE dbo.UploadedData 
                SET approval_status = 'rejected', 
                    rejected_by = @rejectedBy,
                    rejected_date = @rejectedDate,
                    rejection_reason = @rejectionReason
                WHERE id = @uploadId
            `);
        
        res.status(200).json({
            success: true,
            message: "ปฏิเสธข้อมูลเรียบร้อยแล้ว"
        });
        
    } catch (error) {
        console.error("Error rejecting upload:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการปฏิเสธข้อมูล",
            error: error.message
        });
    }
};