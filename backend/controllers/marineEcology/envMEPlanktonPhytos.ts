import { connectToDB } from "../../db/dbConfig";

export async function getMEPlanktonPhytosData(
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
              mep.division,
              mep.class,
              mep.[order],
              mep.family,
              mep.genu,
              mep.quantity_per_m3,
              cr.companyName AS reportBy,
              c.companyName,
              dp.startDate,
              dp.endDate
          FROM [dbo].[Env_MarineEcology_PlanktonPhytos] mep
          JOIN [dbo].[SbCategories] sc ON mep.sub_Id = sc.sub_Id
          JOIN [dbo].[Mcategories] mc ON sc.main_Id = mc.main_Id
          JOIN [dbo].[Monitoring_Station] ms ON mep.station_id = ms.station_Id
          JOIN [dbo].[Daysperiod] dp ON mep.period_id = dp.period_Id
          JOIN [dbo].[Semiannual] s ON dp.semiannual_id = s.semiannual_Id
          JOIN [dbo].[Companies] c ON mep.company_id = c.company_Id
          JOIN [dbo].[Companies] cr ON mep.reportBy = cr.company_Id
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
