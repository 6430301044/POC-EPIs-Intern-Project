import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Get all available periods with their associated year and semiannual information
 * This will be used in the upload form to replace separate year and period selections
 */
export const getPeriods = async (req: Request, res: Response) => {
    try {
        const pool = await connectToDB();
        
        // Query to get periods with year and semiannual information
        const result = await pool.request()
            .query(`
                SELECT 
                    d.period_id,
                    d.startDate,
                    d.endDate,
                    d.semiannual_id,
                    YEAR(d.startDate) as year,
                    s.semiannual,
                    CASE 
                        WHEN s.semiannual = 1 THEN 'ม.ค. - มิ.ย.'
                        WHEN s.semiannual = 2 THEN 'ก.ค. - ธ.ค.'
                        ELSE 'Unknown'
                    END as periodName
                FROM 
                    dbo.Daysperiod d
                JOIN 
                    dbo.Semiannual s ON d.semiannual_id = s.semiannual_id
                ORDER BY 
                    year DESC, s.semiannual ASC
            `);
            
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error("Error fetching periods:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลช่วงเวลา",
            error: error.message
        });
    }
};