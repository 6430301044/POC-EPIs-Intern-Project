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
      data: result.recordset
    });
    return;

  } catch (error) {
    console.error("Error fetching UploadedFiles Table:", error);
    res.status(500).json({ message: "Error fetching UploadedFiles Table", error: error.message });
    return;
  }
};
