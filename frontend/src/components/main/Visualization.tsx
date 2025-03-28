import { useState, useEffect, useMemo } from 'react';
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
  fetchColumnValues
} from '../../services/environmentService';
import { Line, Bar, Scatter, Pie, Radar } from 'react-chartjs-2';
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
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { get } from 'http';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

type ChartType = 'line' | 'bar' | 'scatter' | 'pie' | 'radar';

export default function Visualization() {

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

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Filter states
  const [mainCategories, setMainCategories] = useState<{ mainName: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ subName: string }[]>([]);
  const [stations, setStations] = useState<{ stationName: string }[]>([]);
  const [years, setYears] = useState<{ year: number }[]>([]);
  const [semiannualName, setSemiannualsName] = useState<{ semiannualName: string }[]>([]);
  
  // Column selection states
  const [columns, setColumns] = useState<string[]>([]);
  const [xAxisColumn, setXAxisColumn] = useState<string>("");
  const [yAxisColumn, setYAxisColumn] = useState<string>("");
  const [xAxisValues, setXAxisValues] = useState<any[]>([]);
  const [yAxisValues, setYAxisValues] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    mainCategory: "",
    subCategory: "",
    stationName: "",
    semiannualName: "",
    year: "",
  });

  // Chart customization states
  const [chartTitle, setChartTitle] = useState('การแสดงผลข้อมูลแบบกำหนดเอง');
  const [xAxisLabel, setXAxisLabel] = useState('แกน X');
  const [yAxisLabel, setYAxisLabel] = useState('แกน Y');
  const [showLegend, setShowLegend] = useState(true);
  const [chartColor, setChartColor] = useState('#4e73df');

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
      fetchSemiannuals(filters.mainCategory, filters.subCategory).then(setSemiannualsName);
      fetchColumns(filters.mainCategory, filters.subCategory).then(columns => {
        // Filter out non-data columns
        const dataColumns = columns.filter(col => 
          !['id', 'station_id', 'period_id', 'stationName', 'year', 'semiannual','semiannualName', 'createdAt', 'updatedAt'].includes(col)
        );
        setColumns(dataColumns);
      });
    } else {
      setStations([]);
      setYears([]);
      setSemiannualsName([]);
      setColumns([]);
    }
  }, [filters.mainCategory, filters.subCategory]);

  useEffect(() => {
    if (xAxisColumn && filters.mainCategory && filters.subCategory) {
      fetchColumnValues(filters.mainCategory, filters.subCategory, xAxisColumn).then(setXAxisValues);
    } else {
      setXAxisValues([]);
    }
  }, [xAxisColumn, filters.mainCategory, filters.subCategory]);

  useEffect(() => {
    if (yAxisColumn && filters.mainCategory && filters.subCategory) {
      fetchColumnValues(filters.mainCategory, filters.subCategory, yAxisColumn).then(setYAxisValues);
    } else {
      setYAxisValues([]);
    }
  }, [yAxisColumn, filters.mainCategory, filters.subCategory]);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      if (!filters.mainCategory || !filters.subCategory) {
        alert('⚠️ กรุณาเลือกประเภทข้อมูลให้ครบถ้วน');
        setLoading(false);
        return;
      }

      if (!xAxisColumn || !yAxisColumn) {
        alert('⚠️ กรุณาเลือกตัวแปรสำหรับแกน X และแกน Y');
        setLoading(false);
        return;
      }

      console.log('✅ Fetching data with filters:', filters);
      const result = await fetchEnvironmentalData(
        filters.mainCategory,
        filters.subCategory,
        {
          stationName: filters.stationName,
          semiannualName: filters.semiannualName,
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
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      alert('❌ เกิดข้อผิดพลาดในการดึงข้อมูล');
      setData([]);
    }
    setLoading(false);
  };

  // Function to sort data based on predefined order in TABLE_PARAMETER_MAPPING
  const sortDataByPredefinedOrder = (data: any[], xColumn: string) => {
    // Check if we have a predefined order for this table
    const tableName = filters.subCategory;
    
    // ตรวจสอบทั้งชื่อภาษาอังกฤษและภาษาไทย
    const orderConfig = TABLE_PARAMETER_MAPPING[tableName] || 
                        TABLE_PARAMETER_MAPPING[getTableIdentifier(tableName)];
    
    console.log("✅ sortDataByPredefinedOrder - tableName:", tableName);
    console.log("✅ sortDataByPredefinedOrder - orderConfig:", orderConfig);
    
    if (orderConfig && orderConfig.column === xColumn) {
      // Create a map for quick lookup of index positions
      const orderMap = new Map(orderConfig.values.map((value, index) => [value, index]));
      
      // Sort the data based on the predefined order
      return [...data].sort((a, b) => {
        const aValue = a[xColumn];
        const bValue = b[xColumn];
        
        // If both values are in our order map, sort by their positions
        if (orderMap.has(aValue) && orderMap.has(bValue)) {
          return orderMap.get(aValue)! - orderMap.get(bValue)!;
        }
        
        // If only one value is in our order map, prioritize it
        if (orderMap.has(aValue)) return -1;
        if (orderMap.has(bValue)) return 1;
        
        // If neither value is in our order map, maintain original order
        return 0;
      });
    }
    
    // If no predefined order, return the original data
    return data;
  };

  // ฟังก์ชันแมป `Sub Category` ภาษาไทยเป็น `Table Identifier`
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
    console.log("✅ getTableIdentifier - subCategory:", subCategory, "→", subCategoryMappingsIdentifier[subCategory]);
    return subCategoryMappingsIdentifier[subCategory] || subCategory;
  };

  //const getChartData = () => {
    const getChartData = () => {
        if (!data.length || !xAxisColumn || !yAxisColumn) return null;
    
        // Sort data based on predefined order if applicable
        const sortedData = sortDataByPredefinedOrder(data, xAxisColumn);
    
        // For radar chart, we need to structure data differently
        if (chartType === 'radar') {
          // Group data by a meaningful category (e.g., stationName)
          const groupedData: Record<string, Record<string, number>> = {};
          
          console.log("✅ Radar Chart Data:", sortedData);
          
          // สำหรับข้อมูลทิศทางและความเร็วลม (WDWS) ต้องจัดการพิเศษ
          if (filters.subCategory === "ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง" || 
              filters.subCategory === "WDWS") {
            
            console.log("✅ Processing Wind Direction and Speed Data");
            
            // สร้างชุดข้อมูลเดียวสำหรับความเร็วลมตามทิศทาง
            const windSpeedByDirection: Record<string, number> = {};
            
            // รวบรวมความเร็วลมตามทิศทาง
            sortedData.forEach(item => {
              const direction = item[xAxisColumn]; // windDirection
              const speed = parseFloat(item[yAxisColumn]) || 0; // windSpeed
              
              if (!windSpeedByDirection[direction]) {
                windSpeedByDirection[direction] = speed;
              } else {
                // ถ้ามีข้อมูลซ้ำ ให้ใช้ค่าเฉลี่ย
                windSpeedByDirection[direction] = (windSpeedByDirection[direction] + speed) / 2;
              }
            });
            
            // ใช้ทิศทางลมทั้งหมดเป็น labels
            const labels = WIND_DIRECTIONS;
            
            // สร้างชุดข้อมูลสำหรับความเร็วลม
            const datasets = [{
              label: 'ความเร็วลม (m/s)',
              data: labels.map(direction => windSpeedByDirection[direction] || 0),
              backgroundColor: `${chartColor}33`, // Add transparency
              borderColor: chartColor,
              borderWidth: 2,
              pointBackgroundColor: chartColor,
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: chartColor,
              fill: true
            }];
            
            return { labels, datasets };
          } else {
            // สำหรับข้อมูลอื่นๆ ใช้การประมวลผลแบบปกติ
            sortedData.forEach(item => {
              const categoryKey = item.stationName || 'Unknown';
              const xValue = item[xAxisColumn];
              
              if (!groupedData[categoryKey]) {
                groupedData[categoryKey] = {};
              }
              
              groupedData[categoryKey][xValue] = parseFloat(item[yAxisColumn]) || 0;
            });
            
            // Get all unique x values to use as radar chart labels
            let labels: string[];
            
            // Check if we have a predefined order for this table
            const tableName = filters.subCategory;
            const orderConfig = TABLE_PARAMETER_MAPPING[tableName] || 
                              TABLE_PARAMETER_MAPPING[getTableIdentifier(tableName)];
            
            if (orderConfig && orderConfig.column === xAxisColumn) {
              // Use the predefined order for labels
              // But filter to only include values that exist in our data
              const existingValues = new Set(sortedData.map(item => item[xAxisColumn]));
              labels = orderConfig.values.filter(value => existingValues.has(value));
            } else {
              // Use the values from the data
              labels = Array.from(new Set(sortedData.map(item => item[xAxisColumn])));
            }
            
            // Create datasets for each category
            const datasets = Object.entries(groupedData).map(([category, values], index) => {
              const color = `hsl(${index * 360 / Object.keys(groupedData).length}, 70%, 50%)`;
              return {
                label: category,
                data: labels.map(label => values[label] || 0),
                backgroundColor: `${color}33`, // Add transparency
                borderColor: color,
                borderWidth: 2,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: color,
              };
            });
            
            return { labels, datasets };
          }
        }
        
        // For other chart types
        let labels: any[];
        let values: any[];
        
        // Check if we have a predefined order for this table
        const tableName = filters.subCategory;
        const orderConfig = TABLE_PARAMETER_MAPPING[tableName];
        
        if (orderConfig && orderConfig.column === xAxisColumn) {
          // Use the predefined order for labels, but only include values that exist in our data
          const dataMap = new Map(sortedData.map(item => [item[xAxisColumn], item[yAxisColumn]]));
          const existingValues = new Set(sortedData.map(item => item[xAxisColumn]));
          
          // Filter to only include values that exist in our data
          const filteredOrderedValues = orderConfig.values.filter(value => existingValues.has(value));
          
          labels = filteredOrderedValues;
          values = filteredOrderedValues.map(label => dataMap.get(label) || 0);
        } else {
          // Use the values from the sorted data
          labels = sortedData.map(item => item[xAxisColumn]);
          values = sortedData.map(item => item[yAxisColumn]);
        }
        
        return {
          labels,
          datasets: [
            {
              label: yAxisColumn,
              data: values,
              backgroundColor: `${chartColor}80`, // Add transparency
              borderColor: chartColor,
              borderWidth: 1,
            },
          ],
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
        scales: chartType !== 'pie' && chartType !== 'radar' ? {
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
          case 'radar':
            return <Radar data={chartData} options={chartOptions} />;
          default:
            return null;
        }
      };

    return (
        <Container>
        <SectionTitle
            title="การแสดงผลข้อมูลแบบกำหนดเอง"
            preTitle="เลือกตัวแปรแกน X และแกน Y ได้อย่างอิสระ และเลือกประเภทกราฟที่ต้องการแสดงผล"
        />

        <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Main Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทหลัก</label>
                <Select
                options={mainCategories.map(cat => ({ value: cat.mainName, label: cat.mainName }))}
                onChange={(option) => setFilters({ ...filters, mainCategory: option?.value || "", subCategory: "" })}
                placeholder="เลือกประเภทหลัก"
                isClearable
                className="text-sm"
                />
            </div>

            {/* Sub Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทย่อย</label>
                <Select
                options={subCategories.map(cat => ({ value: cat.subName, label: cat.subName }))}
                onChange={(option) => setFilters({ ...filters, subCategory: option?.value || "" })}
                placeholder="เลือกประเภทย่อย"
                isDisabled={!filters.mainCategory}
                isClearable
                className="text-sm"
                />
            </div>

            {/* Station */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานี</label>
                <Select
                options={stations.map(station => ({ value: station.stationName, label: station.stationName }))}
                onChange={(option) => setFilters({ ...filters, stationName: option?.value || "" })}
                placeholder="เลือกสถานี (ไม่บังคับ)"
                isDisabled={!filters.subCategory}
                isClearable
                className="text-sm"
                />
            </div>

            {/* Year */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปี</label>
                <Select
                options={years.map(year => ({ value: year.year.toString(), label: year.year.toString() }))}
                onChange={(option) => setFilters({ ...filters, year: option?.value || "" })}
                placeholder="เลือกปี (ไม่บังคับ)"
                isDisabled={!filters.subCategory}
                isClearable
                className="text-sm"
                />
            </div>

            {/* Semiannual */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รอบการเก็บข้อมูล</label>
                <Select
                options={semiannualName.map(semi => ({ value: semi.semiannualName, label: semi.semiannualName }))}
                onChange={(option) => setFilters({ ...filters, semiannualName: option?.value || "" })}
                placeholder="เลือกรอบการเก็บข้อมูล (ไม่บังคับ)"
                isDisabled={!filters.subCategory}
                isClearable
                className="text-sm"
                />
            </div>

            {/* Chart Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทกราฟ</label>
                <Select
                options={[
                    { value: 'bar', label: 'กราฟแท่ง' },
                    { value: 'line', label: 'กราฟเส้น' },
                    { value: 'scatter', label: 'กราฟกระจาย' },
                    { value: 'pie', label: 'กราฟวงกลม' },
                    { value: 'radar', label: 'กราฟเรดาร์' },
                ]}
                onChange={(option) => setChartType(option?.value as ChartType || 'bar')}
                defaultValue={{ value: 'bar', label: 'กราฟแท่ง' }}
                className="text-sm"
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* X-Axis Column */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตัวแปรแกน X</label>
                <Select
                options={columns.map(col => ({ value: col, label: col }))}
                onChange={(option) => setXAxisColumn(option?.value || "")}
                placeholder="เลือกตัวแปรสำหรับแกน X"
                isDisabled={!filters.subCategory}
                isClearable
                className="text-sm"
                />
            </div>

            {/* Y-Axis Column */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตัวแปรแกน Y</label>
                <Select
                options={columns.map(col => ({ value: col, label: col }))}
                onChange={(option) => setYAxisColumn(option?.value || "")}
                placeholder="เลือกตัวแปรสำหรับแกน Y"
                isDisabled={!filters.subCategory}
                isClearable
                className="text-sm"
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Chart Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกราฟ</label>
                <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="ชื่อกราฟ"
                />
            </div>

            {/* X-Axis Label */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแกน X</label>
                <input
                type="text"
                value={xAxisLabel}
                onChange={(e) => setXAxisLabel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="ชื่อแกน X"
                />
            </div>

            {/* Y-Axis Label */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแกน Y</label>
                <input
                type="text"
                value={yAxisLabel}
                onChange={(e) => setYAxisLabel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="ชื่อแกน Y"
                />
            </div>

            {/* Chart Color */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สีกราฟ</label>
                <input
                type="color"
                value={chartColor}
                onChange={(e) => setChartColor(e.target.value)}
                className="w-full p-1 h-10 border border-gray-300 rounded-md"
                />
            </div>
            </div>

            <div className="flex justify-center mb-6">
            <button
                onClick={handleFetchData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
                {loading ? 'กำลังโหลด...' : 'แสดงผลข้อมูล'}
            </button>
            </div>

            {/* Show/Hide Legend */}
            <div className="flex items-center justify-center mb-6">
            <input
                type="checkbox"
                id="showLegend"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="mr-2"
            />
            <label htmlFor="showLegend" className="text-sm text-gray-700">แสดงคำอธิบาย</label>
            </div>

            {/* Chart Display */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {data.length > 0 ? (
                renderChart()
            ) : (
                <div className="text-center py-10 text-gray-500">
                เลือกตัวกรองและกดปุ่ม "แสดงผลข้อมูล" เพื่อแสดงกราฟ
                </div>
            )}
            </div>
        </div>
        </Container>
  );
}
