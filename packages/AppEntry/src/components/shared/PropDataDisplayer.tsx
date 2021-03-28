import React, { useState } from "react";
import { JSONDisplayer, prepareData } from "./JsonDisplayer";

export const PropDataDisplayer = () => {
  const [data, setData] = useState({});
  React.useEffect(() => {
    prepareData().then((propData) => {
      setData(propData);
    });
  }, []);
  return <JSONDisplayer jsonData={data} />;
};
