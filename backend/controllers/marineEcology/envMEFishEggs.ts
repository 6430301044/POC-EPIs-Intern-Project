import { connectToDB } from "../../db/dbConfig";

export async function getMEFishEggsData(
  offset: number,
  pageSize: number,
  filters: any
) {
  const pool = await connectToDB();
  let query = `
      SELECT
              s.semiannual,
              s.[year],
              mc.mainName,
              sc.subName,
              ms.stationName,
              mefg.phylum,
              mefg.class,
              mefg.[order],
              mefg.family,
              mefg.genu,
              mefg.quantity_per_1000m3,
              cr.companyName AS reportBy,
              c.companyName,
              dp.startDate,
              dp.endDate
          FROM [dbo].[Env_MarineEcology_FishLarvaeEggs] mefg
          JOIN [dbo].[SbCategories] sc ON mefg.sub_Id = sc.sub_Id
          JOIN [dbo].[Mcategories] mc ON sc.main_Id = mc.main_Id
          JOIN [dbo].[Monitoring_Station] ms ON mefg.station_id = ms.station_Id
          JOIN [dbo].[Daysperiod] dp ON mefg.period_id = dp.period_Id
          JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_Id
          JOIN [dbo].[Companies] c ON mefg.company_id = c.company_Id
          JOIN [dbo].[Companies] cr ON mefg.reportBy = cr.company_Id
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
  return result.recordset;
}
