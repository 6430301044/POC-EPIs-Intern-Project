import { Request, Response } from "express";
import fs from "fs";
import csvParser from "csv-parser";
import { connectToDB } from "../../db/dbConfig";

export const uploadCSV = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ CSV" });
        }

        const result = await parseCSV(req.file.path);
        res.status(200).json({ message: "อัปโหลดสำเร็จ", data: result });

    } catch (error) {
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
};

export const parseCSV = async (filePath: string) => {
    return new Promise((resolve, reject) => {
        const results: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", async () => {
                try {
                    await saveToDatabase(results);
                    
                    // Delete the temporary file after processing
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting temporary file:", err);
                    });
                    
                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            })
            .on("error", (error) => reject(error));
    });
};

const saveToDatabase = async (data: any[]) => {
    if (!data || data.length === 0) {
        throw new Error("ไม่พบข้อมูลในไฟล์ CSV");
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
}
