import fs from "fs";
import csvParser from "csv-parser";
import { connectToDB } from "../db/dbConfig";  // เชื่อมต่อฐานข้อมูล

export const parseCSV = async (filePath: string) => {
    return new Promise((resolve, reject) => {
        const results: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", async () => {
                await saveToDatabase(results);
                resolve(results);
            })
            .on("error", (error) => reject(error));
    });
};

const saveToDatabase = async (data: any[]) => {
    const pool = await connectToDB(); // เชื่อมต่อฐานข้อมูล

    for (const record of data) {
        await pool.request()
            .input("station_name", record.station_name)
            .input("year", record.year)
            .input("value", record.value)
            .query(`INSERT INTO AirQuality (station_name, year, value) VALUES (@station_name, @year, @value)`);
    }
};
