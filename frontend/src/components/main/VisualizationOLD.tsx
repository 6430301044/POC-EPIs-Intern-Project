import Select from "react-select";
import { useEffect, useState, useRef } from "react";
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
import { Chart } from "chart.js";

export default function Visualization() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [mainCategories, setMainCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [semiannuals, setSemiannuals] = useState<number[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnValues, setColumnValues] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    mainCategory: "",
    subCategory: "",
    stationName: [],
    semiannual: [],
    year: [],
    valueColumns: [],
    selectedColumn: "",
  });

  const chartRef = useRef<Chart | null>(null);

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
      fetchStations(filters.mainCategory, filters.subCategory).then(
        (stations) => setStations(Array.isArray(stations) ? stations : [])
      );
      fetchYears(filters.mainCategory, filters.subCategory).then((years) =>
        setYears(Array.isArray(years) ? years : [])
      );
      fetchSemiannuals(filters.mainCategory, filters.subCategory).then(
        (semiannuals) =>
          setSemiannuals(Array.isArray(semiannuals) ? semiannuals : [])
      );
    } else {
      setYears([]);
      setSemiannuals([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  useEffect(() => {
    if (filters.mainCategory && filters.subCategory) {
      fetchColumns(filters.mainCategory, filters.subCategory).then(setColumns);
    } else {
      setColumns([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  useEffect(() => {
    if (filters.mainCategory && filters.subCategory && filters.selectedColumn) {
      fetchColumnValues(
        filters.mainCategory,
        filters.subCategory,
        filters.selectedColumn
      ).then((values) => setColumnValues(Array.isArray(values) ? values : []));
    } else {
      setColumnValues([]);
    }
  }, [filters.mainCategory, filters.subCategory, filters.selectedColumn]);

  const handleFetchData = async () => {
    setLoading(true);

    if (!filters.valueColumns.length) {
      alert("⚠️ กรุณาเลือกค่าที่ต้องการแสดงผล (Value Columns)");
      setLoading(false);
      return;
    }

    console.log("✅ Fetching data with filters:", filters);

    const result = await fetchEnvironmentalData(
      filters.mainCategory,
      filters.subCategory,
      {
        stationName: filters.stationName.join(","),
        semiannual: filters.semiannual.join(","),
        year: filters.year.join(","),
        valueColumns: filters.valueColumns.join(","),
      }
    );

    console.log("✅ API Response:", result);

    if (result.length > 0) {
      setData(result);
    } else {
      console.warn("⚠️ No data found for selected filters.");
      setData([]);
    }

    setLoading(false);
  };

  const chartData = {
    labels: data.map((d) => `${d.stationName} (${d.year} ${d.semiannual})`),
    datasets: filters.valueColumns.length > 0
      ? filters.valueColumns.map((col, index) => ({
          label: col,
          data: data.map((d) => d[col] ?? 0),
          borderColor: `hsl(${index * 60}, 70%, 50%)`,
          backgroundColor: `hsl(${index * 60}, 70%, 80%)`,
          borderWidth: 2,
          fill: false,
        }))
      : [{ label: "No Data", data: [], borderWidth: 0 }],
  };

  console.log("✅ Chart Data:", chartData);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }
  }, [data]);

  return (
    <Container>
      <section id="visualization" className="mb-10">
        <SectionTitle
          textPicture="📊"
          title="Data Visualization"
          align="center"
        />
        <div className="bg-white p-4 shadow-md mt-4 rounded dark:text-black">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 dark:text-black">
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
            options={stations.map((s) => ({
              label: s.stationName,
              value: s.stationName,
            }))}
            className="mb-4 dark:text-black"
            onChange={(selected) =>
              setFilters({
                ...filters,
                stationName: selected.map((s) => s.value),
              })
            }
          />

          <Select
            isMulti
            options={years.map((y) => ({ label: y.year, value: y.year }))}
            className="mb-4 dark:text-black"
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
            className="mb-4 dark:text-black"
            onChange={(selected) =>
              setFilters({
                ...filters,
                semiannual: selected.map((s) => s.value),
              })
            }
          />

          <div>
            <label className="dark:text-black">เลือกคอลัมน์:</label>
            <select
              onChange={(e) =>
                setFilters({ ...filters, selectedColumn: e.target.value })
              }
            >
              <option value="" className="dark:text-black">
                เลือกคอลัมน์
              </option>
              {Array.isArray(columns) &&
                columns.map((col, index) => (
                  <option key={index} value={col} className="dark:text-black">
                    {col}
                  </option>
                ))}
            </select>

            <label className="dark:text-black">เลือกค่าภายในคอลัมน์:</label>
            <select
              disabled={
                !Array.isArray(columnValues) || columnValues.length === 0
              }
            >
              <option value="" className="dark:text-black">
                เลือกค่า
              </option>
              {Array.isArray(columnValues) &&
                columnValues.map((val, index) => (
                  <option key={index} value={val} className="dark:text-black">
                    {val}
                  </option>
                ))}
            </select>
          </div>

          <Select
            isMulti
            options={columns.map((col) => ({ label: col, value: col }))}
            className="mb-4 dark:text-black"
            onChange={(selected) =>
              setFilters({ ...filters, valueColumns: selected.map((s) => s.value) })
            }
          />

          <button
            className="mt-4 bg-blue-500 text-white p-2 rounded"
            onClick={handleFetchData}
          >
            {loading ? "Loading..." : "แสดงข้อมูล"}
          </button>

          {/* แสดงกราฟ */}
          {data.length > 0 && (
            <div className="mt-6 dark:text-black">
              <Line ref={chartRef} data={chartData} />
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
