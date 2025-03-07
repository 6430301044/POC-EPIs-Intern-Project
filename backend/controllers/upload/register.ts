import { connectToDB } from "../../db/dbConfig";

export async function getRegisterData(
  offset: number,
  pageSize: number
) {
  const pool = await connectToDB();
  let query = `
      SELECT 
      [User_id]
      ,[User_name]
      ,[User_role]
      ,[User_Job_Position]
      ,[Company_id]
      ,[User_password]
      ,[User_email]
      ,[User_phone]
      FROM [dbo].[User]
      WHERE 1=1
  `;

  const request = pool.request()
    .input("offset", offset)
    .input("pageSize", pageSize);

  const result = await request.query(query);
  return result.recordset;
}

