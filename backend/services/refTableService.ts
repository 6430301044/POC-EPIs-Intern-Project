import sql from "mssql";
import { connectToDB } from "../db/dbConfig";

export interface PendingApproval {
    id: number;
    file_name: string;
    upload_date: Date;
    period_id: number;
    period_name: string;
    year: number;
    mainCategory: string;
    subCategory: string;
    uploaded_by: string;
}

/**
 * Fetches all reference data pending approvals
 * @returns Promise with array of pending approvals
 */
export const getAllPendingApprovals = async (): Promise<PendingApproval[]> => {
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
        return result.recordset;
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
    }
};

/**
 * Fetches a specific pending approval by its ID
 * @param id - The ID of the pending approval to fetch
 * @returns Promise with the pending approval data
 */
export const getPendingApprovalById = async (id: number): Promise<PendingApproval | null> => {
    try {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("id", sql.Int, id)
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
                    u.upload_id = @id AND
                    u.status = 'รอการอนุมัติ'
            `);

        return result.recordset[0] || null;
    } catch (error) {
        console.error('Error fetching pending approval by ID:', error);
        throw error;
    }
};