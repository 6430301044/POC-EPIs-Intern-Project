import { connectToDB } from "../../db/dbConfig";

export async function getWindSO2Data(
  offset: number,
  pageSize: number,
  filters: any
) {
  const pool = await connectToDB();

  // First, get the total count of records
  let countQuery = `
    SELECT COUNT(*) as totalCount
    FROM [dbo].[Env_Wind_SO2] so
        JOIN [dbo].[SbCategories] sc ON so.sub_Id = sc.sub_Id
        JOIN [dbo].[Mcategories] mc ON sc.main_Id = mc.main_Id
        JOIN [dbo].[Monitoring_Station] ms ON so.station_id = ms.station_Id
        JOIN [dbo].[Daysperiod] dp ON so.period_id = dp.period_Id
        JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_Id
        JOIN [dbo].[Companies] c ON so.company_id = c.company_Id
        JOIN [dbo].[Tool] gt ON so.gasCylinder = gt.tool_Id
        JOIN [dbo].[Tool] at ON so.toolAnalyst = at.tool_Id
        JOIN [dbo].[Tool] ct ON so.toolCalibration = ct.tool_Id
        JOIN [dbo].[Companies] cr ON so.reportBy = cr.company_Id
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

  let query = `
        SELECT
            s.semiannual,
            s.[year],
            mc.mainName,
            sc.subName,
            so.timePeriod,
            so.day1st_result_ppm,
            so.day2nd_result_ppm,
            so.day3rd_result_ppm,
            so.certifiedDate,
            so.expireDate,
            so.concentrationPPB,
            gt.toolName AS gasCylinder,
            gt.toolSerial AS 'gasCylinder Serial',
            at.toolName AS toolAnalyst,
            at.toolSerial AS 'Analyst Tool Serial',
            ct.toolName AS toolCalibration,
            ct.toolSerial AS 'Calibration Tool Serial',
            cr.companyName AS reportBy,
            ms.stationName,
            c.companyName,
            dp.startDate,
            dp.endDate
        FROM [dbo].[Env_Wind_SO2] so
        JOIN [dbo].[SbCategories] sc ON so.sub_Id = sc.sub_Id
        JOIN [dbo].[Mcategories] mc ON sc.main_Id = mc.main_Id
        JOIN [dbo].[Monitoring_Station] ms ON so.station_id = ms.station_Id
        JOIN [dbo].[Daysperiod] dp ON so.period_id = dp.period_Id
        JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_Id
        JOIN [dbo].[Companies] c ON so.company_id = c.company_Id
        JOIN [dbo].[Tool] gt ON so.gasCylinder = gt.tool_Id
        JOIN [dbo].[Tool] at ON so.toolAnalyst = at.tool_Id
        JOIN [dbo].[Tool] ct ON so.toolCalibration = ct.tool_Id
        JOIN [dbo].[Companies] cr ON so.reportBy = cr.company_Id
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
  return {
    data: result.recordset,
    totalCount: totalCount,
  };
}
