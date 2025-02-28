import Visualization from "@/components/main/Visualization";
import Table from "@/components/main/Table";
import Contact from "@/components/main/Contact";

export default function Home() {
  return (
    <>
      <div id="visualization">
        <Visualization />
      </div>
      <div id="table">
        <Table />
      </div>
      <div id="contact">
        <Contact />
      </div>
    </>
  );
}