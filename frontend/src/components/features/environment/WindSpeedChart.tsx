import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

export default function WindSpeedChart() {
  const [data, setData] = useState([]);
  
    useEffect(() => {
      axios.get("http://localhost:5000/api/Env_Wind/WDWS")
        .then((response) => {
          console.log(response.data); // ตรวจสอบข้อมูลที่ได้รับจาก API
          setData(response.data);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="windDirection" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="ws_total" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
