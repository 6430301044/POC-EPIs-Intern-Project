import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Get all users from the database
 * @param req Request object
 * @param res Response object
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .query(`
        SELECT 
          u.User_id,
          u.User_name,
          u.User_email,
          u.User_phone,
          u.User_Job_Position,
          u.User_role,
          u.User_image,
          c.companyName
        FROM 
          dbo.Users u
        LEFT JOIN 
          dbo.Companies c ON u.Company_id = c.company_id
        ORDER BY 
          u.User_name
      `);
      
    res.status(200).json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};