import React from "react";
import { LoadingOutlined } from "@ant-design/icons";

export const LoadingTip = ({ size = "10" }) => (
  <div className="container mx-auto text-center py-10 text-gray-500">
    <LoadingOutlined className="text-6xl" />
    <div className={`py-${size}`}>Loading</div>
  </div>
);
