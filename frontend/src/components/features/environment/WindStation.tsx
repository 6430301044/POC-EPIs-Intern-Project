import axios from "axios";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function WindStation() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/Env_Wind/WDWS")
      .then((response) => {
        console.log(response.data); // ตรวจสอบข้อมูลที่ได้รับจาก API
        setData(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart width={730} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="windDirection" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="ws_total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
