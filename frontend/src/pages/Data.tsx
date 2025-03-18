import Visualization from "@/components/main/Visualization";
import Table from "@/components/main/TableNC";

export default function Data() {
  return (
    <>
      <div id="visualization" className="py-25">
        <Visualization />
      </div>
      <div id="table">
        <Table />
      </div>
    </>
  );
}
