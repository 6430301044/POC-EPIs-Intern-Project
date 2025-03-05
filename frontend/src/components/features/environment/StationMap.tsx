import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const stations = [
  { id: 1, name: "คลังก๊าซเขาบ่อยา", lat: 13.08890380160661, lon: 100.88010343718963 },
  { id: 2, name: "คลังน้ำมันศรีราชา", lat: 13.105264562305708, lon: 100.88809712209058 },
];

export default function StationMap() {
  return (
    <MapContainer center={[13.08890380160661, 100.88010343718963]} zoom={6} className="h-96 w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <Marker key={station.id} position={[station.lat, station.lon]}>
          <Popup>{station.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
