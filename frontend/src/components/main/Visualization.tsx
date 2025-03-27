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

// Define ordered parameters for other tables
const AIR_QUALITY_INDICES = [
  'ไซลีน', 'เบนซีน', 'เบนซิลคลอไรด์', 'ไดคลอโรเบนซีน'
];

const NOISE_MONITOR_TIME_PERIODS = [
  '10:00 - 10:05', '10:05 - 10:10', '10:10 - 10:15', '10:15 - 10:20', '10:20 - 10:25',
  '10:25 - 10:30', '10:30 - 10:35', '10:35 - 10:40', '10:40 - 10:45', '10:45 - 10:50',
  '10:50 - 10:55', '10:55 - 11:00', '11:00 - 11:05', '11:05 - 11:10', '11:10 - 11:15',
  '11:15 - 11:20', '11:20 - 11:25', '11:25 - 11:30', '11:30 - 11:35', '11:35 - 11:40',
  '11:40 - 11:45', '11:45 - 11:50', '11:50 - 11:55', '11:55 - 12:00', '12:00 - 12:05',
  '12:05 - 12:10', '12:10 - 12:15', '12:15 - 12:20', '12:20 - 12:25', '12:25 - 12:30',
  '12:30 - 12:35', '12:35 - 12:40', '12:40 - 12:45', '12:45 - 12:50', '12:50 - 12:55',
  '12:55 - 13:00', '13:00 - 13:05', '13:05 - 13:10', '13:10 - 13:15', '13:15 - 13:20',
  '13:20 - 13:25', '13:25 - 13:30', '13:30 - 13:35', '13:35 - 13:40', '13:40 - 13:45',
  '13:45 - 13:50', '13:50 - 13:55', '13:55 - 14:00', '14:00 - 14:05', '14:05 - 14:10',
  '14:10 - 14:15', '14:15 - 14:20', '14:20 - 14:25', '14:25 - 14:30', '14:30 - 14:35',
  '14:35 - 14:40', '14:40 - 14:45', '14:45 - 14:50', '14:50 - 14:55', '14:55 - 15:00',
  '15:00 - 15:05', '15:05 - 15:10', '15:10 - 15:15', '15:15 - 15:20', '15:20 - 15:25',
  '15:25 - 15:30', '15:30 - 15:35', '15:35 - 15:40', '15:40 - 15:45', '15:45 - 15:50',
  '15:50 - 15:55', '15:55 - 16:00', '16:00 - 16:05', '16:05 - 16:10', '16:10 - 16:15',
  '16:15 - 16:20', '16:20 - 16:25', '16:25 - 16:30', '16:30 - 16:35', '16:35 - 16:40',
  '16:40 - 16:45', '16:45 - 16:50', '16:50 - 16:55', '16:55 - 17:00', '17:00 - 17:05',
  '17:05 - 17:10', '17:10 - 17:15', '17:15 - 17:20', '17:20 - 17:25', '17:25 - 17:30',
  '17:30 - 17:35', '17:35 - 17:40', '17:40 - 17:45', '17:45 - 17:50', '17:50 - 17:55',
  '17:55 - 18:00', '18:00 - 18:05', '18:05 - 18:10', '18:10 - 18:15', '18:15 - 18:20',
  '18:20 - 18:25', '18:25 - 18:30', '18:30 - 18:35', '18:35 - 18:40', '18:40 - 18:45',
  '18:45 - 18:50', '18:50 - 18:55', '18:55 - 19:00', '19:00 - 19:05', '19:05 - 19:10',
  '19:10 - 19:15', '19:15 - 19:20', '19:20 - 19:25', '19:25 - 19:30', '19:30 - 19:35',
  '19:35 - 19:40', '19:40 - 19:45', '19:45 - 19:50', '19:50 - 19:55', '19:55 - 20:00',
  '20:00 - 20:05', '20:05 - 20:10', '20:10 - 20:15', '20:15 - 20:20', '20:20 - 20:25',
  '20:25 - 20:30', '20:30 - 20:35', '20:35 - 20:40', '20:40 - 20:45', '20:45 - 20:50',
  '20:50 - 20:55', '20:55 - 21:00', '21:00 - 21:05', '21:05 - 21:10', '21:10 - 21:15',
  '21:15 - 21:20', '21:20 - 21:25', '21:25 - 21:30', '21:30 - 21:35', '21:35 - 21:40',
  '21:40 - 21:45', '21:45 - 21:50', '21:50 - 21:55', '21:55 - 22:00', '22:00 - 22:05',
  '22:05 - 22:10', '22:10 - 22:15', '22:15 - 22:20', '22:20 - 22:25', '22:25 - 22:30',
  '22:30 - 22:35', '22:35 - 22:40', '22:40 - 22:45', '22:45 - 22:50', '22:50 - 22:55',
  '22:55 - 23:00', '23:00 - 23:05', '23:05 - 23:10', '23:10 - 23:15', '23:15 - 23:20',
  '23:20 - 23:25', '23:25 - 23:30', '23:30 - 23:35', '23:35 - 23:40', '23:40 - 23:45',
  '23:45 - 23:50', '23:50 - 23:55', '23:55 - 00:00', '00:00 - 00:05', '00:05 - 00:10',
  '00:10 - 00:15', '00:15 - 00:20', '00:20 - 00:25', '00:25 - 00:30', '00:30 - 00:35',
  '00:35 - 00:40', '00:40 - 00:45', '00:45 - 00:50', '00:50 - 00:55', '00:55 - 01:00',
  '01:00 - 01:05', '01:05 - 01:10', '01:10 - 01:15', '01:15 - 01:20', '01:20 - 01:25',
  '01:25 - 01:30', '01:30 - 01:35', '01:35 - 01:40', '01:40 - 01:45', '01:45 - 01:50',
  '01:50 - 01:55', '01:55 - 02:00', '02:00 - 02:05', '02:05 - 02:10', '02:10 - 02:15',
  '02:15 - 02:20', '02:20 - 02:25', '02:25 - 02:30', '02:30 - 02:35', '02:35 - 02:40',
  '02:40 - 02:45', '02:45 - 02:50', '02:50 - 02:55', '02:55 - 03:00', '03:00 - 03:05',
  '03:05 - 03:10', '03:10 - 03:15', '03:15 - 03:20', '03:20 - 03:25', '03:25 - 03:30',
  '03:30 - 03:35', '03:35 - 03:40', '03:40 - 03:45', '03:45 - 03:50', '03:50 - 03:55',
  '03:55 - 04:00', '04:00 - 04:05', '04:05 - 04:10', '04:10 - 04:15', '04:15 - 04:20',
  '04:20 - 04:25', '04:25 - 04:30', '04:30 - 04:35', '04:35 - 04:40', '04:40 - 04:45',
  '04:45 - 04:50', '04:50 - 04:55', '04:55 - 05:00', '05:00 - 05:05', '05:05 - 05:10',
  '05:10 - 05:15', '05:15 - 05:20', '05:20 - 05:25', '05:25 - 05:30', '05:30 - 05:35',
  '05:35 - 05:40', '05:40 - 05:45', '05:45 - 05:50', '05:50 - 05:55', '05:55 - 06:00',
  '06:00 - 06:05', '06:05 - 06:10', '06:10 - 06:15', '06:15 - 06:20', '06:20 - 06:25',
  '06:25 - 06:30', '06:30 - 06:35', '06:35 - 06:40', '06:40 - 06:45', '06:45 - 06:50',
  '06:50 - 06:55', '06:55 - 07:00', '07:00 - 07:05', '07:05 - 07:10', '07:10 - 07:15',
  '07:15 - 07:20', '07:20 - 07:25', '07:25 - 07:30', '07:30 - 07:35', '07:35 - 07:40',
  '07:40 - 07:45', '07:45 - 07:50', '07:50 - 07:55', '07:55 - 08:00', '08:00 - 08:05',
  '08:05 - 08:10', '08:10 - 08:15', '08:15 - 08:20', '08:20 - 08:25', '08:25 - 08:30',
  '08:30 - 08:35', '08:35 - 08:40', '08:40 - 08:45', '08:45 - 08:50', '08:50 - 08:55',
  '08:55 - 09:00', '09:00 - 09:05', '09:05 - 09:10', '09:10 - 09:15', '09:15 - 09:20',
  '09:20 - 09:25', '09:25 - 09:30', '09:30 - 09:35', '09:35 - 09:40', '09:40 - 09:45',
  '09:45 - 09:50', '09:50 - 09:55', '09:55 - 10:00'
];

const NOISE_LEVEL_NORMAL_TIME_PERIODS = [
  '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
  '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
  '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00',
  '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00',
  '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '09:00 - 10:00',
  'Leq(24 hr)', 'Ldn', 'Lmax' // ค่าพิเศษที่ไม่ได้บ่งบอกช่วงเวลา
];

const NOISE_LEVEL_90_TIME_PERIODS = [
  '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
  '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
  '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00',
  '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00',
  '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '09:00 - 10:00',
  'average' // ค่าพิเศษที่ไม่ได้บ่งบอกช่วงเวลา
];

const SEA_WATER_PARAMETERS = [
  'Temperature', 'ph', 'Transparency', 'DO', 'Salinity', 'BOD', 'Floatable Oil and Grease', 'TDS'
];

const WASTE_WATER_PARAMETERS = [
  'Temperature', 'ph', 'BOD', 'COD', 'Oil & Grease', 'TDS', 'TSS'
];

const SO2_TIME_PERIODS = [
  '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
  '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
  '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00',
  '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00',
  '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00'
];

const VOCS_PARAMETERS = [
  'อะซิทัลดีไฮด์', 'อะครอลีน', 'อะคริโลไนไตรล์', 'เบนซีน', 'เบนซิลคลอไรด์', 'บิวทาไดอีน', 
  'โบรโมมีเธน', 'คาร์บอนไดซัลไฟด์', 'คาร์บอนเตตระคลอไรด์', 'ไดโบรโมอีเธน', 'ไดคลอโรเบนซีน', 
  'ไดคลอโรอีเธน', 'ไดคลอโรมีเธน', 'ไดคลอโรโพรเพน', 'ไดออกเซน', 'เตตระคลเอทธีลีน', 
  'เตตระคลอโรอีเธน', 'ไตรคลอโรเอทธีลีน', 'ไวนิลคลอไรด์'
];

const WIND_QUALITY_PARAMETERS = [
  'TSP (24hr)', 'PM-10 (24 hr)', 'SO2 (1 hr)', 'SO2 (24 hr)'
];

// Map table names to their ordered parameters
const TABLE_PARAMETER_MAPPING: Record<string, { column: string, values: string[] }> = {
  'WDWS': { column: 'windDirection', values: WIND_DIRECTIONS },
  'AirQuality': { column: 'index_name', values: AIR_QUALITY_INDICES },
  'Monitorresult': { column: 'timePeriod', values: NOISE_MONITOR_TIME_PERIODS },
  'NoiseLevelNormal': { column: 'timePeriod', values: NOISE_LEVEL_NORMAL_TIME_PERIODS },
  'NoiseLevel90': { column: 'timePeriod', values: NOISE_LEVEL_90_TIME_PERIODS },
  'SeaWater': { column: 'parameter', values: SEA_WATER_PARAMETERS },
  'WasteWater': { column: 'index_name', values: WASTE_WATER_PARAMETERS },
  'SO2': { column: 'timePeriod', values: SO2_TIME_PERIODS },
  'Vocs': { column: 'index_name', values: VOCS_PARAMETERS },
  'WindQuality': { column: 'parameter', values: WIND_QUALITY_PARAMETERS }
};

// Function to process ordered data for any table
const processOrderedData = (data: any[], xAxisColumn: string, valueColumn: string, tableName: string) => {
  // Get the parameter mapping for this table
  const parameterMapping = Object.entries(TABLE_PARAMETER_MAPPING).find(([key, _]) => 
    tableName.includes(key)
  );
  
  // If no mapping found or column doesn't match, return original data
  if (!parameterMapping || parameterMapping[1].column !== xAxisColumn) {
    return { 
      labels: data.map(item => item[xAxisColumn]), 
      values: data.map(item => item[valueColumn] || 0) 
    };
  }
  
  const [_, mapping] = parameterMapping;
  const orderedValues = mapping.values;
  
  // Create an object to hold aggregated values for each parameter
  const valueMap: Record<string, number> = {};
  
  // Initialize all parameters with zero
  orderedValues.forEach(param => {
    valueMap[param] = 0;
  });
  
  // Aggregate values for each parameter
  data.forEach(item => {
    const paramValue = item[xAxisColumn];
    if (orderedValues.includes(paramValue)) {
      valueMap[paramValue] += (item[valueColumn] || 0);
    }
  });
  
  // Convert back to arrays in the correct order
  return {
    labels: orderedValues,
    values: orderedValues.map(param => valueMap[param])
  };
};

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
      
      // Process data specially for radar, pie, or doughnut charts
      let columnData;
      if (chartType === 'radar' || chartType === 'pie' || chartType === 'doughnut') {
        // Get the table name from the subCategory filter
        const tableName = filters.subCategory || '';
        const processed = processOrderedData(data, xAxisColumn, column, tableName);
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