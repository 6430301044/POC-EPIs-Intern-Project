import { Request, Response } from "express";
import * as XLSX from "xlsx";
import fs from "fs";
import { connectToDB } from "../../db/dbConfig";

export const uploadExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ Excel" });
        }

        const result = await parseExcel(req.file.path);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

export const parseExcel = async (filePath: string) => {
    return new Promise((resolve, reject) => {
        try {
            // Read the Excel file
            const workbook = XLSX.readFile(filePath);
            
            // Get the first worksheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const results = XLSX.utils.sheet_to_json(worksheet);
            
            // Process the data
            saveToDatabase(results)
                .then(() => {
                    // Delete the temporary file after processing
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting temporary file:", err);
                    });
                    
                    resolve(results);
                })
                .catch(error => reject(error));
        } catch (error) {
            reject(error);
        }
    });
};

const saveToDatabase = async (data: any[]) => {
    if (!data || data.length === 0) {
        throw new Error("ไม่พบข้อมูลในไฟล์ Excel");
    }

    const pool = await connectToDB();
    let transaction = null;

    try {
        // Begin transaction
        transaction = pool.transaction();
        await transaction.begin();

        for (const record of data) {
            // Validate required fields
            if (!record.station_name || !record.year) {
                throw new Error("ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบข้อมูล station_name และ year");
            }

            // Insert data into appropriate table based on record structure
            // This is a simplified example - you'll need to adapt this to your specific data structure
            await pool.request()
                .input("station_name", record.station_name)
                .input("year", record.year)
                .input("value", record.value)
                .query(`INSERT INTO AirQuality (station_name, year, value) VALUES (@station_name, @year, @value)`);
        }

        // Commit transaction
        await transaction.commit();
    } catch (error) {
        // If there's an error, roll back the transaction
        if (transaction) await transaction.rollback();
        throw error;
    }

    return data;
};