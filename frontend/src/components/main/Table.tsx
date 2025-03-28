import { useEffect, useState, useMemo } from "react";
import { Container } from "../template/Container";
import { SectionTitle } from "../template/SectionTitle";
import {
  fetchEnvironmentalData,
  fetchMainCategories,
  fetchSubCategories,
  fetchStations,
  fetchYears,
  fetchSemiannuals,
} from "@/services/environmentService";

export default function Table() {
  const getMainCategoryIdentifier = (mainCategory: string): string => {
    const mainCategoryMappingsIdentifier: { [key: string]: string } = {
        "คุณภาพอากาศในบรรยากาศ": "Env_Wind",
        "คุณภาพอากาศภายในสถานประกอบการ": "Env_Air",
        "ผลการตรวจวัดคุณภาพเสียงโดยทั่วไป": "Env_Noise",
        "คุณภาพน้ำทิ้ง": "Env_WasteWater",
        "คุณภาพน้ำทะเล": "Env_SeaWater",
        "นิเวศวิทยาทางทะเล": "Env_MarineEcology"
    };
    console.log("✅ Mapping Main Category Identifier:", mainCategory, "→", mainCategoryMappingsIdentifier[mainCategory]);
    return mainCategoryMappingsIdentifier[mainCategory] || "";
};

// ✅ ฟังก์ชันแมป `Sub Category` ภาษาไทยเป็น `Table Identifier`
const getTableIdentifier = (subCategory: string): string => {
    const subCategoryMappingsIdentifier: { [key: string]: string } = {
        "ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง": "WDWS",
        "ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ": "WindQuality",
        "ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ": "SO2",
        "ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ": "Vocs",
        "ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ": "AirQuality",
        "ผลการตรวจวัดระดับเสียงโดยทั่วไป": "NoiseLevelNormal",
        "ผลการตรวจวัดคุณภาพเสียง 90": "NoiseLevel90",
        "ผลการติดตามตรวจสอบ": "Monitorresult",
        "ผลการตรวจวัดคุณภาพน้ำทิ้ง": "WasteWater",
        "ผลการตรวจวัดคุณภาพน้ำทะเล": "SeaWater",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช": "PlanktonPhytos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์": "PlanktonZoos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน": "Benthos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา": "FishLarvaeEggs",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน": "JuvenileAquaticAnimals"
    };
    console.log("✅ Mapping Sub Category Identifier:", subCategory, "→", subCategoryMappingsIdentifier[subCategory]);
    return subCategoryMappingsIdentifier[subCategory] || "";
};

  const getMainCategoryIdentifierReceived = (mainCategory: string): string => {
    const mainCategoryMappingsReceived: { [key: string]: string } = {
      Env_Wind: "คุณภาพอากาศในบรรยากาศ",
      Env_Air: "คุณภาพอากาศภายในสถานประกอบการ",
      Env_Noise: "ผลการตรวจวัดคุณภาพเสียงโดยทั่วไป",
      Env_WasteWater: "คุณภาพน้ำทิ้ง",
      Env_SeaWater: "คุณภาพน้ำทะเล",
      Env_MarineEcology: "นิเวศวิทยาทางทะเล",
    };
    console.log(
      "✅ Mapping Main Category Filter Received:",
      mainCategory,
      "→",
      mainCategoryMappingsReceived[mainCategory]
    );
    return mainCategoryMappingsReceived[mainCategory] || "";
  };

  const getTableIdentifierReceived = (subCategory: string): string => {
    const subCategoryMappingsReceived: { [key: string]: string } = {
      WDWS: "ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง",
      WindQuality: "ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ",
      SO2: "ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ",
      Vocs: "ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ",
      AirQuality: "ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ",
      NoiseLevelNormal: "ผลการตรวจวัดระดับเสียงโดยทั่วไป",
      NoiseLevel90: "ผลการตรวจวัดคุณภาพเสียง 90",
      Monitorresult: "ผลการติดตามตรวจสอบ",
      WasteWater: "ผลการตรวจวัดคุณภาพน้ำทิ้ง",
      SeaWater: "ผลการตรวจวัดคุณภาพน้ำทะเล",
      PlanktonPhytos: "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช",
      PlanktonZoos: "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์",
      Benthos: "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน",
      FishLarvaeEggs: "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา",
      JuvenileAquaticAnimals: "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน",
    };
    console.log(
      "✅ Mapping Sub Category Filter Received:",
      subCategory,
      "→",
      subCategoryMappingsReceived[subCategory]
    );
    return subCategoryMappingsReceived[subCategory] || "";
  };

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [sortingColumn, setSortingColumn] = useState<string | null>(null);
  const [sortingOrder, setSortingOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [mainCategories, setMainCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [semiannualName, setSemiannualsName] = useState<string[]>([]);

  const exportToCSV = () => {
    if (paginatedData.length === 0) {
      alert("⚠️ ไม่มีข้อมูลให้ดาวน์โหลด");
      return;
    }

    const headers = columns.join(","); // ✅ หัวข้อคอลัมน์
    const rows = paginatedData.map((row) =>
      columns.map((col) => `"${row[col]}"`).join(",")
    );

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n"); // ✅ เพิ่ม `\uFEFF` (BOM) เพื่อแก้ภาษาเพี้ยน
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "exported_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [filters, setFilters] = useState({
    mainCategory: "",
    subCategory: "",
    stationName: "",
    semiannualName: "",
    year: "",
  });

  useEffect(() => {
    fetchMainCategories().then((categories) => {
      if (Array.isArray(categories)) {
        setMainCategories(categories);
      } else {
        setMainCategories([]); // ✅ ตั้งค่าเริ่มต้นเป็น Array ว่าง
      }
    });
  }, []);

  useEffect(() => {
    if (filters.mainCategory) {
      console.log("✅ Fetching Sub Categories for:", filters.mainCategory);
      fetchSubCategories(filters.mainCategory).then(setSubCategories);
    } else {
      setSubCategories([]);
    }
  }, [filters.mainCategory]);

  useEffect(() => {
    if (filters.mainCategory && filters.subCategory) {
      console.log(
        "✅ Fetching Filters for:",
        filters.mainCategory,
        filters.subCategory
      );

      fetchStations(filters.mainCategory, filters.subCategory).then(
        setStations
      );
      fetchYears(filters.mainCategory, filters.subCategory).then(setYears);
      fetchSemiannuals(filters.mainCategory, filters.subCategory).then(
        setSemiannualsName
      );
    } else {
      setStations([]);
      setYears([]);
      setSemiannualsName([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  const handleFetchData = async () => {
    setLoading(true);
    // Reset to page 1 when fetching new data with filters
    setCurrentPage(1);
    
    // The actual data fetching is handled by the useEffect that depends on currentPage and filters
  };
  
  // Add useEffect to fetch data when pagination or filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!filters.mainCategory || !filters.subCategory) {
        return;
      }
      
      setLoading(true);
      
      const mainCategoryIdentifier = getMainCategoryIdentifier(filters.mainCategory);
      const tableIdentifier = getTableIdentifier(filters.subCategory);

      console.log("✅ Fetching data with:");
      console.log("➡️ Main Category:", mainCategoryIdentifier);
      console.log("➡️ Sub Category:", filters.subCategory);
      console.log("➡️ Table Identifier:", tableIdentifier);
      console.log("➡️ Station Name:", filters.stationName);
      console.log("➡️ SemiannualName:", filters.semiannualName);
      console.log("➡️ Year:", filters.year);
      console.log("➡️ Page:", currentPage);
      console.log("➡️ Page Size:", rowsPerPage);

      const MainCategoryIdentifierReceived = getMainCategoryIdentifierReceived(
        String(mainCategoryIdentifier)
      );
      const TableIdentifierReceived = getTableIdentifierReceived(
        String(tableIdentifier)
      );
      console.log(
        "✅ Fetching data with Received:",
        MainCategoryIdentifierReceived
      );
      console.log("✅ Fetching data with Received:", TableIdentifierReceived);
      const result = await fetchEnvironmentalData(
        MainCategoryIdentifierReceived,
        TableIdentifierReceived,
        {
          stationName: filters.stationName,
          semiannualName: filters.semiannualName,
          year: filters.year,
          page: currentPage,
          pageSize: rowsPerPage
        }
      );

      console.log("✅ API Response:", result);

      if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
        setColumns(Object.keys(result.data[0])); // ✅ อัปเดต Column Headers
        setData(result.data); // ✅ อัปเดตข้อมูลในตาราง
        // Update total records count for pagination
        setTotalRecords(result.totalCount || 0);
      } else {
        console.warn("⚠️ No data returned from API");
        setColumns([]);
        setData([]);
        setTotalRecords(0);
      }

      setLoading(false);
    };
    
    fetchData();
  }, [currentPage, filters, rowsPerPage]); // Re-fetch when page or filters change

  const handleSort = (column: string) => {
    if (sortingColumn === column) {
      setSortingOrder(sortingOrder === "asc" ? "desc" : "asc"); // ✅ สลับทิศทาง
    } else {
      setSortingColumn(column);
      setSortingOrder("asc"); // ✅ ค่าเริ่มต้นเป็น `asc` เมื่อคลิกคอลัมน์ใหม่
    }
  };

  const sortedData = useMemo(() => {
    if (!sortingColumn) return data; // ✅ ถ้าไม่มีการเรียง ให้คืนค่าข้อมูลตามปกติ

    return [...data].sort((a, b) => {
      const valueA = a[sortingColumn];
      const valueB = b[sortingColumn];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortingOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortingOrder === "asc"
          ? valueA.localeCompare(valueB, "th") // ✅ ใช้ locale ของภาษาไทย
          : valueB.localeCompare(valueA, "th");
      }

      return 0;
    });
  }, [data, sortingColumn, sortingOrder]);

  // Add state for total records count
  const [totalRecords, setTotalRecords] = useState<number>(0);
  
  // Use the data directly from the API response since backend already handles pagination
  const paginatedData = useMemo(() => {
    return sortedData;
  }, [sortedData]);

  // Calculate total pages based on total records from API
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Container>
      <section id="table" className="mb-10">
        <SectionTitle
          textPicture="📋"
          title="Filter Environmental Data"
          align="center"
        />
        <div className="bg-white p-4 shadow-md mt-4 rounded text-black">
          {/* 🔽 Main Category & Sub Category Selection */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="p-2 border border-gray-300 rounded"
              value={filters.mainCategory}
              onChange={(e) =>
                setFilters({ mainCategory: e.target.value, subCategory: "" })
              }
            >
              <option value="">เลือกหัวข้อใหญ่</option>
              {Array.isArray(mainCategories) &&
                mainCategories.map((category, index) => (
                  <option key={index} value={category.mainName}>
                    {category.mainName}
                  </option>
                ))}
            </select>

            <select
              className="p-2 border border-gray-300 rounded"
              value={filters.subCategory}
              onChange={(e) =>
                setFilters({ ...filters, subCategory: e.target.value })
              }
              disabled={!filters.mainCategory}
            >
              <option value="">เลือกหัวข้อรอง</option>
              {subCategories.map((subCategory, index) => (
                <option key={index} value={subCategory.subName}>
                  {subCategory.subName}
                </option>
              ))}
            </select>
          </div>

          {/* 🔽 Filter for Station, Semiannual, Year */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Station */}
            <select
              className="p-2 border border-gray-300 rounded"
              value={filters.stationName}
              onChange={(e) =>
                setFilters({ ...filters, stationName: e.target.value })
              }
              disabled={!filters.subCategory}
            >
              <option value="">เลือกสถานีตรวจวัด</option>
              {Array.isArray(stations) &&
                stations.map((station, index) => (
                  <option key={index} value={station.stationName}>
                    {station.stationName}
                  </option>
                ))}
            </select>

            {/* Year */}
            <select
              className="p-2 border border-gray-300 rounded"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              disabled={!filters.subCategory} // ✅ ต้องเลือก Sub Category ก่อน
            >
              <option value="">เลือกปี</option>
              {Array.isArray(years) &&
                years.map((year, index) => (
                  <option key={index} value={year.year}>
                    {year.year}
                  </option>
                ))}
            </select>

            {/* Semiannual */}
            <select
              className="p-2 border border-gray-300 rounded"
              value={filters.semiannualName}
              onChange={(e) =>
                setFilters({ ...filters, semiannualName: e.target.value })
              }
              disabled={!filters.subCategory}
            >
              <option value="">เลือกครั้งที่มาเก็บข้อมูล</option>
              {Array.isArray(semiannualName) &&
                semiannualName.map((semi, index) => (
                  <option key={index} value={semi.semiannualName}>
                    {semi.semiannualName}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-start space-x-4">
            <button
              className="mt-4 bg-blue-500 text-white p-2 rounded cursor-pointer"
              onClick={handleFetchData}
            >
              {loading ? "Loading..." : "แสดงข้อมูล"}
            </button>

            <button
              className="mt-4 bg-green-500 text-white p-2 rounded cursor-pointer"
              onClick={exportToCSV}
            >
              📥 Export CSV
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-auto max-h-[500px] mt-4">
          {data.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300 text-black">
              <thead className="bg-gray-300 sticky top-0 shadow-md">
                <tr>
                  <th className="border p-3">#</th>
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className="border p-3 cursor-pointer select-none"
                      onClick={() => handleSort(col)}
                    >
                      {col}{" "}
                      {sortingColumn === col
                        ? sortingOrder === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-center">
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-100">
                    <td className="border p-3">{rowIndex + 1}</td>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="border p-3">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 mt-4 dark:text-white">
              ⚠️ ไม่มีข้อมูลที่จะแสดง
            </p>
          )}
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-gray-300 px-3 py-2 rounded disabled:opacity-50"
            >
              ⬅️
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-2 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-300 px-3 py-2 rounded disabled:opacity-50"
            >
              ➡️
            </button>
          </div>
        </div>
      </section>
    </Container>
  );
}
