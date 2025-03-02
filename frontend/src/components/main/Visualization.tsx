import Select from "react-select";
import { useEffect, useState } from "react";
import { Container } from "../template/Container";
import { SectionTitle } from "../template/SectionTitle";
import {
  fetchEnvironmentalData,
  fetchMainCategories,
  fetchSubCategories,
  fetchStations,
  fetchYears,
  fetchSemiannuals,
  fetchColumns,
  fetchColumnValues,
} from "@/services/environmentService";
import { Line } from "react-chartjs-2";

export default function Visualization() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [mainCategories, setMainCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [semiannuals, setSemiannuals] = useState<number[]>([]);
  const [valueColumns, setValueColumns] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]); // ✅ ป้องกัน `undefined`
  const [columnValues, setColumnValues] = useState<string[]>([]); // ✅ ป้องกัน `undefined`

  const [filters, setFilters] = useState({
    mainCategory: "",
    subCategory: "",
    stationName: "",
    semiannual: [],
    year: [],
    valueColumns: [],
  });

  useEffect(() => {
    fetchMainCategories().then(setMainCategories);
  }, []);

  useEffect(() => {
    if (filters.mainCategory) {
      fetchSubCategories(filters.mainCategory).then(setSubCategories);
    } else {
      setSubCategories([]);
    }
  }, [filters.mainCategory]);

  useEffect(() => {
    if (filters.mainCategory && filters.subCategory) {
      fetchYears(filters.mainCategory, filters.subCategory).then((years) =>
        setYears(Array.isArray(years) ? years : [])
      ); // ✅ ป้องกัน Error
      fetchSemiannuals(filters.mainCategory, filters.subCategory).then(
        (semiannuals) =>
          setSemiannuals(Array.isArray(semiannuals) ? semiannuals : [])
      ); // ✅ ป้องกัน Error
    } else {
      setYears([]);
      setSemiannuals([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  // ✅ เมื่อเลือก `subCategory` โหลด Column อัตโนมัติ
  useEffect(() => {
    if (filters.mainCategory && filters.subCategory) {
      fetchColumns(filters.mainCategory, filters.subCategory).then(setColumns);
    } else {
      setColumns([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  // ✅ เมื่อเลือก `Column` โหลดค่าภายใน Column อัตโนมัติ
  useEffect(() => {
    if (filters.mainCategory && filters.subCategory && filters.selectedColumn) {
      fetchColumnValues(
        filters.mainCategory,
        filters.subCategory,
        filters.selectedColumn
      ).then((values) => setColumnValues(Array.isArray(values) ? values : [])); // ✅ ป้องกัน `undefined`
    } else {
      setColumnValues([]);
    }
  }, [filters.mainCategory, filters.subCategory, filters.selectedColumn]);

  const handleFetchData = async () => {
    setLoading(true);
    const result = await fetchEnvironmentalData(
      filters.mainCategory,
      filters.subCategory,
      {
        stationName: filters.stationName,
        semiannual: filters.semiannual.join(","), // ส่งเป็น String คั่นด้วย ,
        year: filters.year.join(","), // ส่งเป็น String คั่นด้วย ,
        valueColumns: filters.valueColumns.join(","), // ส่ง Value Columns เป็น String
      }
    );
    setData(result);
    setLoading(false);
  };

  // ✅ กำหนดโครงสร้างข้อมูลของ `Line Chart`
  const chartData = {
    labels: data.map((d) => d.year + " " + d.semiannual), // แสดงเป็น "2024 1st" เป็นต้น
    datasets: filters.valueColumns.map((col, index) => ({
      label: col,
      data: data.map((d) => d[col]),
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsl(${index * 60}, 70%, 80%)`,
      borderWidth: 2,
      fill: false,
    })),
  };

  return (
    <Container>
      <section id="visualization" className="mb-10">
        <SectionTitle
          textPicture="📊"
          title="Data Visualization"
          align="center"
        />
        <div className="bg-white p-4 shadow-md mt-4 rounded">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="p-2 border border-gray-300 rounded"
              value={filters.mainCategory}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  mainCategory: e.target.value,
                  subCategory: "",
                })
              }
            >
              <option value="">เลือกหัวข้อหลัก</option>
              {mainCategories.map((category, index) => (
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

          <Select
            isMulti
            options={years.map((y) => ({ label: y.year, value: y.year }))}
            className="mb-4"
            onChange={(selected) =>
              setFilters({ ...filters, year: selected.map((s) => s.value) })
            }
          />

          <Select
            isMulti
            options={semiannuals.map((s) => ({
              label: s.semiannual,
              value: s.semiannual,
            }))}
            className="mb-4"
            onChange={(selected) =>
              setFilters({
                ...filters,
                semiannual: selected.map((s) => s.value),
              })
            }
          />

          <div>
            <label>เลือกคอลัมน์:</label>
            <select
              onChange={(e) =>
                setFilters({ ...filters, selectedColumn: e.target.value })
              }
            >
              <option value="">เลือกคอลัมน์</option>
              {columns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>

            <label>เลือกค่าภายในคอลัมน์:</label>
            <select
              disabled={
                !Array.isArray(columnValues) || columnValues.length === 0
              }
            >
              <option value="">เลือกค่า</option>
              {Array.isArray(columnValues) &&
                columnValues.map((val, index) => (
                  <option key={index} value={val}>
                    {val}
                  </option>
                ))}
            </select>
          </div>

          <button
            className="mt-4 bg-blue-500 text-white p-2 rounded"
            onClick={handleFetchData}
          >
            {loading ? "Loading..." : "แสดงข้อมูล"}
          </button>

          {/* แสดงกราฟ */}
          {data.length > 0 && (
            <div className="mt-6">
              <Line data={chartData} />
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
