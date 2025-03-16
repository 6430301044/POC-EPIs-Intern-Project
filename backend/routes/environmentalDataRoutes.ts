import { connectToDB } from "../db/dbConfig";
import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:mainCategory/:subCategory", async (req, res) => {
    try {
        const { mainCategory, subCategory } = req.params;
        const { stationName, year, semiannual, page, pageSize } = req.query;
        
        // Default pagination values if not provided
        const currentPage = page ? parseInt(page as string) : 1;
        const itemsPerPage = pageSize ? parseInt(pageSize as string) : 10;
        const offset = (currentPage - 1) * itemsPerPage;
        
        console.log("✅ Received Request:");
        console.log("➡️ Main Category:", mainCategory);
        console.log("➡️ Sub Category:", subCategory);
        console.log("➡️ Station Name:", stationName);
        console.log("➡️ Year:", year);
        console.log("➡️ Semiannual:", semiannual);
        console.log("➡️ Page:", currentPage);
        console.log("➡️ Page Size:", itemsPerPage);
        console.log("➡️ Offset:", offset);

        const pool = await connectToDB();
        const result = await pool.request()
            .input("mainCategory", mainCategory)
            .input("subCategory", subCategory)
            .input("stationName", stationName)
            .input("year", year)
            .input("semiannual", semiannual)
            .input("offset", offset)
            .input("pageSize", itemsPerPage)
            .query(`
                SELECT * FROM dbo.${mainCategory}_${subCategory}
                WHERE (@stationName IS NULL OR stationName = @stationName)
                AND (@year IS NULL OR year = @year)
                AND (@semiannual IS NULL OR semiannual = @semiannual)
                ORDER BY (SELECT NULL)
                OFFSET @offset ROWS
                FETCH NEXT @pageSize ROWS ONLY;
            `);

        console.log("✅ Query Result:", result.recordset);
        res.json(result.recordset);
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: "Failed to fetch environmental data" });
    }
});

export default router;