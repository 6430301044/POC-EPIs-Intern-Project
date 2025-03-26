import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Get all records from a specified reference table
 */
export const getReferenceData = async (req: Request, res: Response) => {
    try {
        const { table } = req.params;
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        
        // Validate table name to prevent SQL injection
        const validTables = [
            'Years', 'Daysperiod', 'Mcategories', 'SbCategories',
            'Companies', 'Monitoring_Station', 'Tool', 'Semiannual'
        ];
        
        if (!validTables.includes(table)) {
            res.status(400).json({
                success: false,
                message: `ไม่พบตาราง ${table} หรือไม่ได้รับอนุญาตให้เข้าถึง`
            });
            return;
        }
        
        const pool = await connectToDB();
        
        // Get total count
        const countResult = await pool.request()
            .query(`SELECT COUNT(*) as total FROM dbo.${table}`);
        
        const totalCount = countResult.recordset[0].total;
        
        // Get table schema to determine columns
        const schemaResult = await pool.request()
            .query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}'
                ORDER BY ORDINAL_POSITION
            `);
        
        // Get data with pagination
        // Determine primary key column (assuming it ends with _id)
        const primaryKeyColumn = schemaResult.recordset.find(col => col.COLUMN_NAME.endsWith('_id'))?.COLUMN_NAME || `${table.toLowerCase()}_id`;
        
        const dataResult = await pool.request()
            .query(`
                SELECT * FROM dbo.${table}
                ORDER BY ${primaryKeyColumn}
                OFFSET ${offset} ROWS
                FETCH NEXT ${pageSize} ROWS ONLY
            `);
        
        res.status(200).json({
            success: true,
            data: dataResult.recordset,
            totalCount,
            schema: schemaResult.recordset
        });
    } catch (error) {
        console.error(`Error fetching reference data:`, error);
        res.status(500).json({
            success: false,
            message: `เกิดข้อผิดพลาดในการดึงข้อมูลอ้างอิง`,
            error: error.message
        });
    }
};

/**
 * Add a new record to a reference table
 */
export const addReferenceData = async (req: Request, res: Response) => {
    try {
        const { table } = req.params;
        const data = req.body;
        
        // Validate table name to prevent SQL injection
        const validTables = [
            'Years', 'Daysperiod', 'Mcategories', 'SbCategories',
            'Companies', 'Monitoring_Station', 'Tool', 'Semiannual'
        ];
        
        if (!validTables.includes(table)) {
            res.status(400).json({
                success: false,
                message: `ไม่พบตาราง ${table} หรือไม่ได้รับอนุญาตให้เข้าถึง`
            });
            return;
        }
        
        const pool = await connectToDB();
        
        // Get table schema to determine valid columns
        const schemaResult = await pool.request()
            .query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}'
                AND COLUMN_NAME NOT LIKE '%_id' -- Exclude ID columns that are auto-generated
            `);
        
        const validColumns = schemaResult.recordset.map(col => col.COLUMN_NAME);
        
        // Filter out any properties that don't match valid columns
        const filteredData: Record<string, any> = {};
        for (const key of Object.keys(data)) {
            if (validColumns.includes(key)) {
                filteredData[key] = data[key];
            }
        }
        
        if (Object.keys(filteredData).length === 0) {
            res.status(400).json({
                success: false,
                message: `ไม่มีข้อมูลที่ถูกต้องสำหรับการเพิ่มในตาราง ${table}`
            });
            return;
        }
        
        // Build the SQL query
        const columns = Object.keys(filteredData).join(', ');
        const paramNames = Object.keys(filteredData).map(key => `@${key}`).join(', ');
        
        const request = pool.request();
        
        // Add parameters to the request
        for (const [key, value] of Object.entries(filteredData)) {
            request.input(key, value);
        }
        
        // Execute the insert query
        const result = await request.query(`
            INSERT INTO dbo.${table} (${columns})
            VALUES (${paramNames});
            SELECT SCOPE_IDENTITY() AS id;
        `);
        
        const newId = result.recordset[0].id;
        
        // Special handling for Daysperiod table to ensure year_id is set
        if (table === 'Daysperiod' && data.startDate && data.endDate) {
            // Extract year from startDate
            const startYear = new Date(data.startDate).getFullYear();
            
            // Check if year exists in Years table
            const yearResult = await pool.request()
                .input('year', startYear)
                .query('SELECT year_id FROM dbo.Years WHERE year = @year');
            
            let yearId;
            
            if (yearResult.recordset.length > 0) {
                yearId = yearResult.recordset[0].year_id;
            } else {
                // Create new year record
                const newYearResult = await pool.request()
                    .input('year', startYear)
                    .query(`
                        INSERT INTO dbo.Years (year)
                        VALUES (@year);
                        SELECT SCOPE_IDENTITY() AS year_id;
                    `);
                
                yearId = newYearResult.recordset[0].year_id;
            }
            
            // Update the Daysperiod record with the year_id
            await pool.request()
                .input('periodId', newId)
                .input('yearId', yearId)
                .query(`
                    UPDATE dbo.Daysperiod
                    SET year_id = @yearId
                    WHERE period_id = @periodId
                `);
        }
        
        res.status(201).json({
            success: true,
            message: `เพิ่มข้อมูลในตาราง ${table} สำเร็จ`,
            id: newId
        });
    } catch (error) {
        console.error(`Error adding reference data:`, error);
        res.status(500).json({
            success: false,
            message: `เกิดข้อผิดพลาดในการเพิ่มข้อมูลอ้างอิง`,
            error: error.message
        });
    }
};

/**
 * Update an existing record in a reference table
 */
export const updateReferenceData = async (req: Request, res: Response) => {
    try {
        const { table, id } = req.params;
        const data = req.body;
        
        // Validate table name to prevent SQL injection
        const validTables = [
            'Years', 'Daysperiod', 'Mcategories', 'SbCategories',
            'Companies', 'Monitoring_Station', 'Tool', 'Semiannual'
        ];
        
        if (!validTables.includes(table)) {
            res.status(400).json({
                success: false,
                message: `ไม่พบตาราง ${table} หรือไม่ได้รับอนุญาตให้เข้าถึง`
            });
            return;
        }
        
        const pool = await connectToDB();
        
        // Determine primary key column name
        let primaryKeyColumn;
        
        // Handle special cases for primary key column names
        if (table === 'Mcategories') {
            primaryKeyColumn = 'main_id';
        } else if (table === 'SbCategories') {
            primaryKeyColumn = 'sub_id';
        } else if (table === 'Daysperiod') {
            primaryKeyColumn = 'period_id';
        } else if (table === 'Monitoring_Station') {
            primaryKeyColumn = 'station_id';
        } else if (table === 'Companies') {
            primaryKeyColumn = 'company_id';    
        } else {
            // Default pattern for other tables
            primaryKeyColumn = `${table.toLowerCase().replace(/s$/, '')}_id`;
        }
        
        // Get table schema to determine valid columns
        const schemaResult = await pool.request()
            .query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}'
                AND COLUMN_NAME <> '${primaryKeyColumn}' -- Exclude ID column
            `);
        
        const validColumns = schemaResult.recordset.map(col => col.COLUMN_NAME);
        
        // Filter out any properties that don't match valid columns
        const filteredData: Record<string, any> = {};
        for (const key of Object.keys(data)) {
            if (validColumns.includes(key)) {
                filteredData[key] = data[key];
            }
        }
        
        if (Object.keys(filteredData).length === 0) {
            res.status(400).json({
                success: false,
                message: `ไม่มีข้อมูลที่ถูกต้องสำหรับการอัปเดตในตาราง ${table}`
            });
            return;
        }
        
        // Build the SQL query
        const setClause = Object.keys(filteredData)
            .map(key => `${key} = @${key}`)
            .join(', ');
        
        const request = pool.request();
        
        // Add parameters to the request
        for (const [key, value] of Object.entries(filteredData)) {
            request.input(key, value);
        }
        
        request.input('id', id);
        
        // Execute the update query
        const result = await request.query(`
            UPDATE dbo.${table}
            SET ${setClause}
            WHERE ${primaryKeyColumn} = @id
        `);
        
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({
                success: false,
                message: `ไม่พบข้อมูลที่ต้องการอัปเดตในตาราง ${table}`
            });
            return
        }
        
        // Special handling for Daysperiod table to ensure year_id is set
        if (table === 'Daysperiod' && data.startDate) {
            // Extract year from startDate
            const startYear = new Date(data.startDate).getFullYear();
            
            // Check if year exists in Years table
            const yearResult = await pool.request()
                .input('year', startYear)
                .query('SELECT year_id FROM dbo.Years WHERE year = @year');
            
            let yearId;
            
            if (yearResult.recordset.length > 0) {
                yearId = yearResult.recordset[0].year_id;
            } else {
                // Create new year record
                const newYearResult = await pool.request()
                    .input('year', startYear)
                    .query(`
                        INSERT INTO dbo.Years (year)
                        VALUES (@year);
                        SELECT SCOPE_IDENTITY() AS year_id;
                    `);
                
                yearId = newYearResult.recordset[0].year_id;
            }
            
            // Update the Daysperiod record with the year_id
            await pool.request()
                .input('periodId', id)
                .input('yearId', yearId)
                .query(`
                    UPDATE dbo.Daysperiod
                    SET year_id = @yearId
                    WHERE period_id = @periodId
                `);
        }
        
        res.status(200).json({
            success: true,
            message: `อัปเดตข้อมูลในตาราง ${table} สำเร็จ`
        });
    } catch (error) {
        console.error(`Error updating reference data:`, error);
        res.status(500).json({
            success: false,
            message: `เกิดข้อผิดพลาดในการอัปเดตข้อมูลอ้างอิง`,
            error: error.message
        });
    }
};

/**
 * Delete a record from a reference table
 */
export const deleteReferenceData = async (req: Request, res: Response) => {
    try {
        const { table, id } = req.params;
        
        // Validate table name to prevent SQL injection
        const validTables = [
            'Years', 'Daysperiod', 'Mcategories', 'SbCategories',
            'Companies', 'Monitoring_Station', 'Tool', 'Semiannual'
        ];
        
        if (!validTables.includes(table)) {
            res.status(400).json({
                success: false,
                message: `ไม่พบตาราง ${table} หรือไม่ได้รับอนุญาตให้เข้าถึง`
            });
            return;
        }
        
        const pool = await connectToDB();
        
        // Determine primary key column name
        let primaryKeyColumn;
        
        // Handle special cases for primary key column names
        if (table === 'Mcategories') {
            primaryKeyColumn = 'main_id';
        } else if (table === 'SbCategories') {
            primaryKeyColumn = 'sub_id';
        } else if (table === 'Daysperiod') {
            primaryKeyColumn = 'period_id';
        } else if (table === 'Monitoring_Station') {
            primaryKeyColumn = 'station_id';
        } else if (table === 'Companies') {
            primaryKeyColumn = 'company_id';    
        } else {
            // Default pattern for other tables
            primaryKeyColumn = `${table.toLowerCase().replace(/s$/, '')}_id`;
        }
        
        // Check for foreign key constraints
        const constraintCheck = await pool.request()
            .query(`
                SELECT 
                    fk.name AS constraint_name,
                    OBJECT_NAME(fk.parent_object_id) AS referencing_table
                FROM 
                    sys.foreign_keys AS fk
                INNER JOIN 
                    sys.tables AS t ON fk.referenced_object_id = t.object_id
                INNER JOIN 
                    sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
                INNER JOIN 
                    sys.columns AS c ON fkc.referenced_column_id = c.column_id AND c.object_id = t.object_id
                WHERE 
                    t.name = '${table}'
                    AND c.name = '${primaryKeyColumn}'
            `);
        
        // If there are foreign key constraints, check if the record is referenced
        if (constraintCheck.recordset.length > 0) {
            // Check if any records reference this ID
            for (const constraint of constraintCheck.recordset) {
                const referencingTable = constraint.referencing_table;
                const constraintName = constraint.constraint_name;
                
                const refCheck = await pool.request()
                    .input('id', id)
                    .query(`
                        SELECT COUNT(*) as count
                        FROM dbo.${referencingTable}
                        WHERE ${primaryKeyColumn} = @id
                    `);
                
                if (refCheck.recordset[0].count > 0) {
                    res.status(400).json({
                        success: false,
                        message: `ไม่สามารถลบข้อมูลได้เนื่องจากมีการอ้างอิงในตาราง ${referencingTable}`,
                        constraint: constraintName
                    });
                    return;
                }
            }
        }
        
        // Execute the delete query
        const request = pool.request()
            .input('id', id);
        
        const result = await request.query(`
            DELETE FROM dbo.${table}
            WHERE ${primaryKeyColumn} = @id
        `);
        
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({
                success: false,
                message: `ไม่พบข้อมูลที่ต้องการลบในตาราง ${table}`
            });
            return;
        }
        
        res.status(200).json({
            success: true,
            message: `ลบข้อมูลในตาราง ${table} สำเร็จ`
        });
    } catch (error) {
        console.error(`Error deleting reference data:`, error);
        res.status(500).json({
            success: false,
            message: `เกิดข้อผิดพลาดในการลบข้อมูลอ้างอิง`,
            error: error.message
        });
    }
};