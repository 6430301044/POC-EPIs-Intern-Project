import sql from "mssql";
import { connectToDB } from "../db/dbConfig";

export interface UploadedFile {
    upload_id: number;
    filename: string;
    upload_date: Date;
    uploaded_by: number;
    uploaded_by_username: string;
    year_id: number;
    year_value: string;
    period_id: number;
    period_name: string;
    main_id: number;
    main_name: string;
    sub_id: number;
    sub_name: string;
    status: string;
}

/**
 * Fetches all uploaded files with related data
 * @returns Promise with array of uploaded files
 */
export const getAllUploadedFiles = async (): Promise<UploadedFile[]> => {
    try {
        const pool = await connectToDB();
        const result = await pool.request()
            .query(`
                SELECT 
                    uf.*,
                    u.User_name as uploaded_by_username,
                    y.year,
                    s.semiannualName,
                    mc.mainName,
                    sc.subName
                FROM dbo.UploadedFiles uf
                LEFT JOIN dbo.Users u ON uf.uploaded_by = u.User_id
                LEFT JOIN dbo.Years y ON uf.year_id = y.year_id
                LEFT JOIN dbo.Daysperiod dp ON uf.period_id = dp.period_id
                LEFT JOIN dbo.Semiannual s ON dp.semiannual_id = s.semiannual_id
                LEFT JOIN dbo.Mcategories mc ON uf.main_id = mc.main_id
                LEFT JOIN dbo.SbCategories sc ON uf.sub_id = sc.sub_id
            `);
        return result.recordset;
    } catch (error) {
        console.error('Error fetching uploaded files:', error);
        throw error;
    }
};

/**
 * Fetches a specific uploaded file by its ID
 * @param id - The ID of the uploaded file to fetch
 * @returns Promise with the uploaded file data
 */
export const getUploadedFileById = async (id: number): Promise<UploadedFile | null> => {
    try {
        const pool = await connectToDB();
        const result = await pool.request()
            .input("upload_id", sql.Int, id)
            .query(`
                SELECT 
                    uf.*,
                    u.username as uploaded_by_username,
                    y.year_value,
                    dp.period_name,
                    mc.main_name,
                    sc.sub_name
                FROM UploadedFiles uf
                LEFT JOIN Users u ON uf.uploaded_by = u.User_id
                LEFT JOIN Years y ON uf.year_id = y.year_id
                LEFT JOIN Daysperiod dp ON uf.period_id = dp.period_id
                LEFT JOIN Mcategories mc ON uf.main_id = mc.main_id
                LEFT JOIN SbCategories sc ON uf.sub_id = sc.sub_id
                WHERE uf.upload_id = @upload_id
            `);

        return result.recordset[0] || null;
    } catch (error) {
        console.error('Error fetching uploaded file by ID:', error);
        throw error;
    }
};