import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Controller for fetching EnhanceTable structure
 * This controller retrieves all available EnhanceTable records from the database
 */
export const getEnhanceTableStructure = async (req: Request, res: Response) => {
    try {
        const pool = await connectToDB();
        
        // Query to get all EnhanceTable records
        const result = await pool.request()
            .query(`
                SELECT 
                    enhance_id, 
                    enhanceName, 
                    valueName, 
                    sub_id 
                FROM 
                    dbo.EnhanceTable 
                ORDER BY 
                    enhanceName
            `);
        
        // Return the data as JSON
        res.status(200).json({
            success: true,
            data: result.recordset
        });
        
    } catch (error) {
        console.error("Error fetching EnhanceTable structure:", error);
        res.status(500).json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลโครงสร้างตาราง", 
            error: error.message 
        });
    }
};