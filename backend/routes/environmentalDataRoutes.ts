import { connectToDB } from "../db/dbConfig";
import express from "express";

const router = express.Router();

router.get("/:mainCategory/:subCategory", async (req, res) => {
    try {
        const { mainCategory, subCategory } = req.params;
        const { stationName, year, semiannual } = req.query;
        
        console.log("✅ Received Request:");
        console.log("➡️ Main Category:", mainCategory);
        console.log("➡️ Sub Category:", subCategory);
        console.log("➡️ Station Name:", stationName);
        console.log("➡️ Year:", year);
        console.log("➡️ Semiannual:", semiannual);

        const pool = await connectToDB();
        const result = await pool.request()
            .input("mainCategory", mainCategory)
            .input("subCategory", subCategory)
            .input("stationName", stationName)
            .input("year", year)
            .input("semiannual", semiannual)
            .query(`
                SELECT * FROM dbo.${mainCategory}_${subCategory}
                WHERE (@stationName IS NULL OR stationName = @stationName)
                AND (@year IS NULL OR year = @year)
                AND (@semiannual IS NULL OR semiannual = @semiannual);
            `);

        console.log("✅ Query Result:", result.recordset);
        res.json(result.recordset);
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: "Failed to fetch environmental data" });
    }
});

export default router;