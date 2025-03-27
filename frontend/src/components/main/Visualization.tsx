import { useState, useEffect } from 'react';
import { Container } from "../template/Container";
import { SectionTitle } from "../template/SectionTitle";
import { Line, Bar, Scatter, Pie } from 'react-chartjs-2';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { fetchEnvironmentalData, fetchMainCategories, fetchSubCategories, fetchStations, fetchYears, fetchSemiannuals } from '../../services/environmentService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type ChartType = 'line' | 'bar' | 'scatter' | 'pie';

export default function Visualization() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Filter states
  const [mainCategories, setMainCategories] = useState<{ mainName: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ subName: string }[]>([]);
  const [stations, setStations] = useState<{ stationName: string }[]>([]);
  const [years, setYears] = useState<{ year: number }[]>([]);
  const [semiannual, setSemiannuals] = useState<{ semiannual: string }[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    mainCategory: "",
    subCategory: "",
    stationName: "",
    semiannual: "",
    year: "",
  });

  // Chart customization states
  const [chartTitle, setChartTitle] = useState('Environmental Data Visualization');
  const [xAxisLabel, setXAxisLabel] = useState('Time Period');
  const [yAxisLabel, setYAxisLabel] = useState('Values');
  const [showLegend, setShowLegend] = useState(true);

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
      fetchStations(filters.mainCategory, filters.subCategory).then(setStations);
      fetchYears(filters.mainCategory, filters.subCategory).then(setYears);
      fetchSemiannuals(filters.mainCategory, filters.subCategory).then(setSemiannuals);
    } else {
      setStations([]);
      setYears([]);
      setSemiannuals([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      if (!filters.mainCategory || !filters.subCategory || !filters.stationName || !filters.year || !filters.semiannual) {
        alert('⚠️ กรุณาเลือกตัวกรองให้ครบถ้วน');
        setLoading(false);
        return;
      }

      console.log('✅ Fetching data with filters:', filters);
      const result = await fetchEnvironmentalData(
        filters.mainCategory,
        filters.subCategory,
        {
          stationName: filters.stationName,
          semiannual: filters.semiannual,
          year: filters.year,
        }
      );
      console.log('✅ API Response:', result);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('❌ API Response is not in the expected format');
        setData([]);
        return;
      }

      if (result.data.length === 0) {
        console.warn('⚠️ No data found for selected filters');
        alert('⚠️ ไม่พบข้อมูลสำหรับตัวกรองที่เลือก');
        setData([]);
        return;
      }

      setData(result.data);
      const numericColumns = Object.keys(result.data[0]).filter(key => 
        typeof result.data[0][key] === 'number' && 
        !['year', 'semiannual'].includes(key)
      );
      console.log('✅ Numeric columns found:', numericColumns);
      setSelectedColumns(numericColumns);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      alert('❌ เกิดข้อผิดพลาดในการดึงข้อมูล');
      setData([]);
    }
    setLoading(false);
  };

  const getChartData = () => {
    if (!data.length || !selectedColumns.length) return null;

    const labels = data.map(d => `${d.stationName} (${d.year} ${d.semiannual})`);
    
    return {
      labels,
      datasets: selectedColumns.map((column, index) => ({
        label: column,
        data: data.map(d => d[column]),
        backgroundColor: `hsla(${index * 360 / selectedColumns.length}, 70%, 50%, 0.5)`,
        borderColor: `hsl(${index * 360 / selectedColumns.length}, 70%, 50%)`,
        borderWidth: 1,
      })),
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartTitle,
      },
    },
    scales: chartType !== 'pie' ? {
      x: {
        title: {
          display: true,
          text: xAxisLabel,
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
        },
      },
    } : undefined,
  };

  const renderChart = () => {
    const chartData = getChartData();
    if (!chartData) return null;

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'scatter':
        return <Scatter data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      default:
        return null;
    }
  };

  return (
    <Container>
      <SectionTitle
        title="การแสดงผลข้อมูล"
        textPicture="📊"
        preTitle=""
      />
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select
            className="p-2 border rounded"
            value={filters.mainCategory}
            onChange={(e) => setFilters({
              ...filters,
              mainCategory: e.target.value,
              subCategory: "",
            })}
          >
            <option value="">เลือกหมวดหมู่หลัก</option>
            {mainCategories.map((category, index) => (
              <option key={index} value={category.mainName}>{category.mainName}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded"
            value={filters.subCategory}
            onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
            disabled={!filters.mainCategory}
          >
            <option value="">เลือกหมวดหมู่ย่อย</option>
            {subCategories.map((category, index) => (
              <option key={index} value={category.subName}>{category.subName}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded"
            value={filters.stationName}
            onChange={(e) => setFilters({ ...filters, stationName: e.target.value })}
            disabled={!filters.subCategory}
          >
            <option value="">เลือกสถานี</option>
            {stations.map((station, index) => (
              <option key={index} value={station.stationName}>{station.stationName}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            disabled={!filters.subCategory}
          >
            <option value="">เลือกปี</option>
            {years.map((year, index) => (
              <option key={index} value={year.year}>{year.year}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded"
            value={filters.semiannual}
            onChange={(e) => setFilters({ ...filters, semiannual: e.target.value })}
            disabled={!filters.subCategory}
          >
            <option value="">เลือกช่วงเวลา</option>
            {semiannual.map((period, index) => (
              <option key={index} value={period.semiannual}>{period.semiannual}</option>
            ))}
          </select>

          <button
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={handleFetchData}
            disabled={!filters.mainCategory || !filters.subCategory}
          >
            {loading ? 'กำลังโหลด...' : 'ดึงข้อมูล'}
          </button>
        </div>

        {/* Chart Controls */}
        {data.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="p-2 border rounded"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
              >
                <option value="bar">แผนภูมิแท่ง</option>
                <option value="line">แผนภูมิเส้น</option>
                <option value="scatter">แผนภูมิกระจาย</option>
                <option value="pie">แผนภูมิวงกลม</option>
              </select>

              <Select
                isMulti
                className="text-black"
                options={selectedColumns.map(col => ({ value: col, label: col }))}
                value={selectedColumns.map(col => ({ value: col, label: col }))}
                onChange={(selected) => 
                  setSelectedColumns(selected ? selected.map(option => option.value) : [])
                }
                placeholder="เลือกคอลัมน์ที่ต้องการแสดง"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                className="p-2 border rounded"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="ชื่อกราฟ"
              />
              <input
                type="text"
                className="p-2 border rounded"
                value={xAxisLabel}
                onChange={(e) => setXAxisLabel(e.target.value)}
                placeholder="ชื่อแกน X"
              />
              <input
                type="text"
                className="p-2 border rounded"
                value={yAxisLabel}
                onChange={(e) => setYAxisLabel(e.target.value)}
                placeholder="ชื่อแกน Y"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                />
                แสดงคำอธิบาย
              </label>
            </div>
          </div>
        )}

        {/* Chart Display */}
        <div className="mt-6 h-[500px]">
          {data.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {loading ? 'กำลังโหลดข้อมูล...' : 'เลือกตัวกรองและกดปุ่มดึงข้อมูลเพื่อแสดงกราฟ'}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
