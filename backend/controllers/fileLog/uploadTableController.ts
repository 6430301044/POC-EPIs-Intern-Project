import { Request, Response } from "express";
import sql from "mssql";
import { connectToDB } from "../../db/dbConfig";

export const getAllUploadedFiles = async (req: Request, res: Response) => {
  try {
    const pool = await connectToDB();
    
    const result = await pool.request().query(`
      SELECT 
                    uf.*,
                    u.User_name as uploaded_by_username,
                    y.year,
                    s.semiannualName,
                    mc.mainName,
                    sc.subName
                FROM dbo.UploadedFiles uf
                LEFT JOIN dbo.Users u ON uf.uploaded_by = u.User_id
                LEFT JOIN dbo.Years y ON uf.year_id = y.year_id
                LEFT JOIN dbo.Daysperiod dp ON uf.period_id = dp.period_id
                LEFT JOIN dbo.Semiannual s ON dp.semiannual_id = s.semiannual_id
                LEFT JOIN dbo.Mcategories mc ON uf.main_id = mc.main_id
                LEFT JOIN dbo.SbCategories sc ON uf.sub_id = sc.sub_id
    `);

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลตารางไฟล์ period สำเร็จ",
      data: result.recordset
    });
    return;

  } catch (error) {
    console.error("Error fetching uploaded files:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลตารางไฟล์ period",
      error: error.message
    });
    return;
  }
};

export const getAllReferenceDataPendingApprovalFiles = async (req: Request, res: Response) => {
  try {
    const pool = await connectToDB();

    const result = await pool.request()
    .query(`
      SELECT
        rf.*,
        u.User_name as uploaded_by_username
        FROM dbo.ReferenceDataPendingApproval rf
        LEFT JOIN dbo.Users u ON rf.uploaded_by = u.User_id
      `);

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลตารางไฟล์ nonPeriod สำเร็จ",
      data: result.recordset
    });
    return;
      
  } catch (error) {
    console.error("Error fetching reference data pending approval files:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลตารางไฟล์ nonPeriod",
      error: error.message
    });
    return;
  }
}

// ฟังก์ชันดึงข้อมูลตารางไฟล์ตาราง Period ตาม ID
export const getUploadedFileById = async (req: Request, res: Response) => {
  try {
    const { upload_id } = req.params;
    const pool = await connectToDB();
    
    // ดึงข้อมูลข่าว
    const newsResult = await pool.request()
      .input('upload_id', sql.Int, upload_id)
      .query(`SELECT * FROM UploadedFiles WHERE upload_id = @upload_id`);
    
    if (newsResult.recordset.length === 0) {
      res.status(404).json({ message: "Uploaded not found" });
      return;
    }
    
    const news = newsResult.recordset[0];   
    res.status(200).json({
      success: true,
      data: news
    });
    return;

  } catch (error) {
    console.error("Error fetching uploaded by upload_id:", error);
    res.status(500).json({ message: "Error fetching uploaded", error: error.message });
    return;
  }
};

// ฟังก์ชันดึงข้อมูลตารางไฟล์ตาราง Non period ตาม ID
export const getReferenceDataPendingApprovalFileById = async (req: Request, res: Response) => {
  try {
    const { upload_id } = req.params;
    const pool = await connectToDB();
    
    // ดึงข้อมูลข่าว
    const newsResult = await pool.request()
      .input('upload_id', sql.Int, upload_id)
      .query(`SELECT * FROM ReferenceDataPendingApproval WHERE upload_id = @upload_id`);
    
    if (newsResult.recordset.length === 0) {
      res.status(404).json({ message: "Uploaded not found" });
      return;
    }
    
    const news = newsResult.recordset[0];   
    res.status(200).json({
      success: true,
      data: news
    });
    return;

  } catch (error) {
    console.error("Error fetching uploaded by upload_id:", error);
    res.status(500).json({ message: "Error fetching uploaded", error: error.message });
    return;
  }
};

// ฟังก์ชันลบตารางไฟล์ตาราง Period ตาม ID
export const deleteUploadedFilesById = async (req: Request, res: Response) => {
  try {
    const { upload_id } = req.params;
    const pool = await connectToDB();
    let transaction: any = null;
    
    try {
      // เริ่ม transaction
      transaction = pool.transaction();
      await transaction.begin();
      
      // ตรวจสอบว่ามีข่าวและรูปภาพที่ต้องการลบหรือไม่
      const checkRequest = transaction.request();
      checkRequest.input('upload_id', sql.Int, upload_id);
      
      const checkResult = await checkRequest.query(`
        SELECT upload_id
        FROM dbo.UploadedFiles
        WHERE upload_id = @upload_id
      `);
      
      if (checkResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลตารางไฟล์ period ที่ต้องการลบ"
        });
        return;
      }
      
      // ลบข้อมูลจากตาราง UploadedFiles
      const deleteRequest = transaction.request();
      deleteRequest.input('upload_id', sql.Int, upload_id);
      
      await deleteRequest.query(`
        DELETE FROM dbo.UploadedFiles 
        WHERE upload_id = @upload_id
      `);
      
      // Commit transaction
      await transaction.commit();
      
      res.status(200).json({
        success: true,
        message: `ลบข้อมูลตารางไฟล์ period เรียบร้อยแล้ว`,
        data: {
          upload_id: upload_id
        }
      });
      return;

    } catch (error) {
      // ถ้ามีข้อผิดพลาด ให้ rollback transaction
      if (transaction) {
        console.error("Transaction rollback due to error:", error);
        await transaction.rollback();
      }
      throw error;
    }
    
  } catch (error) {
    console.error("Error deleting news by upload_id:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบข้อมูลตารางไฟล์ period",
      error: error.message
    });
    return;
  }
};

// ฟังก์ชันลบตารางไฟล์ตาราง nonPeriod ตาม ID
export const deleteReferenceDataPendingApprovalFilesById = async (req: Request, res: Response) => {
  try {
    const { upload_id } = req.params;
    const pool = await connectToDB();
    let transaction: any = null;
    
    try {
      // เริ่ม transaction
      transaction = pool.transaction();
      await transaction.begin();
      
      // ตรวจสอบว่ามีข่าวและรูปภาพที่ต้องการลบหรือไม่
      const checkRequest = transaction.request();
      checkRequest.input('upload_id', sql.Int, upload_id);
      
      const checkResult = await checkRequest.query(`
        SELECT upload_id
        FROM dbo.ReferenceDataPendingApproval
        WHERE upload_id = @upload_id
      `);
      
      if (checkResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลตารางไฟล์ nonPeriod ที่ต้องการลบ"
        });
        return;
      }
      
      // ลบข้อมูลจากตาราง ReferenceDataPendingApproval
      const deleteRequest = transaction.request();
      deleteRequest.input('upload_id', sql.Int, upload_id);
      
      await deleteRequest.query(`
        DELETE FROM dbo.ReferenceDataPendingApproval
        WHERE upload_id = @upload_id
      `);
      
      // Commit transaction
      await transaction.commit();
      
      res.status(200).json({
        success: true,
        message: `ลบข้อมูลตารางไฟล์ nonPeriod เรียบร้อยแล้ว`,
        data: {
          upload_id: upload_id
        }
      });
      return;

    } catch (error) {
      // ถ้ามีข้อผิดพลาด ให้ rollback transaction
      if (transaction) {
        console.error("Transaction rollback due to error:", error);
        await transaction.rollback();
      }
      throw error;
    }
    
  } catch (error) {
    console.error("Error deleting news by upload_id:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบข้อมูตารางไฟล์ nonPeriod",
      error: error.message
    });
    return;
  }
};