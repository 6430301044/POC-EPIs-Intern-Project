import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

// Function to get all pending user registrations
export const getPendingRegistrations = async (req: Request, res: Response) => {
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .query(`
        SELECT 
          r.Register_id,
          r.User_name,
          r.User_email,
          r.User_phone,
          r.User_Job_Position,
          c.companyName,
          r.Created_at
        FROM 
          dbo.Register r
        JOIN
          dbo.Companies c ON c.company_id = r.Company_id
        WHERE 
          User_status = 'pending'
        ORDER BY 
          Register_id DESC
      `);
      
    res.status(200).json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending registrations",
      error: error.message
    });
  }
};

// Function to approve a user registration
export const approveRegistration = async (req: Request, res: Response) => {
  try {
    const { registerId } = req.params;
    
    if (!registerId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required"
      });
    }
    
    const pool = await connectToDB();
    let transaction = null;
    
    try {
      // Begin transaction
      transaction = pool.transaction();
      await transaction.begin();
      
      // Get the registration data
      const registerResult = await transaction.request()
        .input("registerId", registerId)
        .query(`
          SELECT 
            Register_id, User_name, User_email, User_phone, User_Job_Position, 
            Company_id, User_password, User_role
          FROM dbo.Register 
          WHERE Register_id = @registerId AND User_status = 'pending'
        `);
      
      if (registerResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Registration not found or already processed"
        });
      }
      
      const registerData = registerResult.recordset[0];
      
      // Insert into Users table with default profile image
      const defaultProfileImage = 'https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg';
      await transaction.request()
        .input("userName", registerData.User_name)
        .input("userEmail", registerData.User_email)
        .input("userPhone", registerData.User_phone)
        .input("userJobPosition", registerData.User_Job_Position)
        .input("companyId", registerData.Company_id)
        .input("userPassword", registerData.User_password)
        .input("userRole", registerData.User_role) // Changed from registerData.User_role to 'uploader'
        .input("userImage", defaultProfileImage)
        .query(`
          INSERT INTO dbo.Users (
            User_name, User_email, User_phone, User_Job_Position, 
            Company_id, User_password, User_role, User_image
          ) VALUES (
            @userName, @userEmail, @userPhone, @userJobPosition, 
            @companyId, @userPassword, @userRole, @userImage
          )
        `);
      
      // Update register status
      await transaction.request()
        .input("registerId", registerId)
        .query(`
          UPDATE dbo.Register 
          SET User_status = 'approved' 
          WHERE Register_id = @registerId
        `);
      
      // Commit transaction
      await transaction.commit();
      
      res.status(200).json({
        success: true,
        message: "User registration approved successfully"
      });
    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error approving registration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve registration",
      error: error.message
    });
  }
};

// Function to reject a user registration
export const rejectRegistration = async (req: Request, res: Response) => {
  try {
    const { registerId } = req.params;
    
    if (!registerId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required"
      });
    }
    
    const pool = await connectToDB();
    
    // Update register status
    const result = await pool.request()
      .input("registerId", registerId)
      .query(`
        UPDATE dbo.Register 
        SET User_status = 'rejected' 
        WHERE Register_id = @registerId AND User_status = 'pending'
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Registration not found or already processed"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User registration rejected successfully"
    });
  } catch (error) {
    console.error("Error rejecting registration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject registration",
      error: error.message
    });
  }
};