import { connectToDB } from "../../db/dbConfig";

export async function getWindWDWSData(
  offset: number,
  pageSize: number,
  filters: any
) {
  const pool = await connectToDB();

  // First, get the total count of records
  let countQuery = `
    SELECT COUNT(*) as totalCount
    FROM [dbo].[Env_Wind_WDWS] w
    JOIN [dbo].[SbCategories] sc ON w.sub_Id = sc.sub_Id
    JOIN [dbo].[Mcategories] mc ON sc.main_Id = mc.main_Id
    JOIN [dbo].[Monitoring_Station] ms ON w.station_id = ms.station_Id
    JOIN [dbo].[Daysperiod] dp ON w.period_id = dp.period_Id
    JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_Id
    JOIN [dbo].[Companies] c ON w.company_id = c.company_Id
    WHERE 1=1
  `;
  
  // Add the same filters to the count query
  if (filters.stationName) {
    countQuery += ` AND ms.stationName = @stationName`;
  }
  if (filters.year) {
    countQuery += ` AND s.year = @year`;
  }
  if (filters.semiannual) {
    countQuery += ` AND s.semiannual = @semiannual`;
  }
  
  const countRequest = pool.request();
  
  if (filters.stationName) {
    countRequest.input("stationName", filters.stationName);
  }
  if (filters.year) {
    countRequest.input("year", filters.year);
  }
  if (filters.semiannual) {
    countRequest.input("semiannual", filters.semiannual);
  }
  
  const countResult = await countRequest.query(countQuery);
  const totalCount = countResult.recordset[0].totalCount;

  // Then, get the data for the current page
  let query = `
        SELECT 
            s.semiannual,
            s.[year],
            mc.mainName,
            sc.subName,
            w.windDirection,
            w.ws_05_1,
            w.ws_1_2,
            w.ws_2_3,
            w.ws_3_4,
            w.ws_4_6,
            w.ws_more_that_6,
            w.ws_total,
            w.unit,
            ms.stationName,
            c.companyName,
            dp.startDate,
            dp.endDate
        FROM [dbo].[Env_Wind_WDWS] w
        JOIN [dbo].[SbCategories] sc ON w.sub_Id = sc.sub_Id
        JOIN [dbo].[Mcategories] mc ON sc.main_Id = mc.main_Id
        JOIN [dbo].[Monitoring_Station] ms ON w.station_id = ms.station_Id
        JOIN [dbo].[Daysperiod] dp ON w.period_id = dp.period_Id
        JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_Id
        JOIN [dbo].[Companies] c ON w.company_id = c.company_Id
        WHERE 1=1
    `;

  // ✅ เพิ่มเงื่อนไขการกรองตามค่าที่ได้รับ
  if (filters.stationName) {
    query += ` AND ms.stationName = @stationName`;
  }
  if (filters.year) {
    query += ` AND s.year = @year`;
  }
  if (filters.semiannual) {
    query += ` AND s.semiannual = @semiannual`;
  }

  query += `
        ORDER BY s.year DESC
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
    `;

  const request = pool
    .request()
    .input("offset", offset)
    .input("pageSize", pageSize);

  if (filters.stationName) {
    request.input("stationName", filters.stationName);
  }
  if (filters.year) {
    request.input("year", filters.year);
  }
  if (filters.semiannual) {
    request.input("semiannual", filters.semiannual);
  }

  const result = await request.query(query);
  // Return both the data and the total count
  return {
    data: result.recordset,
    totalCount: totalCount
  };
}
