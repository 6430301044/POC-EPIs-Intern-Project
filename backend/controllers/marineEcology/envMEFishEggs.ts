import { connectToDB } from "../../db/dbConfig";

export async function getMEFishEggsData(
  offset: number,
  pageSize: number,
  filters: any
) {
  const pool = await connectToDB();

  // First, get the total count of records
  let countQuery = `
    SELECT COUNT(*) as totalCount
    FROM [dbo].[Env_MarineEcology_FishLarvaeEggs] mefg
          JOIN [dbo].[SbCategories] sc ON mefg.sub_id = sc.sub_id
          JOIN [dbo].[Mcategories] mc ON sc.main_id = mc.main_id
          JOIN [dbo].[Monitoring_Station] ms ON mefg.station_id = ms.station_id
          JOIN [dbo].[Daysperiod] dp ON mefg.period_id = dp.period_id
          JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_id
          JOIN [dbo].[Companies] c ON mefg.company_id = c.company_id
          JOIN [dbo].[Companies] cr ON mefg.reportBy = cr.company_id
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
              ms.stationName,
              mefg.phylum,
              mefg.class,
              mefg.orderName,
              mefg.family,
              mefg.genu,
              mefg.quantity_per_1000m3,
              cr.companyName AS reportBy,
              c.companyName,
              dp.startDate,
              dp.endDate
          FROM [dbo].[Env_MarineEcology_FishLarvaeEggs] mefg
          JOIN [dbo].[SbCategories] sc ON mefg.sub_id = sc.sub_id
          JOIN [dbo].[Mcategories] mc ON sc.main_id = mc.main_id
          JOIN [dbo].[Monitoring_Station] ms ON mefg.station_id = ms.station_id
          JOIN [dbo].[Daysperiod] dp ON mefg.period_id = dp.period_id
          JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_id
          JOIN [dbo].[Companies] c ON mefg.company_id = c.company_id
          JOIN [dbo].[Companies] cr ON mefg.reportBy = cr.company_id
          JOIN [dbo].[Years] y ON dp.year_id = y.year_id
          WHERE 1=1
  `;
  // ✅ เพิ่มเงื่อนไขการกรองตามค่าที่ได้รับ
  if (filters.stationName) {
    query += ` AND ms.stationName = @stationName`;
  }
  if (filters.year) {
    query += ` AND y.year = @year`;
  }
  if (filters.semiannual) {
    query += ` AND s.semiannual = @semiannual`;
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
    request.input("year", filters.year);
  }
  if (filters.semiannual) {
    request.input("semiannual", filters.semiannual);
  }

  const result = await request.query(query);
  // Return both the data and the total count
  return {
    data: result.recordset,
    totalCount: totalCount,
  };
}
