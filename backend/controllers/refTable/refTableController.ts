import { Request, Response } from "express";
import sql from "mssql";
import { connectToDB } from "../../db/dbConfig";

// Get all reference data pending approvals
export const getAllPendingApprovals = async (req: Request, res: Response) => {
    try {
        const pool = await connectToDB();
        const result = await pool.request()
            .query(`
                SELECT r.*, u.username as uploaded_by_username
                FROM ReferenceDataPendingApproval r
                LEFT JOIN Users u ON r.uploaded_by = u.User_id
                ORDER BY r.upload_date DESC
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching reference data pending approvals:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
};

// Get reference data pending approval by ID
export const getPendingApprovalById = async (req: Request, res: Response) => {
    try {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("upload_id", sql.Int, req.params.id)
            .query(`
                SELECT r.*, u.username as uploaded_by_username
                FROM ReferenceDataPendingApproval r
                LEFT JOIN Users u ON r.uploaded_by = u.User_id
                WHERE r.upload_id = @upload_id
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูล" });
        }
        
        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Error fetching reference data pending approval:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
};