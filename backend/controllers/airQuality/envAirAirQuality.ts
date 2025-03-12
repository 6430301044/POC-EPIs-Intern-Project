import { connectToDB } from "../../db/dbConfig";

export async function getAirQualityData(
  offset: number,
  pageSize: number,
  filters: any
) {
  const pool = await connectToDB();

  // First, get the total count of records
  let countQuery = `
    SELECT COUNT(*) as totalCount
    FROM [dbo].[Env_Air_AirQuality] aq
      JOIN [dbo].[SbCategories] sc ON aq.sub_id = sc.sub_id
      JOIN [dbo].[Mcategories] mc ON sc.main_id = mc.main_id
      JOIN [dbo].[Monitoring_Station] ms ON aq.station_id = ms.station_id
      JOIN [dbo].[Daysperiod] dp ON aq.period_id = dp.period_id
      JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_id
      JOIN [dbo].[Companies] c ON aq.company_id = c.company_id
      JOIN [dbo].[Years] y ON dp.year_id = y.year_id
      WHERE 1=1
  `;

  // Add the same filters to the count query
  if (filters.stationName) {
    countQuery += ` AND ms.stationName = @stationName`;
  }
  if (filters.year) {
    countQuery += ` AND y.year = @year`;
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
          y.[year],
          mc.mainName,
          sc.subName,
          aq.index_name,
          aq.unit,
          aq.result,
          aq.std,
          ms.stationName,
          c.companyName,
          dp.startDate,
          dp.endDate
      FROM [dbo].[Env_Air_AirQuality] aq
      JOIN [dbo].[SbCategories] sc ON aq.sub_id = sc.sub_id
      JOIN [dbo].[Mcategories] mc ON sc.main_id = mc.main_id
      JOIN [dbo].[Monitoring_Station] ms ON aq.station_id = ms.station_id
      JOIN [dbo].[Daysperiod] dp ON aq.period_id = dp.period_id
      JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_id
      JOIN [dbo].[Companies] c ON aq.company_id = c.company_id
      JOIN [dbo].[Years] y ON dp.year_id = y.year_id
      WHERE 1=1
  `;

  // ✅ เพิ่มเงื่อนไขกรองข้อมูล
  if (filters.stationName) {
    query += ` AND ms.stationName = @stationName`;
  }
  if (filters.year) {
    const yearParams = filters.year
      .split(",")
      .map((_, i) => `@year${i}`)
      .join(",");
    query += ` AND y.year IN (${yearParams})`;
  }
  if (filters.semiannual) {
    const semiannualParams = filters.semiannual
      .split(",")
      .map((_, i) => `@semiannual${i}`)
      .join(",");
    query += ` AND s.semiannual IN (${semiannualParams})`;
  }
  if (filters.valueColumns) {
    const valueParams = filters.valueColumns
      .split(",")
      .map((_, i) => `@valueColumn${i}`)
      .join(",");
    query += ` AND aq.index_name IN (${valueParams})`;
  }

  query += `
    ORDER BY y.year DESC
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
    filters.year.split(",").forEach((y, i) => request.input(`year${i}`, y));
  }
  if (filters.semiannual) {
    filters.semiannual
      .split(",")
      .forEach((s, i) => request.input(`semiannual${i}`, s));
  }
  if (filters.valueColumns) {
    filters.valueColumns
      .split(",")
      .forEach((v, i) => request.input(`valueColumn${i}`, v));
  }

  const result = await request.query(query);
  // Return both the data and the total count
  return {
    data: result.recordset,
    totalCount: totalCount,
  };
}
