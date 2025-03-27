import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Controller for managing data deletion and updates based on year and period
 */

// Function to delete data by year and period
export const deleteDataByPeriod = async (req: Request, res: Response) => {
    try {
        const { periodId, targetTable } = req.body;
        
        if (!periodId || !targetTable) {
            res.status(400).json({
                success: false,
                message: "กรุณาระบุ periodId และ targetTable"
            });
            return;
        }
        
        const pool = await connectToDB();
        let transaction: any = null;
        
        try {
            // Begin transaction
            transaction = pool.transaction();
            await transaction.begin();
            
            // Get period information to display in response
            const periodResult = await transaction.request()
                .input("periodId", periodId)
                .query(`
                    SELECT 
                        d.period_id,
                        YEAR(d.startDate) as year,
                        CASE 
                            WHEN s.semiannual = 1 THEN 'ม.ค. - มิ.ย.'
                            WHEN s.semiannual = 2 THEN 'ก.ค. - ธ.ค.'
                            ELSE 'Unknown'
                        END as periodName
                    FROM 
                        dbo.Daysperiod d
                    JOIN 
                        dbo.Semiannual s ON d.semiannual_id = s.semiannual_id
                    WHERE 
                        d.period_id = @periodId
                `);
                
            if (periodResult.recordset.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลช่วงเวลาตาม ID ที่ระบุ"
                });
                return;
            }
            
            const periodInfo = periodResult.recordset[0];
            
            // Count records before deletion for reporting
            const countResult = await transaction.request()
                .input("periodId", periodId)
                .query(`SELECT COUNT(*) as count FROM ${targetTable} WHERE period_id = @periodId`);
                
            const recordCount = countResult.recordset[0].count;
            
            // Delete data from the target table
            const deleteResult = await transaction.request()
                .input("periodId", periodId)
                .query(`DELETE FROM ${targetTable} WHERE period_id = @periodId`);
            
            // Commit transaction
            await transaction.commit();
            
            res.status(200).json({
                success: true,
                message: `ลบข้อมูลเรียบร้อยแล้ว จำนวน ${recordCount} รายการ`,
                data: {
                    periodId,
                    year: periodInfo.year,
                    periodName: periodInfo.periodName,
                    targetTable,
                    recordCount
                }
            });
            
        } catch (error) {
            // If there's an error, roll back the transaction
            if (transaction) {
                console.error("Error deleting data:", error);
                await transaction.rollback();
            }
            throw error;
        }
        
    } catch (error) {
        console.error("Error deleting data:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการลบข้อมูล",
            error: error.message
        });
    }
};

// Function to update data by year and period
export const updateDataByPeriod = async (req: Request, res: Response) => {
    try {
        const { periodId, targetTable, updateFields } = req.body;
        
        if (!periodId || !targetTable || !updateFields || Object.keys(updateFields).length === 0) {
            res.status(400).json({
                success: false,
                message: "กรุณาระบุ periodId, targetTable และข้อมูลที่ต้องการอัพเดท"
            });
            return;
        }
        
        const pool = await connectToDB();
        let transaction: any = null;
        
        try {
            // Begin transaction
            transaction = pool.transaction();
            await transaction.begin();
            
            // Get period information to display in response
            const periodResult = await transaction.request()
                .input("periodId", periodId)
                .query(`
                    SELECT 
                        d.period_id,
                        YEAR(d.startDate) as year,
                        CASE 
                            WHEN s.semiannual = 1 THEN 'ม.ค. - มิ.ย.'
                            WHEN s.semiannual = 2 THEN 'ก.ค. - ธ.ค.'
                            ELSE 'Unknown'
                        END as periodName
                    FROM 
                        dbo.Daysperiod d
                    JOIN 
                        dbo.Semiannual s ON d.semiannual_id = s.semiannual_id
                    WHERE 
                        d.period_id = @periodId
                `);
                
            if (periodResult.recordset.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลช่วงเวลาตาม ID ที่ระบุ"
                });
                return;
            }
            
            const periodInfo = periodResult.recordset[0];
            
            // Count records before update for reporting
            const countResult = await transaction.request()
                .input("periodId", periodId)
                .query(`SELECT COUNT(*) as count FROM ${targetTable} WHERE period_id = @periodId`);
                
            const recordCount = countResult.recordset[0].count;
            
            if (recordCount === 0) {
                res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลในช่วงเวลาที่ระบุ"
                });
                return;
            }
            
            // Build SET clause for UPDATE statement
            const setClause = Object.entries(updateFields)
                .map(([key, _]) => `${key} = @${key}`)
                .join(', ');
            
            // Create request with all parameters
            const updateRequest = transaction.request()
                .input("periodId", periodId);
                
            // Add all update fields as parameters
            for (const [key, value] of Object.entries(updateFields)) {
                updateRequest.input(key, value);
            }
            
            // Execute update query
            await updateRequest.query(`
                UPDATE ${targetTable} 
                SET ${setClause}
                WHERE period_id = @periodId
            `);
            
            // Commit transaction
            await transaction.commit();
            
            res.status(200).json({
                success: true,
                message: `อัพเดทข้อมูลเรียบร้อยแล้ว จำนวน ${recordCount} รายการ`,
                data: {
                    periodId,
                    year: periodInfo.year,
                    periodName: periodInfo.periodName,
                    targetTable,
                    recordCount,
                    updatedFields: Object.keys(updateFields)
                }
            });
            
        } catch (error) {
            // If there's an error, roll back the transaction
            if (transaction) {
                console.error("Error updating data:", error);
                await transaction.rollback();
            }
            throw error;
        }
        
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล",
            error: error.message
        });
    }
};

// Function to get available tables for data management
export const getAvailableTables = async (req: Request, res: Response) => {
    try {
        const pool = await connectToDB();
        
        // Query to get user tables from the database
        const result = await pool.request()
            .query(`
                SELECT 
                    t.name AS tableName,
                    s.name AS schemaName,
                    CASE 
                        WHEN t.name LIKE '%Wind%' THEN 'คุณภาพอากาศในบรรยากาศ'
                        WHEN t.name LIKE '%Air%' THEN 'คุณภาพอากาศภายในสถานประกอบการ'
                        WHEN t.name LIKE '%Noise%' THEN 'ผลการตรวจวัดคุณภาพเสียงโดยทั่วไป'
                        WHEN t.name LIKE '%WasteWater%' THEN 'คุณภาพน้ำทิ้ง'
                        WHEN t.name LIKE '%SeaWater%' THEN 'คุณภาพน้ำทะเล'
                        WHEN t.name LIKE '%Marine%' THEN 'นิเวศวิทยาทางทะเล'
                        ELSE 'อื่นๆ ตารางข้อมูลเสริม'
                    END AS category
                FROM 
                    sys.tables t
                JOIN 
                    sys.schemas s ON t.schema_id = s.schema_id
                WHERE 
                    t.name NOT IN ('UploadedFiles', 'Users', 'Daysperiod', 'Semiannual', 'Mcategories', 'SbCategories', 'Years', 'Companies', 'Tool', 'EnhanceTable',
                    'Monitoring_Station', 'Register', 'News', 'NewsImages', 'ReferenceDataPendingApproval')
                    AND t.name NOT LIKE 'sys%'
                ORDER BY 
                    category, tableName
            `);
            
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error("Error fetching available tables:", error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลตาราง",
            error: error.message
        });
    }
};