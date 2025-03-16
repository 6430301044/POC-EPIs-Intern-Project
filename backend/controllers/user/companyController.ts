import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

// Function to get all companies for the dropdown in registration form
export const getCompanies = async (req: Request, res: Response) => {
  try {
    const pool = await connectToDB();
    
    // Query to get company_id and companyName from Companies table
    const result = await pool.request()
      .query(`
        SELECT 
          company_id,
          companyName
        FROM 
          dbo.Companies
        ORDER BY 
          companyName ASC
      `);
      
    res.status(200).json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
      error: error.message
    });
  }
};