import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Update a user's information
 * @param req Request object with user ID in params and updated data in body
 * @param res Response object
 */
export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const updateData = req.body;
  
  try {
    const pool = await connectToDB();
    
    // Check if user exists
    const userCheck = await pool.request()
      .input('userId', userId)
      .query('SELECT User_id FROM dbo.Users WHERE User_id = @userId');
      
    if (userCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Build the update query dynamically based on provided fields
    let updateQuery = 'UPDATE dbo.Users SET ';
    const queryParams = [];
    
    if (updateData.User_name) {
      queryParams.push('User_name = @userName');
    }
    
    if (updateData.User_email) {
      queryParams.push('User_email = @userEmail');
    }
    
    if (updateData.User_phone) {
      queryParams.push('User_phone = @userPhone');
    }
    
    if (updateData.User_Job_Position) {
      queryParams.push('User_Job_Position = @jobPosition');
    }
    
    if (updateData.User_role) {
      queryParams.push('User_role = @userRole');
    }
    
    if (queryParams.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }
    
    updateQuery += queryParams.join(', ');
    updateQuery += ' WHERE User_id = @userId';
    
    const request = pool.request();
    request.input('userId', userId);
    
    if (updateData.User_name) {
      request.input('userName', updateData.User_name);
    }
    
    if (updateData.User_email) {
      request.input('userEmail', updateData.User_email);
    }
    
    if (updateData.User_phone) {
      request.input('userPhone', updateData.User_phone);
    }
    
    if (updateData.User_Job_Position) {
      request.input('jobPosition', updateData.User_Job_Position);
    }
    
    if (updateData.User_role) {
      request.input('userRole', updateData.User_role);
    }
    
    await request.query(updateQuery);
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

/**
 * Delete a user
 * @param req Request object with user ID in params
 * @param res Response object
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  try {
    const pool = await connectToDB();
    
    // Check if user exists
    const userCheck = await pool.request()
      .input('userId', userId)
      .query('SELECT User_id FROM dbo.Users WHERE User_id = @userId');
      
    if (userCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Begin transaction
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      // Check if user has any uploaded files
      const filesCheck = await transaction.request()
        .input('userId', userId)
        .query('SELECT COUNT(*) as fileCount FROM dbo.UploadedFiles WHERE uploaded_by = @userId');
      
      const fileCount = filesCheck.recordset[0].fileCount;
      
      if (fileCount > 0) {
        // Option 1: Update the uploaded_by to a default system user (e.g., admin user with ID 1)
        await transaction.request()
          .input('userId', userId)
          .input('adminId', userId) // Default admin user ID default 1
          .query('UPDATE dbo.UploadedFiles SET uploaded_by = @adminId WHERE uploaded_by = @userId');
        
        // Option 2 (alternative): Delete the user's uploaded files
        // await transaction.request()
        //   .input('userId', userId)
        //   .query('DELETE FROM dbo.UploadedFiles WHERE uploaded_by = @userId');
      }
      
      // Now delete the user
      await transaction.request()
        .input('userId', userId)
        .query('DELETE FROM dbo.Users WHERE User_id = @userId');
      
      // Commit the transaction
      await transaction.commit();
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};