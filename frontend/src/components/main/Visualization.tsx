import axios from "axios";
import { useEffect, useState } from "react";
import { Container } from "../template/Container";
import { SectionTitle } from "../template/SectionTitle";
import WindSpeedChart from "../features/environment/WindSpeedChart";
import WindStation from "../features/environment/WindStation";
import StationMap from "../features/environment/StationMap";

export default function Visualization() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    averageWindSpeed: 0,
    maxWindSpeed: 0,
    monitoringStations: 0,
  });

  useEffect(() => {
    axios
      .get(
        "http://localhost:5000/api/Env_Wind/WDWS"
      )
      .then((response) => {
        console.log(response.data); // ตรวจสอบข้อมูลที่ได้รับจาก API
        setData(response.data);

        // คำนวณค่าเฉลี่ยและค่าสูงสุดของความเร็วลม
        const totalWindSpeed = response.data.reduce(
          (acc, item) => acc + item.ws_total,
          0
        );
        const maxWindSpeed = Math.max(
          ...response.data.map((item) => item.ws_total)
        );
        const averageWindSpeed = totalWindSpeed / response.data.length;
        const monitoringStations = response.data.length;

        setSummary({
          averageWindSpeed,
          maxWindSpeed,
          monitoringStations,
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <Container>
      <section className="w-full min-h-screen py-10" id="visualization">
        <div className="container mx-auto px-4">
          {/* Title */}
          <SectionTitle
            textPicture="📊"
            title="Data Visualization"
            align="center"
          />

          <h1 className="text-4xl font-bold text-center text-gray-800 mb-6 dark:text-white">
            Visualization of Wind Speed Data
          </h1>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-lg font-semibold text-gray-700">
                Average Wind Speed
              </h2>
              <p className="text-2xl font-bold text-blue-500">
                {summary.averageWindSpeed.toFixed(2)} m/s
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-lg font-semibold text-gray-700">
                Max Wind Speed
              </h2>
              <p className="text-2xl font-bold text-red-500">
                {summary.maxWindSpeed.toFixed(2)} m/s
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-lg font-semibold text-gray-700">
                Monitoring Stations
              </h2>
              <p className="text-2xl font-bold text-green-500">
                {summary.monitoringStations} Stations
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* Line Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">
                Wind Speed Over Time
              </h2>
              <WindSpeedChart data={data} />
            </div>

            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">
                Wind Speed by Station
              </h2>
              <WindStation data={data} />
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-10">
            <h2 className="text-lg font-semibold text-gray-700">
              Monitoring Stations Map
            </h2>
            <div className="h-96 z-0" id="map">
              <StationMap data={data} />
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}