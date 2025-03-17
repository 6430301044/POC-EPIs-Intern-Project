// newsController.ts
import sql from "mssql";
import { connectToDB } from "../../db/dbConfig"; 

export const getNewsFromDatabase = async (sortOrder: string = "desc") => {
  const orderBy = sortOrder === "asc" ? "ASC" : "DESC";

  try {
    const pool = await connectToDB();
    if (!pool.connected) throw new Error("Database connection failed");

    const result = await pool.request().query(`
      SELECT id, title, description, imageUrl, createdAt
      FROM news
      ORDER BY createdAt ${orderBy}
    `);

    return result.recordset;
  } catch (error) {
    console.error("❌ Error fetching news from database:", error);
    throw new Error("Failed to fetch news from database");
  }
};
