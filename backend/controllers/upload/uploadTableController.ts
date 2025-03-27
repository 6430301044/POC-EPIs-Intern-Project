import sql from "mssql";
import { connectToDB } from "../../db/dbConfig";

export const getAllUploadedFiles = async () => {
  try {
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
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

export const getUploadedFileById = async (id: number) => {
  try {
    const result = await connectToDB.input("upload_id", sql.Int, id).query(`
                SELECT 
                    uf.*,
                    u.username as uploaded_by_username,
                    y.year_value,
                    dp.period_name,
                    mc.main_name,
                    sc.sub_name
                FROM UploadedFiles uf
                LEFT JOIN Users u ON uf.uploaded_by = u.User_id
                LEFT JOIN Years y ON uf.year_id = y.year_id
                LEFT JOIN Daysperiod dp ON uf.period_id = dp.period_id
                LEFT JOIN Mcategories mc ON uf.main_id = mc.main_id
                LEFT JOIN SbCategories sc ON uf.sub_id = sc.sub_id
                WHERE uf.upload_id = @upload_id
            `);

    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};
