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
import { Radar, Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Scale,
} from "chart.js";

// ✅ ลงทะเบียน Components ที่ใช้กับ Chart.js
ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chart type options
type ChartType = 'bar' | 'line' | 'radar' | 'pie' | 'doughnut';

// Define wind direction order for proper radar chart display
const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

// Color palette for charts
const CHART_COLORS = [
  { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
  { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
  { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' },
  { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
  { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
  { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' },
];

// Define a type for comparison dataset
interface ComparisonDataset {
  id: string;
  data: any[];
  filters: {
    mainCategory: string;
    subCategory: string;
    stationName: string;
    semiannual: string;
    year: string;
  };
  label: string;
}

export default function Visualization() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<string[]>([]);

  const [mainCategories, setMainCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [semiannuals, setSemiannuals] = useState<string[]>([]);

  // Visualization builder state
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxisColumn, setXAxisColumn] = useState<string>('');
  const [yAxisColumns, setYAxisColumns] = useState<string[]>([]);
  const [chartTitle, setChartTitle] = useState<string>('Data Visualization');
  const [xAxisLabel, setXAxisLabel] = useState<string>('X Axis');
  const [yAxisLabel, setYAxisLabel] = useState<string>('Y Axis');
  
  // New state for handling different value ranges
  const [useSecondaryYAxis, setUseSecondaryYAxis] = useState<boolean>(false);
  const [secondaryYAxisColumns, setSecondaryYAxisColumns] = useState<string[]>([]);
  const [secondaryYAxisLabel, setSecondaryYAxisLabel] = useState<string>('Secondary Y Axis');
  const [autoScale, setAutoScale] = useState<boolean>(true);
  
  // State for data comparison feature
  const [comparisonDatasets, setComparisonDatasets] = useState<ComparisonDataset[]>([]);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  const [filters, setFilters] = useState({
    mainCategory: "",
    subCategory: "",
    stationName: "",
    semiannual: "",
    year: "",
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
      fetchStations(filters.mainCategory, filters.subCategory).then(
        setStations
      );
      fetchYears(filters.mainCategory, filters.subCategory).then(setYears);
      fetchSemiannuals(filters.mainCategory, filters.subCategory).then(
        setSemiannuals
      );
    } else {
      setStations([]);
      setYears([]);
      setSemiannuals([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  // Extract available columns from data for selection
  useEffect(() => {
    if (data.length > 0) {
      const availableColumns = Object.keys(data[0]);
      setColumns(availableColumns);
      
      // Set default columns if not already set
      if (!xAxisColumn && availableColumns.length > 0) {
        setXAxisColumn(availableColumns[0]);
      }
      
      if (yAxisColumns.length === 0 && availableColumns.length > 1) {
        setYAxisColumns([availableColumns[1]]);
      }
    }
  }, [data]);

  const handleFetchData = async () => {
    setLoading(true);
    const result = await fetchEnvironmentalData(
      filters.mainCategory,
      filters.subCategory,
      {
        stationName: filters.stationName,
        semiannual: filters.semiannual,
        year: filters.year,
      }
    );
    setData(result);
    setLoading(false);
  };
  
  // Add current dataset to comparison
  const addToComparison = () => {
    if (data.length === 0) return;
    
    // Create a label for this dataset based on its filters
    const datasetLabel = `${filters.mainCategory} - ${filters.subCategory} (${filters.stationName || 'All'}, ${filters.year || 'All'}, ${filters.semiannual || 'All'})`;
    
    // Check if this exact dataset is already in comparison
    const isDuplicate = comparisonDatasets.some(
      dataset => 
        dataset.filters.mainCategory === filters.mainCategory &&
        dataset.filters.subCategory === filters.subCategory &&
        dataset.filters.stationName === filters.stationName &&
        dataset.filters.semiannual === filters.semiannual &&
        dataset.filters.year === filters.year
    );
    
    if (!isDuplicate) {
      const newDataset: ComparisonDataset = {
        id: Date.now().toString(),
        data: [...data],
        filters: { ...filters },
        label: datasetLabel
      };
      
      setComparisonDatasets([...comparisonDatasets, newDataset]);
      setShowComparison(true);
    }
  };
  
  // Remove a dataset from comparison
  const removeFromComparison = (id: string) => {
    setComparisonDatasets(comparisonDatasets.filter(dataset => dataset.id !== id));
    
    // If no datasets left, hide comparison view
    if (comparisonDatasets.length <= 1) {
      setShowComparison(false);
    }
  };
  
  // Clear all comparison datasets
  const clearComparison = () => {
    setComparisonDatasets([]);
    setShowComparison(false);
  };
  
  // Handle adding a Y-axis column
  const handleAddYAxisColumn = (column: string) => {
    if (!yAxisColumns.includes(column) && !secondaryYAxisColumns.includes(column)) {
      setYAxisColumns([...yAxisColumns, column]);
    }
  };
  
  // Handle removing a Y-axis column
  const handleRemoveYAxisColumn = (column: string) => {
    setYAxisColumns(yAxisColumns.filter(col => col !== column));
  };

  // Handle adding a secondary Y-axis column
  const handleAddSecondaryYAxisColumn = (column: string) => {
    if (!secondaryYAxisColumns.includes(column) && !yAxisColumns.includes(column)) {
      setSecondaryYAxisColumns([...secondaryYAxisColumns, column]);
    }
  };
  
  // Handle removing a secondary Y-axis column
  const handleRemoveSecondaryYAxisColumn = (column: string) => {
    setSecondaryYAxisColumns(secondaryYAxisColumns.filter(col => col !== column));
  };
  
  // Move column between primary and secondary Y-axis
  const moveToSecondaryAxis = (column: string) => {
    if (yAxisColumns.includes(column)) {
      setYAxisColumns(yAxisColumns.filter(col => col !== column));
      setSecondaryYAxisColumns([...secondaryYAxisColumns, column]);
    }
  };
  
  const moveToPrimaryAxis = (column: string) => {
    if (secondaryYAxisColumns.includes(column)) {
      setSecondaryYAxisColumns(secondaryYAxisColumns.filter(col => col !== column));
      setYAxisColumns([...yAxisColumns, column]);
    }
  };

  // Function to group and aggregate wind direction data
  const processWindDirectionData = (data: any[], xAxisColumn: string, valueColumn: string) => {
    // Check if we're dealing with wind direction data
    const isWindDirectionData = xAxisColumn.toLowerCase().includes('direction') || 
                               WIND_DIRECTIONS.some(dir => data.some(item => item[xAxisColumn] === dir));
    
    if (!isWindDirectionData) {
      return { labels: data.map(item => item[xAxisColumn]), values: data.map(item => item[valueColumn] || 0) };
    }
    
    // Create an object to hold aggregated values for each direction
    const directionMap: Record<string, number> = {};
    
    // Initialize all directions with zero
    WIND_DIRECTIONS.forEach(dir => {
      directionMap[dir] = 0;
    });
    
    // Aggregate values for each direction
    data.forEach(item => {
      const direction = item[xAxisColumn];
      if (WIND_DIRECTIONS.includes(direction)) {
        directionMap[direction] += (item[valueColumn] || 0);
      }
    });
    
    // Convert back to arrays in the correct order
    return {
      labels: WIND_DIRECTIONS,
      values: WIND_DIRECTIONS.map(dir => directionMap[dir])
    };
  };
  
  // Dynamic chart data based on user selections and comparison mode
  const chartData = useMemo(() => {
    // If in comparison mode and we have comparison datasets
    if (showComparison && comparisonDatasets.length > 0) {
      // For comparison, we need a common x-axis
      // We'll use the first dataset's data for labels if possible
      const firstDataset = comparisonDatasets[0];
      const labels = firstDataset.data.map(item => item[xAxisColumn]);
      
      // Create datasets for each comparison dataset and selected y-axis column
      const comparisonChartDatasets = [];
      
      // For each comparison dataset
      comparisonDatasets.forEach((dataset, datasetIndex) => {
        // For each selected y-axis column
        yAxisColumns.forEach((column, columnIndex) => {
          const colorIndex = (datasetIndex * yAxisColumns.length + columnIndex) % CHART_COLORS.length;
          const color = CHART_COLORS[colorIndex];
          
          comparisonChartDatasets.push({
            label: `${dataset.label} - ${column}`,
            data: dataset.data.map(item => item[column] || 0),
            backgroundColor: chartType === 'line' ? color.border : color.bg,
            borderColor: color.border,
            borderWidth: 1,
            fill: chartType === 'radar',
            tension: chartType === 'line' ? 0.4 : undefined,
            yAxisID: 'y',
          });
        });
        
        // Add secondary y-axis columns if enabled
        if (useSecondaryYAxis) {
          secondaryYAxisColumns.forEach((column, columnIndex) => {
            const colorIndex = (datasetIndex * secondaryYAxisColumns.length + columnIndex + yAxisColumns.length) % CHART_COLORS.length;
            const color = CHART_COLORS[colorIndex];
            
            comparisonChartDatasets.push({
              label: `${dataset.label} - ${column}`,
              data: dataset.data.map(item => item[column] || 0),
              backgroundColor: chartType === 'line' ? color.border : color.bg,
              borderColor: color.border,
              borderWidth: 1,
              fill: chartType === 'radar',
              tension: chartType === 'line' ? 0.4 : undefined,
              yAxisID: 'y1',
            });
          });
        }
      });
      
      return {
        labels,
        datasets: comparisonChartDatasets,
      };
    }
    
    // Regular single dataset mode
    if (!data.length || !xAxisColumn || (!yAxisColumns.length && !secondaryYAxisColumns.length)) {
      return {
        labels: [],
        datasets: [],
      };
    }
    
    // Special handling for radar charts with wind direction data
    let labels = [];
    if (chartType === 'radar' && xAxisColumn.toLowerCase().includes('direction') || 
        WIND_DIRECTIONS.some(dir => data.some(item => item[xAxisColumn] === dir))) {
      // Use the predefined wind direction order for radar charts
      labels = WIND_DIRECTIONS;
    } else {
      // Extract labels from the selected X-axis column
      labels = data.map(item => item[xAxisColumn]);
    }
    
    // Create datasets for each selected primary Y-axis column
    const primaryDatasets = yAxisColumns.map((column, index) => {
      const colorIndex = index % CHART_COLORS.length;
      const color = CHART_COLORS[colorIndex];
      
      // Process data specially for radar charts with wind direction data
      let columnData;
      if (chartType === 'radar' && (xAxisColumn.toLowerCase().includes('direction') || 
          WIND_DIRECTIONS.some(dir => data.some(item => item[xAxisColumn] === dir)))) {
        const processed = processWindDirectionData(data, xAxisColumn, column);
        columnData = processed.values;
      } else {
        columnData = data.map(item => item[column] || 0);
      }
      
      return {
        label: column,
        data: columnData,
        backgroundColor: chartType === 'line' ? color.border : color.bg,
        borderColor: color.border,
        borderWidth: 1,
        fill: chartType === 'radar',
        tension: chartType === 'line' ? 0.4 : undefined,
        yAxisID: 'y',
      };
    });
    
    // Create datasets for each selected secondary Y-axis column (if enabled)
    const secondaryDatasets = useSecondaryYAxis ? secondaryYAxisColumns.map((column, index) => {
      const colorIndex = (index + yAxisColumns.length) % CHART_COLORS.length;
      const color = CHART_COLORS[colorIndex];
      
      return {
        label: column,
        data: data.map(item => item[column] || 0),
        backgroundColor: chartType === 'line' ? color.border : color.bg,
        borderColor: color.border,
        borderWidth: 1,
        fill: chartType === 'radar',
        tension: chartType === 'line' ? 0.4 : undefined,
        yAxisID: 'y1',
      };
    }) : [];

    return {
      labels,
      datasets: [...primaryDatasets, ...secondaryDatasets],
    };
  }, [data, xAxisColumn, yAxisColumns, secondaryYAxisColumns, chartType, useSecondaryYAxis, comparisonDatasets, showComparison]);
  
  // Chart options
  const chartOptions = useMemo(() => {
    // Base options for all chart types
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: !!chartTitle,
          text: chartTitle,
        },
      },
    };
    
    // For chart types that don't support scales
    if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar') {
      return baseOptions;
    }
    
    // Configure scales for chart types that support them
    const scalesOptions: any = {
      x: {
        title: {
          display: true,
          text: xAxisLabel,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: yAxisLabel,
        },
        beginAtZero: !autoScale,
      },
    };
    
    // Add secondary Y-axis if enabled and has columns assigned
    if (useSecondaryYAxis && secondaryYAxisColumns.length > 0) {
      scalesOptions.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: secondaryYAxisLabel,
        },
        beginAtZero: !autoScale,
        // Ensure the grid lines don't overlap with the primary y-axis
        grid: {
          drawOnChartArea: false,
        },
      };
    }
    
    return {
      ...baseOptions,
      scales: scalesOptions,
    };
  }, [chartType, chartTitle, xAxisLabel, yAxisLabel, secondaryYAxisLabel, useSecondaryYAxis, secondaryYAxisColumns, autoScale]);

  return (
    <Container>
      <section id="visualization" className="mb-10">
        <SectionTitle
          textPicture="📊"
          title="Data Visualization"
          align="center"
        />
        <div className="bg-white p-4 shadow-md mt-4 rounded dark:text-black">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="p-2 border border-gray-300 rounded"
              value={filters.mainCategory}
              onChange={(e) =>
                setFilters({ mainCategory: e.target.value, subCategory: "" })
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
              value={filters.semiannual}
              onChange={(e) =>
                setFilters({ ...filters, semiannual: e.target.value })
              }
              disabled={!filters.subCategory}
            >
              <option value="">เลือกครั้งที่มาเก็บข้อมูล</option>
              {Array.isArray(semiannuals) &&
                semiannuals.map((semi, index) => (
                  <option key={index} value={semi.semiannual}>
                    {semi.semiannual}
                  </option>
                ))}
            </select>
          </div>

          {/* Visualization Builder Section */}
          <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
            <h3 className="text-lg font-medium mb-3">Visualization Builder</h3>
            
            {/* Chart Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Chart Type</label>
              <select
                className="p-2 border border-gray-300 rounded w-full"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="radar">Radar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
            </div>
            
            {/* Axis Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* X-Axis Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">X-Axis Column</label>
                <select
                  className="p-2 border border-gray-300 rounded w-full"
                  value={xAxisColumn}
                  onChange={(e) => setXAxisColumn(e.target.value)}
                  disabled={!data.length}
                >
                  <option value="">Select X-Axis Column</option>
                  {columns.map((column, index) => (
                    <option key={index} value={column}>{column}</option>
                  ))}
                </select>
              </div>
              
              {/* Y-Axis Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Primary Y-Axis Columns</label>
                <div className="flex flex-wrap gap-2">
                  {columns.map((column, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`y-axis-${index}`}
                        checked={yAxisColumns.includes(column)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleAddYAxisColumn(column);
                          } else {
                            handleRemoveYAxisColumn(column);
                          }
                        }}
                        disabled={!data.length || secondaryYAxisColumns.includes(column)}
                        className="mr-1"
                      />
                      <label htmlFor={`y-axis-${index}`} className="text-sm">
                        {column}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Secondary Y-Axis Options */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="use-secondary-y-axis"
                  checked={useSecondaryYAxis}
                  onChange={(e) => setUseSecondaryYAxis(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="use-secondary-y-axis" className="text-sm font-medium">
                  Enable Secondary Y-Axis (for data with different value ranges)
                </label>
              </div>
              
              {useSecondaryYAxis && (
                <div className="mt-2 pl-6">
                  <label className="block text-sm font-medium mb-1">Secondary Y-Axis Label</label>
                  <input
                    type="text"
                    className="p-2 border border-gray-300 rounded w-full mb-2"
                    value={secondaryYAxisLabel}
                    onChange={(e) => setSecondaryYAxisLabel(e.target.value)}
                    placeholder="Enter secondary Y-axis label"
                  />
                  
                  <label className="block text-sm font-medium mb-1">Secondary Y-Axis Columns</label>
                  <div className="flex flex-wrap gap-2">
                    {columns.map((column, index) => (
                      <div key={`secondary-${index}`} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`secondary-y-axis-${index}`}
                          checked={secondaryYAxisColumns.includes(column)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleAddSecondaryYAxisColumn(column);
                            } else {
                              handleRemoveSecondaryYAxisColumn(column);
                            }
                          }}
                          disabled={!data.length || yAxisColumns.includes(column)}
                          className="mr-1"
                        />
                        <label htmlFor={`secondary-y-axis-${index}`} className="text-sm">
                          {column}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Auto Scaling Option */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-scale"
                  checked={autoScale}
                  onChange={(e) => setAutoScale(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="auto-scale" className="text-sm font-medium">
                  Auto-scale axes (recommended for data with different ranges)
                </label>
              </div>
            </div>
            
            {/* Chart Customization */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Chart Title</label>
              <input
                type="text"
                className="p-2 border border-gray-300 rounded w-full"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">X-Axis Label</label>
                <input
                  type="text"
                  className="p-2 border border-gray-300 rounded w-full"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  placeholder="Enter X-axis label"
                  disabled={chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Y-Axis Label</label>
                <input
                  type="text"
                  className="p-2 border border-gray-300 rounded w-full"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  placeholder="Enter Y-axis label"
                  disabled={chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar'}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={handleFetchData}
              disabled={loading}
            >
              {loading ? "Loading..." : "แสดงข้อมูล"}
            </button>
            
            {data.length > 0 && (
              <button
                className="bg-green-500 text-white p-2 rounded"
                onClick={addToComparison}
              >
                เพิ่มข้อมูลนี้เข้าสู่การเปรียบเทียบ
              </button>
            )}
            
            {comparisonDatasets.length > 0 && (
              <>
                <button
                  className={`p-2 rounded ${showComparison ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                  onClick={() => setShowComparison(!showComparison)}
                >
                  {showComparison ? 'ซ่อนการเปรียบเทียบ' : 'แสดงการเปรียบเทียบ'}
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded"
                  onClick={clearComparison}
                >
                  ล้างการเปรียบเทียบทั้งหมด
                </button>
              </>
            )}
          </div>
          
          {/* Display comparison datasets */}
          {comparisonDatasets.length > 0 && (
            <div className="mt-4 border border-gray-300 rounded p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-3">ชุดข้อมูลที่เลือกเปรียบเทียบ ({comparisonDatasets.length})</h3>
              <div className="space-y-2">
                {comparisonDatasets.map(dataset => (
                  <div key={dataset.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                    <div className="flex-1">{dataset.label}</div>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeFromComparison(dataset.id)}
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* แสดงผลกราฟ */}
          {(data.length > 0 || (showComparison && comparisonDatasets.length > 0)) && (
            <div className="mt-6">
              {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
              {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
              {chartType === 'radar' && <Radar data={chartData} options={chartOptions} />}
              {chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
              {chartType === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}