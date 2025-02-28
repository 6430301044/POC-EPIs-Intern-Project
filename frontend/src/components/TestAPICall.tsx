import { useEffect, useState } from "react";
// import { fetchWindData } from "../services/environmentService";
import { Container } from "./template/Container";

const TestAPICall = () => {
  const [data, setData] = useState<any[]>([]);

  // useEffect(() => {
  //   fetchWindData({ year: 2024 }).then(setData);
  // }, []);

  return (
    <>
      <Container>
        <div className="bg-white p-16 dark:bg-black">
          <h1>Test API Call</h1>
          <h2>Test API Call</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </Container>
    </>
  );
};

export default TestAPICall;
